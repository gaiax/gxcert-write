const EthereumTx = require("ethereumjs-tx").Transaction;
const Common = require("ethereumjs-common").default;
const fs = require("fs");
const abi = JSON.parse(fs.readFileSync(__dirname + "/abi.json", "utf8"));

class GxCertWriter {
  constructor(web3, contractAddress, privateKey, common) {
    this.web3 = web3;
    this.contractAddress = contractAddress;
    this.privateKey = privateKey;
    this.common = common;
  }
  async init() {
    this.contract = await new this.web3.eth.Contract(abi, this.contractAddress);
  }
  async createProfile(writerAddress, userAddress, signedProfile) {
    const data = this.contract.methods.createProfile(
      userAddress, 
      signedProfile.profile.name, 
      signedProfile.profile.email, 
      signedProfile.nameSignature, 
      signedProfile.emailSignature
    ).encodeABI();
    const nonce = await this.web3.eth.getTransactionCount(writerAddress, "pending");
    const gasPrice = await this.web3.eth.getGasPrice();
    const gasEstimate = await this.contract.methods.createProfile(
      userAddress, 
      signedProfile.profile.name, 
      signedProfile.profile.email, 
      signedProfile.nameSignature, 
      signedProfile.emailSignature
    ).estimateGas({
      from: writerAddress,
    });
    const details = {
      nonce: this.web3.utils.toHex(nonce),
      gasPrice: this.web3.utils.toHex(gasPrice),
      gasLimit: this.web3.utils.toHex(gasEstimate),
      to: this.contractAddress,
      from: writerAddress,
      data
    }

    const transaction = await new EthereumTx(details, { common: this.common });
    transaction.sign(Buffer.from(this.privateKey, "hex"));
    const rawData = "0x" + transaction.serialize().toString("hex");
    await this.web3.eth.sendSignedTransaction(rawData).on("receipt", (receipt) => {
      console.log(receipt);
    });
  }
  async createGroup(writerAddress, group) {
    const data = this.contract.methods.createGroup(group.name, group.member.name, group.member.address).encodeABI();
    const nonce = await this.web3.eth.getTransactionCount(writerAddress, "pending");
    const gasPrice = await this.web3.eth.getGasPrice();
    const gasEstimate = await this.contract.methods.createGroup(group.name, group.member.name, group.member.address).estimateGas({
      from: writerAddress,
    });
    const details = {
      nonce: this.web3.utils.toHex(nonce),
      gasPrice: this.web3.utils.toHex(gasPrice),
      gasLimit: this.web3.utils.toHex(gasEstimate),
      to: this.contractAddress,
      from: writerAddress,
      data
    }

    const transaction = await new EthereumTx(details, { common: this.common });
    transaction.sign(Buffer.from(this.privateKey, "hex"));
    const rawData = "0x" + transaction.serialize().toString("hex");
    await this.web3.eth.sendSignedTransaction(rawData).on("receipt", (receipt) => {
      console.log(receipt);
    });
  }
  async inviteMemberToGroup(writerAddress, groupId, signedMember) {
    const data = this.contract.methods.inviteMemberToGroup(groupId, signedMember.name, signedMember.address, signedMember.nameSignature, signedMember.addressSignature).encodeABI();
    const nonce = await this.web3.eth.getTransactionCount(writerAddress, "pending");
    const gasPrice = await this.web3.eth.getGasPrice();
    const gasEstimate = await this.contract.methods.inviteMemberToGroup(groupId, signedMember.name, signedMember.address, signedMember.nameSignature, signedMember.addressSignature).estimateGas({
      from: writerAddress,
    });
    const details = {
      nonce: this.web3.utils.toHex(nonce),
      gasPrice: this.web3.utils.toHex(gasPrice),
      gasLimit: this.web3.utils.toHex(gasEstimate),
      to: this.contractAddress,
      from: writerAddress,
      data
    }

    const transaction = await new EthereumTx(details, { common: this.common });
    transaction.sign(Buffer.from(this.privateKey, "hex"));
    const rawData = "0x" + transaction.serialize().toString("hex");
    await this.web3.eth.sendSignedTransaction(rawData).on("receipt", (receipt) => {
      console.log(receipt);
    });
  }
  async write(writerAddress, signedObject) {
    const data = this.contract.methods.createCert(signedObject.certificate.groupId, signedObject.certificate.to, signedObject.cid, signedObject.signature).encodeABI();
    const nonce = await this.web3.eth.getTransactionCount(writerAddress, "pending");
    const gasPrice = await this.web3.eth.getGasPrice();
    const gasEstimate = await this.contract.methods.createCert(signedObject.certificate.groupId, signedObject.certificate.to, signedObject.cid, signedObject.signature).estimateGas({ from: writerAddress });
    const details = {
      nonce: this.web3.utils.toHex(nonce),
      gasPrice: this.web3.utils.toHex(gasPrice),
      gasLimit: this.web3.utils.toHex(gasEstimate),
      to: this.contractAddress,
      from: writerAddress,
      data
    }

    const transaction = await new EthereumTx(details, { common: this.common });
    transaction.sign(Buffer.from(this.privateKey, "hex"));
    const rawData = "0x" + transaction.serialize().toString("hex");
    await this.web3.eth.sendSignedTransaction(rawData).on("receipt", (receipt) => {
      console.log(receipt);
    });
  }
}

module.exports = GxCertWriter;
