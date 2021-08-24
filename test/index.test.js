const GxCertWriter = require("../index");
const Web3 = require("web3");
const web3 = new Web3("http://localhost:7545");
const alice = web3.eth.accounts.create();
const bob = web3.eth.accounts.create();
const charlie = web3.eth.accounts.create();
const dave = web3.eth.accounts.create();
const contractAddress = "0xB16070e105567515FCA925eD621229DDc75815B7";
const writer = new GxCertWriter(web3, contractAddress, charlie.privateKey.slice(2));
const GxCertClient = require("gxcert-lib");
const client = new GxCertClient(web3);
const assert = require("assert");
const expect = require("chai");

let groupId;

describe("GxCertWriter", () => {
  describe("write", () => {
    it("createCert", async () => {
      await writer.init();
      await client.init();
      const certificate = {
        context: {},
        from: alice.address,
        to: bob.address,
        issued_at: (new Date()).getTime(),
        title: "title",
        description: "description",
        image: "image",
        url: "https://example.com",
      }
      const signedObject = await client.signCertificate(certificate, alice.privateKey);
      try {
        await writer.write(charlie.address, signedObject);
      } catch(err) {
        console.error(err);
        assert.fail();
        return;
      }
      assert.ok();
    });
  });

  describe("Group", () => {
    it("create group", async () => {
      const group = {
        name: "group1",
        member: alice.address,
      }
      try {
        groupId = await writer.createGroup(charlie.address, group);
      } catch(err) {
        console.error(err);
        assert.fail();
        return;
      }
      assert.equal(groupId >= 0, true);
    });
    it ("invite member to group by wrong sign", async () => {
      const signedAddress = await client.signMemberAddress(dave.address, bob.privateKey);
      try {
        await writer.inviteMemberToGroup(groupId, signedAddress);
        assert.fail();
      } catch(err) {

      }
    });
    it ("invite member to group", async () => {
      const signedAddress = await client.signMemberAddress(dave.address, alice.privateKey);
      await writer.inviteMemberToGroup(groupId, signedAddress);
    });
    it ("invite same member to group", async () => {
      const signedAddress = await client.signMemberAddress(dave.address, alice.privateKey);
      try {
        await writer.inviteMemberToGroup(groupId, signedAddress);
        assert.fail();
      } catch(err) {
        
      }
    });
  });
});
