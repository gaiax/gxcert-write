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
  async write(data, gasEstimate, writerAddress) {
    const nonce = await this.web3.eth.getTransactionCount(writerAddress, "pending");
    const gasPrice = await this.web3.eth.getGasPrice();
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
    const receipt = await this.web3.eth.sendSignedTransaction(rawData);
    return receipt.transactionHash;
  }
  async createProfile(writerAddress, userAddress, signedProfile) {
    const data = this.contract.methods.createProfile(
      userAddress, 
      signedProfile.profile.name, 
      signedProfile.profile.email, 
      signedProfile.profile.icon,
      signedProfile.signature, 
    ).encodeABI();
    const gasEstimate = await this.contract.methods.createProfile(
      userAddress, 
      signedProfile.profile.name, 
      signedProfile.profile.email, 
      signedProfile.profile.icon,
      signedProfile.signature,
    ).estimateGas({
      from: writerAddress,
    });
    return await this.write(data, gasEstimate, writerAddress);
  }
  async updateProfile(writerAddress, signedProfile) {
    const data = this.contract.methods.updateProfile(
      signedProfile.profile.name, 
      signedProfile.profile.email, 
      signedProfile.profile.icon, 
      signedProfile.signature
    ).encodeABI();
    const gasEstimate = await this.contract.methods.updateProfile(
      signedProfile.profile.name, 
      signedProfile.profile.email, 
      signedProfile.profile.icon, 
      signedProfile.signature
    ).estimateGas({
      from: writerAddress,
    });
    return await this.write(data, gasEstimate, writerAddress);
  }
  async createGroup(writerAddress, group) {
    const data = this.contract.methods.createGroup(group.name, group.residence, group.phone, group.member).encodeABI();
    const gasEstimate = await this.contract.methods.createGroup(group.name, group.residence, group.phone, group.member).estimateGas({
      from: writerAddress,
    });
    return await this.write(data, gasEstimate, writerAddress);
  }
  async invalidateUserCert(writerAddress, signedUserCert) {
    const data = this.contract.methods.invalidateUserCert(
      signedUserCert.userCertId, 
      signedUserCert.signature
    ).encodeABI();
    const gasEstimate = await this.contract.methods.invalidateUserCert(
      signedUserCert.userCertId, 
      signedUserCert.signature
    ).estimateGas({
      from: writerAddress,
    });
    return await this.write(data, gasEstimate, writerAddress);
  }
  async disableGroupMember(writerAddress, groupId, signedMember) {
    const data = this.contract.methods.disableGroupMember(
      groupId, 
      signedMember.address, 
      signedMember.signature
    ).encodeABI();
    const gasEstimate = await this.contract.methods.disableGroupMember(
      groupId, 
      signedMember.address, 
      signedMember.signature
    ).estimateGas({
      from: writerAddress,
    });
    return await this.write(data, gasEstimate, writerAddress);
  }
  async inviteMemberToGroup(writerAddress, groupId, signedMember) {
    const data = this.contract.methods.inviteMemberToGroup(
      groupId, 
      signedMember.address, 
      signedMember.signature
    ).encodeABI();
    const gasEstimate = await this.contract.methods.inviteMemberToGroup(
      groupId, 
      signedMember.address, 
      signedMember.signature
    ).estimateGas({
      from: writerAddress,
    });
    return await this.write(data, gasEstimate, writerAddress);
  }

  async updateGroup(writerAddress, signedGroup) {
    const data = this.contract.methods.updateGroup(
      signedGroup.group.groupId, 
      signedGroup.group.name, 
      signedGroup.group.residence, 
      signedGroup.group.phone, 
      signedGroup.signature
    ).encodeABI();
    const gasEstimate = await this.contract.methods.updateGroup(
      signedGroup.group.groupId, 
      signedGroup.group.name, 
      signedGroup.group.residence, 
      signedGroup.group.phone, 
      signedGroup.signature
    ).estimateGas({ from: writerAddress });
    return await this.write(data, gasEstimate, writerAddress);
  }
  async createUserCerts(writerAddress, signedObject) {
    const data = this.contract.methods.createUserCerts(
      signedObject.certId, 
      signedObject.from, 
      signedObject.tos, 
      signedObject.signature
    ).encodeABI();
    const gasEstimate = await this.contract.methods.createUserCerts(
      signedObject.certId, 
      signedObject.from, 
      signedObject.tos, 
      signedObject.signature
    ).estimateGas({ from: writerAddress });
    return await this.write(data, gasEstimate, writerAddress);
  }
  async createUserCert(writerAddress, signedObject) {
    const data = this.contract.methods.createUserCert(
      signedObject.userCertificate.certId, 
      signedObject.userCertificate.from, 
      signedObject.userCertificate.to, 
      signedObject.signature
    ).encodeABI();
    const gasEstimate = await this.contract.methods.createUserCert(
      signedObject.userCertificate.certId, 
      signedObject.userCertificate.from, 
      signedObject.userCertificate.to, 
      signedObject.signature
    ).estimateGas({ from: writerAddress });
    return await this.write(data, gasEstimate, writerAddress);
  }
  async createCert(writerAddress, signedObject) {
    const data = this.contract.methods.createCert(
      signedObject.certificate.groupId, 
      signedObject.cid, 
      signedObject.signature
    ).encodeABI();
    const gasEstimate = await this.contract.methods.createCert(
      signedObject.certificate.groupId, 
      signedObject.cid, 
      signedObject.signature
    ).estimateGas({ from: writerAddress });
    return await this.write(data, gasEstimate, writerAddress);
  }
}

module.exports = GxCertWriter;
