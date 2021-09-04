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
}
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
const contractAddress = "0xEbeD13ee7b74Fb9c0dA30A980D3C579B6cAB9A37";
const writer = new GxCertWriter(web3, contractAddress, privateKey, common);
const GxCertClient = require("gxcert-lib");
const client = new GxCertClient(web3, contractAddress);
const assert = require("assert");

let groupId;
let certId;

describe("GxCertWriter", () => {
  it ("init", async function () {
    this.timeout(20 * 1000);
    await writer.init();
    await client.init();
  });
  describe("Profile", () => {
    it ("create profile", async function() {
      this.timeout(20 * 1000);
      const profile = {
        name: "alice",
        email: "alice@example.com",
        icon: "icon",
      }
      const signedProfile = await client.signProfile(profile, { privateKey: alice.privateKey });
      try {
        await writer.createProfile(charlie.address, alice.address, signedProfile);
      } catch(err) {
        console.error(err);
        assert.fail();
        return;
      }
      let _profile;
      try {
        _profile = await client.getProfile(alice.address);
      } catch(err) {
        console.error(err);
        assert.fail();
      }
      assert.equal(_profile.name, profile.name);
      assert.equal(_profile.email, profile.email);
      assert.equal(_profile.icon, profile.icon);
    });
  });
  describe("Group", () => {
    it("create group", async function() {
      this.timeout(20 * 1000);
      const group = {
        name: "group1",
        residence: "residence",
        phone: "phone",
        member: alice.address,
      }
      try {
        await writer.createGroup(charlie.address, group);
      } catch(err) {
        console.error(err);
        assert.fail();
        return;
      }
      const _group = (await client.getGroups(alice.address))[0];
      assert.equal(group.name, _group.name);
      assert.equal(group.residence, _group.residence);
      assert.equal(group.phone, _group.phone);
      assert.equal(group.member, _group.members[0].address);
      assert.equal("alice", _group.members[0].name);
      groupId = _group.groupId;
    });
    it ("invite member to group by wrong sign", async function () {
      this.timeout(20 * 1000);
      const signedAddress = await client.signMemberAddress(dave.address, { privateKey: bob.privateKey});
      try {
        await writer.inviteMemberToGroup(charlie.address, groupId, signedAddress);
        assert.fail();
      } catch(err) {

      }
    });
    it ("invite member to group", async function () {
      this.timeout(20 * 1000);
      const signedAddress = await client.signMemberAddress(dave.address, { privateKey: alice.privateKey });
      await writer.inviteMemberToGroup(charlie.address, groupId, signedAddress);
      const group = (await client.getGroups(dave.address))[0];
      assert.equal(group.name, "group1");
      assert.equal(group.members[0].name, "alice");
      assert.equal(group.members[0].address, alice.address);
      assert.equal(group.members[1].name, "");
      assert.equal(group.members[1].address, dave.address);
    });
    it ("invite same member to group", async function() { 
      this.timeout(20 * 1000);
      const signedAddress = await client.signMemberAddress(dave.address, { privateKey: alice.privateKey });
      try {
        await writer.inviteMemberToGroup(charlie.address, groupId, signedAddress);
        assert.fail();
      } catch(err) {
        
      }
    });
    it ("disable group member", async function() {
      this.timeout(20 * 1000);
      const signedAddress = await client.signMemberAddress(dave.address, { privateKey: alice.privateKey });
      try {
        await writer.disableGroupMember(charlie.address, groupId, signedAddress);
      } catch(err) {
        console.error(err);
        assert.fail();
        return;
      }
      let group;
      try {
        group = await client.getGroup(groupId);
      } catch(err) {
        console.error(err);
        assert.fail();
        return;
      }
      assert.equal(group.members.length, 1);
      assert.equal(group.members[0].name, "alice");
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
      }
      const signedCertificate = await client.signCertificate(certificate, { privateKey: alice.privateKey });
      try {
        await writer.createCert(charlie.address, signedCertificate);
      } catch(err) {
        console.error(err);
        assert.fail();
        return;
      }
      const certificates = await client.getGroupCerts(groupId);
      assert.equal(certificates.length, 1);
      certId = certificates[0].id;
    });
  });

  describe("User Cert", () => {
    it("createUserCert", async function() {
      this.timeout(20 * 1000);
      const userCert = {
        certId,
        from: alice.address,
        to: bob.address,
      }
      const signedUserCertificate = await client.signUserCertificate(userCert, { privateKey: alice.privateKey });
      try {
        await writer.createUserCert(charlie.address, signedUserCertificate);
      } catch(err) {
        console.error(err);
        assert.fail();
      }
      const userCerts = await client.getIssuedUserCerts(certId);
      assert.equal(userCerts.length, 1);
      assert.equal(userCerts[0].certificate.id, certId);
      assert.equal(userCerts[0].from, userCert.from);
      assert.equal(userCerts[0].to, userCert.to);
    });
    it("createUserCerts", async function() {
      this.timeout(20 * 1000);
      const userCert = {
        certId,
        from: alice.address,
        to: bob.address,
      }
      const signedUserCertificate = await client.signUserCertificate(userCert, { privateKey: alice.privateKey });
      const signedUserCertificates = [];
      for (let i = 0; i < 5; i++) {
        signedUserCertificates.push(signedUserCertificate);
      }
      
      try {
        await writer.createUserCerts(charlie.address, signedUserCertificates);
      } catch(err) {
        console.error(err);
        assert.fail();
        return;
      }
      const userCerts = await client.getIssuedUserCerts(certId);
      assert.equal(userCerts.length, 6);
      for (let i = 0; i < 5; i++) {
        assert.equal(userCerts[i].certificate.id, certId);
        assert.equal(userCerts[i].from, userCert.from);
        assert.equal(userCerts[i].to, userCert.to);
      }
    });
  });

});
