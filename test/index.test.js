const GxCertWriter = require("../index");
const Web3 = require("web3");
const web3 = new Web3("http://localhost:7545");
const alice = web3.eth.accounts.create();
const bob = web3.eth.accounts.create();
const charlie = web3.eth.accounts.create();
const dave = web3.eth.accounts.create();
const contractAddress = "0x2d0059214A0c5D4117F630Ab5C5cDf412Cc45f1e";
const writer = new GxCertWriter(web3, contractAddress, charlie.privateKey.slice(2));
const GxCertClient = require("gxcert-lib");
const client = new GxCertClient(web3);
const assert = require("assert");

let groupId;

describe("GxCertWriter", () => {
  describe("Group", () => {
    it("create group", async () => {
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
      groupId = (await client.getGroupIds(alice.address))[0];
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
      assert.ok();
    });
  });

});
