const GxCertWriter = require("../index");
const Web3 = require("web3");
const web3 = new Web3("http://localhost:7545");
const alice = web3.eth.accounts.create();
const bob = web3.eth.accounts.create();
const charlie = web3.eth.accounts.create();
const contractAddress = "0xB16070e105567515FCA925eD621229DDc75815B7";
const writer = new GxCertWriter(web3, contractAddress, charlie.privateKey.slice(2));
const GxCertClient = require("gxcert-lib");
const client = new GxCertClient(web3);
const assert = require("assert");

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
      const signedObject = await client.signCertificate(alice.privateKey, certificate);
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
