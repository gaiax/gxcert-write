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
      signedProfile.profile.icon,
      signedProfile.signature, 
    ).encodeABI();
    const nonce = await this.web3.eth.getTransactionCount(writerAddress, "pending");
    const gasPrice = await this.web3.eth.getGasPrice();
    const gasEstimate = await this.contract.methods.createProfile(
      userAddress, 
      signedProfile.profile.name, 
      signedProfile.profile.email, 
      signedProfile.profile.icon,
      signedProfile.signature,
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
    const data = this.contract.methods.createGroup(group.name, group.residence, group.phone, group.member).encodeABI();
    const nonce = await this.web3.eth.getTransactionCount(writerAddress, "pending");
    const gasPrice = await this.web3.eth.getGasPrice();
    const gasEstimate = await this.contract.methods.createGroup(group.name, group.residence, group.phone, group.member).estimateGas({
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
  async disableGroupMember(writerAddress, groupId, signedMember) {
    const data = this.contract.methods.disableGroupMember(groupId, signedMember.address, signedMember.signature).encodeABI();
    const nonce = await this.web3.eth.getTransactionCount(writerAddress, "pending");
    const gasPrice = await this.web3.eth.getGasPrice();
    const gasEstimate = await this.contract.methods.disableGroupMember(groupId, signedMember.address, signedMember.signature).estimateGas({
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
    const data = this.contract.methods.inviteMemberToGroup(groupId, signedMember.address, signedMember.signature).encodeABI();
    const nonce = await this.web3.eth.getTransactionCount(writerAddress, "pending");
    const gasPrice = await this.web3.eth.getGasPrice();
    const gasEstimate = await this.contract.methods.inviteMemberToGroup(groupId, signedMember.address, signedMember.signature).estimateGas({
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

  async createUserCerts(writerAddress, signedObjects) {
    const certIds = [];
    const froms = [];
    const tos = [];
    const signatures = [];
    for (const signedObject of signedObjects) {
      certIds.push(signedObject.userCertificate.certId);
      froms.push(signedObject.userCertificate.from);
      tos.push(signedObject.userCertificate.to);
      signatures.push(signedObject.signature);
    }
    const data = this.contract.methods.createUserCerts(certIds, froms, tos, signatures).encodeABI();
    const nonce = await this.web3.eth.getTransactionCount(writerAddress, "pending");
    const gasPrice = await this.web3.eth.getGasPrice();
    const gasEstimate = await this.contract.methods.createUserCerts(certIds, froms, tos, signatures).estimateGas({ from: writerAddress });
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
  async createUserCert(writerAddress, signedObject) {
    const data = this.contract.methods.createUserCert(signedObject.userCertificate.certId, signedObject.userCertificate.from, signedObject.userCertificate.to, signedObject.signature).encodeABI();
    const nonce = await this.web3.eth.getTransactionCount(writerAddress, "pending");
    const gasPrice = await this.web3.eth.getGasPrice();
    const gasEstimate = await this.contract.methods.createUserCert(signedObject.userCertificate.certId, signedObject.userCertificate.from, signedObject.userCertificate.to, signedObject.signature).estimateGas({ from: writerAddress });
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
  async createCert(writerAddress, signedObject) {
    const data = this.contract.methods.createCert(signedObject.certificate.groupId, signedObject.cid, signedObject.signature).encodeABI();
    const nonce = await this.web3.eth.getTransactionCount(writerAddress, "pending");
    const gasPrice = await this.web3.eth.getGasPrice();
    const gasEstimate = await this.contract.methods.createCert(signedObject.certificate.groupId, signedObject.cid, signedObject.signature).estimateGas({ from: writerAddress });
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
