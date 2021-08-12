const EthereumTx = require("ethereumjs-tx").Transaction;
const Common = require("ethereumjs-common").default;
const fs = require("fs");
const abi = JSON.parse(fs.readFileSync(__dirname + "/abi.json", "utf8"));

class GxCertWriter {
  constructor(web3, contractAddress, privateKey, chainId) {
    this.web3 = web3;
    this.contractAddress = contractAddress;
    this.privateKey = privateKey;
    if (chainId === undefined || chainId === null) {
      this.chainId = 1337;
    } else {
      this.chainId = chainId;
    }
  }
  async init() {
    this.contract = await new this.web3.eth.Contract(abi, this.contractAddress);
  }
  async write(writerAddress, signedObject) {
    console.log(signedObject.certificate.from, signedObject.certificate.to, signedObject.cid, signedObject.signature, signedObject.cidHash);
    const data = this.contract.methods.createCert(signedObject.certificate.from, signedObject.certificate.to, signedObject.cid, signedObject.signature, signedObject.cidHash).encodeABI();
    const nonce = await this.web3.eth.getTransactionCount(writerAddress, "pending");
    const gasPrice = await this.web3.eth.getGasPrice();
    const gasEstimate = await this.contract.methods.createCert(signedObject.certificate.from, signedObject.certificate.to, signedObject.cid, signedObject.signature, signedObject.cidHash).estimateGas({ from: writerAddress });
    const details = {
      nonce: this.web3.utils.toHex(nonce),
      gasPrice: this.web3.utils.toHex(gasPrice),
      gasLimit: this.web3.utils.toHex(gasEstimate),
      to: this.contractAddress,
      from: writerAddress,
      chainId: this.chainId,
      data
    }

    const transaction = await new EthereumTx(details);
    transaction.sign(Buffer.from(this.privateKey, "hex"));
    const rawData = "0x" + transaction.serialize().toString("hex");
    await this.web3.eth.sendSignedTransaction(rawData).on("receipt", (receipt) => {
      console.log(receipt);
    });
  }
}

module.exports = GxCertWriter;
