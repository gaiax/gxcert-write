const GxCertWriter = require("../index");
const Web3 = require("web3");
const web3 = new Web3("https://matic-mumbai.chainstacklabs.com");
const alice = web3.eth.accounts.create();
const bob = web3.eth.accounts.create();
const fs = require("fs");
const privateKey = fs.readFileSync(__dirname + "/../.privkey", "utf8").trim();
const charlie = {
  address: "0x4e3911c111bBEb8d254708Fb556e4A09C475A87E",
  privateKey,
};
const Common = require("ethereumjs-common").default;
const common = Common.forCustomChain(
  "mainnet",
  {
    name: "customchain",
    chainId: 80001,
  },
  "petersburg"
);
web3.eth.accounts.privateKeyToAccount(privateKey);
const dave = web3.eth.accounts.create();
const contractAddress = "0x93A62c0bDF73cB2843453daA55890E5f4Fae2A57";
const writer = new GxCertWriter(web3, contractAddress, privateKey, common);
const GxCertClient = require("gxcert-lib");
const client = new GxCertClient(web3, contractAddress, null,
  {
    host: "ipfs.gaiax-blockchain.com",
    port: 5001,
    protocol: "http",
  },
  "http://ipfs.gaiax-blockchain.com:8080/ipfs"
);
const assert = require("assert");

let groupId;
let certId;
let userCertId;

let validProfile = {
  name: "alice",
  icon: "icon",
};

