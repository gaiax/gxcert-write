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
const contractAddress = "0x14B7c79b358Dd04c6c2E11a019FB84Ec3913a407";
const writer = new GxCertWriter(web3, contractAddress, privateKey, common);
const GxCertClient = require("gxcert-lib");
const client = new GxCertClient(web3, contractAddress);
const assert = require("assert");

let groupId;

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
        name: "user1",
        email: "takuto@example.com",
      }
      const signedProfile = await client.signProfile(profile, { privateKey: alice.privateKey });
      try {
        await writer.createProfile(charlie.address, signedProfile);
      } catch(err) {
        console.error(err);
        assert.fail();
        return;
      }
    });
  });
  describe("Group", () => {
    it("create group", async function() {
      this.timeout(20 * 1000);
      const group = {
        name: "group1",
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
      assert.equal(group.member, _group.members[0]);
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
  });
  describe("write", () => {
    it("createCert", async function () {
      this.timeout(20 * 1000);
      const certificate = {
        context: {},
        from: alice.address,
        to: bob.address,
        issued_at: (new Date()).getTime(),
        title: "title",
        description: "description",
        image: "image",
        url: "https://example.com",
        groupId,
      }
      const signedObject = await client.signCertificate(certificate, alice.privateKey);
      try {
        await writer.write(charlie.address, signedObject);
      } catch(err) {
        console.error(err);
        assert.fail();
        return;
      }
    });
  });

});
