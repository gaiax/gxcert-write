const Web3 = require("web3");
const EthereumTx = require("ethereumjs-tx").Transaction;
const Common = require("ethereumjs-common").default;
const abi = require("./abi.json");

class GxCertWriter {
  constructor(web3, contractAddress, privateKey, common) {
    this.web3 = web3;
    this.contractAddress = contractAddress;
    this.common = common;
    this.privateKey = privateKey;
  }
  async init() {
    this.contract = await new web3.eth.Contract(abi, contractAddress);
  }
  async write(writerAddress, signedObject) {
    const data = this.contract.methods.createCert(signedObject.certificate.from, signedObject.certificate.to, signedObject.cid, signedObject.signature.signature, signedObject.cidHash).encodeABI();
    const nonce = await web3.eth.getTransactionCount(writerAddress, "pending");
    const gasPrice = await web3.eth.getGasPrice();
    const gasEstimate = await contract.methods.createCert(signedObject.certificate.from, signedObject.certificate.to, signedObject.cid, signedObject.signature.signature, signedObject.cidHash).estimateGas({ from: writerAddress });
    const details = {
      nonce: web3.utils.toHex(nonce),
      gasPrice: web3.utils.toHex(gasPrice),
      gasLimit: web3.utils.toHex(gasEstimate),
      to: contractAddress,
      from: writerAddress,
      data
    }

    const transaction = await new EthereumTx(details, { common });
    transaction.sign(Buffer.from(privateKey, "hex"));
    const rawData = "0x" + transaction.serialize().toString("hex");
    await web3.eth.sendSignedTransaction(rawData).on("receipt", (receipt) => {
      console.log(receipt);
    });
  }
}