describe("GxCertWriter", () => {
  it("init", async function () {
    this.timeout(20 * 1000);
    await writer.init();
    await client.init();
  });
  describe("Profile", () => {
    it("create profile", async function () {
      this.timeout(20 * 1000);
      const signedProfile = await client.signProfile(validProfile, {
        privateKey: alice.privateKey,
      });
      try {
        await writer.createProfile(
          charlie.address,
          alice.address,
          signedProfile
        );
      } catch (err) {
        console.error(err);
        assert.fail();
        return;
      }
    });
    it ("get profile", async function() {
      this.timeout(20 * 1000);
      let profile;
      try {
        profile = await client.getProfile(alice.address);
      } catch (err) {
        console.error(err);
        assert.fail();
        return;
      }
      assert.equal(profile.name, validProfile.name);
      assert.equal(profile.icon, validProfile.icon);
    });
    it("update profile", async function () {
      this.timeout(20 * 1000);
      const newProfile = {
        name: "alice2",
        icon: "icon2",
      };
      const signedProfile = await client.signProfileForUpdating(newProfile, {
        privateKey: alice.privateKey,
      });
      try {
        await writer.updateProfile(charlie.address, signedProfile);
      } catch (err) {
        console.error(err);
        assert.fail();
        return;
      }

      let profile;
      try {
        profile = await client.getProfile(alice.address);
      } catch (err) {
        console.error(err);
        assert.fail();
      }
      assert.equal(profile.name, newProfile.name);
      assert.equal(profile.icon, newProfile.icon);
      validProfile = newProfile;
    });
  });
  describe("Group", () => {
    const group = {
      name: "group1",
      residence: "residence",
      phone: "phone",
    };
    it("create group", async function () {
      this.timeout(20 * 1000);
      const signedGroup = await client.signGroup(group, {
        privateKey: alice.privateKey,
      });
      try {
        await writer.createGroup(charlie.address, alice.address, signedGroup);
      } catch (err) {
        console.error(err);
        assert.fail();
        return;
      }
    });

    it ("get group", async function() {
      this.timeout(20 * 1000);
      const _group = (await client.getGroups(alice.address))[0];
      assert.equal(group.name, _group.name);
      assert.equal(group.residence, _group.residence);
      assert.equal(group.phone, _group.phone);
      assert.equal(alice.address, _group.members[0].address);
      assert.equal(validProfile.name, _group.members[0].name);
      groupId = _group.groupId;
    });
    it("invite member to group by wrong sign", async function () {
      this.timeout(20 * 1000);
      const signedAddress = await client.signMemberAddressForInviting(
        dave.address,
        { privateKey: bob.privateKey }
      );
      try {
        await writer.inviteMemberToGroup(
          charlie.address,
          groupId,
          signedAddress
        );
        assert.fail();
      } catch (err) {
        console.error(err);
      }
    });
    it("invite member to group", async function () {
      this.timeout(20 * 1000);
      const signedAddress = await client.signMemberAddressForInviting(
        dave.address,
        { privateKey: alice.privateKey }
      );
      await writer.inviteMemberToGroup(charlie.address, groupId, signedAddress);
    });
    it ("get group after inviting", async function() {
      const group = (await client.getGroups(dave.address))[0];
      assert.equal(group.name, "group1");
      assert.equal(group.members[0].name, validProfile.name);
      assert.equal(group.members[0].address, alice.address);
      assert.equal(group.members[1].name, "");
      assert.equal(group.members[1].address, dave.address);
    });
    it("invite same member to group", async function () {
      this.timeout(20 * 1000);
      const signedAddress = await client.signMemberAddressForInviting(
        dave.address,
        { privateKey: alice.privateKey }
      );
      try {
        await writer.inviteMemberToGroup(
          charlie.address,
          groupId,
          signedAddress
        );
        assert.fail();
      } catch (err) {
        console.error(err);
      }
    });
    it("disable group member", async function () {
      this.timeout(20 * 1000);
      const signedAddress = await client.signMemberAddressForDisabling(
        dave.address,
        { privateKey: alice.privateKey }
      );
      try {
        await writer.disableGroupMember(
          charlie.address,
          groupId,
          signedAddress
        );
      } catch (err) {
        console.error(err);
        assert.fail();
        return;
      }
    });

    it ("get group members after disabling", async function() {
      let group;
      try {
        group = await client.getGroup(groupId);
      } catch (err) {
        console.error(err);
        assert.fail();
        return;
      }
      assert.equal(group.members.length, 1);
      assert.equal(group.members[0].name, validProfile.name);
    });
    const newGroup = {
      name: "name2",
      residence: "residence2",
      phone: "phone2",
    };
    it("update group", async function () {
      newGroup.groupId = groupId;
      this.timeout(20 * 1000);
      const signedGroup = await client.signGroupForUpdating(newGroup, {
        privateKey: alice.privateKey,
      });
      try {
        await writer.updateGroup(
          charlie.address, 
          signedGroup
        );
      } catch (err) {
        console.error(err);
        assert.fail();
        return;
      }
    });
    it ("get group after updating", async function() {
      let group;
      try {
        group = await client.getGroup(groupId);
      } catch (err) {
        console.error(err);
        assert.fail();
      }
      assert.equal(group.groupId, newGroup.groupId);
      assert.equal(group.name, newGroup.name);
      assert.equal(group.residence, newGroup.residence);
      assert.equal(group.phone, newGroup.phone);
    });
  });
  describe("Cert", () => {
    it("createCert", async function () {
      this.timeout(20 * 1000);
      const certificate = {
        context: {},
        title: "title",
        description: "description",
        image: "image",
        groupId,
      };
      const signedCertificate = await client.signCertificate(certificate, {
        privateKey: alice.privateKey,
      });
      try {
        await writer.createCert(charlie.address, signedCertificate);
      } catch (err) {
        console.error(err);
        assert.fail();
        return;
      }
    });

    it ("get group certs", async function() {
      this.timeout(20 * 1000);
      const certificates = await client.getGroupCerts(groupId);
      assert.equal(certificates.length, 1);
      certId = parseInt(certificates[0].certId);
    });
  });

  describe("User Cert", () => {
    it("createUserCert", async function () {
      this.timeout(20 * 1000);
      const userCert = {
        certId,
        from: alice.address,
        to: bob.address,
      };
      const signedUserCertificate = await client.signUserCertificate(userCert, {
        privateKey: alice.privateKey,
      });
      try {
        await writer.createUserCert(charlie.address, signedUserCertificate);
      } catch (err) {
        console.error(err);
        assert.fail();
      }
      const userCerts = await client.getIssuedUserCerts(certId);
      assert.equal(userCerts.length, 1);
      userCertId = parseInt(userCerts[0].userCertId);
      assert.equal(userCerts[0].from, userCert.from);
      assert.equal(userCerts[0].to, userCert.to);
    });
    it("createUserCerts", async function () {
      this.timeout(20 * 1000);
      const tos = [];
      for (let i = 0; i < 5; i++) {
        tos.push(bob.address);
      }
      const signed = await client.signUserCertificates(
        certId,
        alice.address,
        tos,
        { privateKey: alice.privateKey }
      );

      try {
        await writer.createUserCerts(charlie.address, signed);
      } catch (err) {
        console.error(err);
        assert.fail();
        return;
      }
      const userCerts = await client.getIssuedUserCerts(certId);
      assert.equal(userCerts.length, 6);
      for (let i = 0; i < 5; i++) {
        assert.equal(userCerts[i].from, alice.address);
        assert.equal(userCerts[i].to, bob.address);
      }
    });
    it("invalidateUserCert", async function () {
      this.timeout(100 * 1000);
      const signedUserCertificate = await client.signUserCertForInvalidation(
        userCertId,
        { privateKey: alice.privateKey }
      );
      try {
        await writer.invalidateUserCert(charlie.address, signedUserCertificate);
      } catch (err) {
        console.error(err);
        assert.fail();
        return;
      }
      const userCerts = await client.getIssuedUserCerts(certId);
      assert.equal(userCerts.length, 5);
    });
  });
});
