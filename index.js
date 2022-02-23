const { Transaction } = require("@ethereumjs/tx");
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
    const nonce = await this.web3.eth.getTransactionCount(
      writerAddress,
      "pending"
    );
    const gasPrice = await this.web3.eth.getGasPrice();
    const details = {
      nonce: this.web3.utils.toHex(nonce),
      gasPrice: this.web3.utils.toHex(gasPrice),
      gasLimit: this.web3.utils.toHex(gasEstimate),
      type: 0,
      to: this.contractAddress,
      from: writerAddress,
      data,
    };

    let transaction = Transaction.fromTxData(details, { common: this.common });
    transaction = transaction.sign(Buffer.from(this.privateKey, "hex"));
    const rawData = "0x" + transaction.serialize().toString("hex");
    let receipt;
    try { 
      receipt = await this.web3.eth.sendSignedTransaction(rawData);
    } catch(err) {
      throw err;
    }
    if (receipt === null) {
      throw new Error("Failed to get transaction receipt.");
    }
    return receipt.transactionHash;
  }
  async createProfile(writerAddress, userAddress, signedProfile) {
    const data = this.contract.methods
      .createProfile(
        userAddress,
        signedProfile.profile.name,
        signedProfile.profile.icon,
        signedProfile.nonce,
        signedProfile.signature
      )
      .encodeABI();
    const gasEstimate = await this.contract.methods
      .createProfile(
        userAddress,
        signedProfile.profile.name,
        signedProfile.profile.icon,
        signedProfile.nonce,
        signedProfile.signature
      )
      .estimateGas({
        from: writerAddress,
      });
    return await this.write(data, gasEstimate, writerAddress);
  }
  async updateProfile(writerAddress, signedProfile) {
    const data = this.contract.methods
      .updateProfile(
        signedProfile.signerAddress,
        signedProfile.profile.name,
        signedProfile.profile.icon,
        signedProfile.nonce,
        signedProfile.signature
      )
      .encodeABI();
    const gasEstimate = await this.contract.methods
      .updateProfile(
        signedProfile.signerAddress,
        signedProfile.profile.name,
        signedProfile.profile.icon,
        signedProfile.nonce,
        signedProfile.signature
      )
      .estimateGas({
        from: writerAddress,
      });
    return await this.write(data, gasEstimate, writerAddress);
  }
  async createGroup(writerAddress, signedGroup) {
    const data = this.contract.methods
      .createGroup(
        signedGroup.address,
        signedGroup.group.name, 
        signedGroup.group.residence, 
        signedGroup.group.phone, 
        signedGroup.nonce,
        signedGroup.signature
      )
      .encodeABI();
    const gasEstimate = await this.contract.methods
      .createGroup(
        signedGroup.address,
        signedGroup.group.name, 
        signedGroup.group.residence, 
        signedGroup.group.phone, 
        signedGroup.nonce,
        signedGroup.signature
      )
      .estimateGas({
        from: writerAddress,
      });
    return await this.write(data, gasEstimate, writerAddress);
  }
  async invalidateUserCert(writerAddress, signedUserCert) {
    const data = this.contract.methods
      .invalidateUserCert(
        signedUserCert.signerAddress,
        signedUserCert.userCertId, 
        signedUserCert.nonce,
        signedUserCert.signature
      )
      .encodeABI();
    const gasEstimate = await this.contract.methods
      .invalidateUserCert(
        signedUserCert.signerAddress,
        signedUserCert.userCertId, 
        signedUserCert.nonce,
        signedUserCert.signature
      )
      .estimateGas({
        from: writerAddress,
      });
    return await this.write(data, gasEstimate, writerAddress);
  }
  async disableGroupMember(writerAddress, groupId, signedMember) {
    const data = this.contract.methods
      .disableGroupMember(
        signedMember.signerAddress,
        groupId, 
        signedMember.address, 
        signedMember.nonce,
        signedMember.signature
      )
      .encodeABI();
    const gasEstimate = await this.contract.methods
      .disableGroupMember(
        signedMember.signerAddress,
        groupId, 
        signedMember.address, 
        signedMember.nonce,
        signedMember.signature
      )
      .estimateGas({
        from: writerAddress,
      });
    return await this.write(data, gasEstimate, writerAddress);
  }
  async inviteMemberToGroup(writerAddress, groupId, signedMember) {
    const data = this.contract.methods
      .inviteMemberToGroup(
        signedMember.signerAddress,
        groupId,
        signedMember.address,
        signedMember.nonce,
        signedMember.signature
      )
      .encodeABI();
    const gasEstimate = await this.contract.methods
      .inviteMemberToGroup(
        signedMember.signerAddress,
        groupId,
        signedMember.address,
        signedMember.nonce,
        signedMember.signature
      )
      .estimateGas({
        from: writerAddress,
      });
    return await this.write(data, gasEstimate, writerAddress);
  }

  async updateGroup(writerAddress, signedGroup) {
    const data = this.contract.methods
      .updateGroup(
        signedGroup.signerAddress,
        signedGroup.group.groupId,
        signedGroup.group.name,
        signedGroup.group.residence,
        signedGroup.group.phone,
        signedGroup.nonce,
        signedGroup.signature
      )
      .encodeABI();
    const gasEstimate = await this.contract.methods
      .updateGroup(
        signedGroup.signerAddress,
        signedGroup.group.groupId,
        signedGroup.group.name,
        signedGroup.group.residence,
        signedGroup.group.phone,
        signedGroup.nonce,
        signedGroup.signature
      )
      .estimateGas({ from: writerAddress });
    return await this.write(data, gasEstimate, writerAddress);
  }
  async createUserCerts(writerAddress, signedObject) {
    const data = this.contract.methods
      .createUserCerts(
        signedObject.certId,
        signedObject.from,
        signedObject.tos,
        signedObject.nonce,
        signedObject.signature
      )
      .encodeABI();
    const gasEstimate = await this.contract.methods
      .createUserCerts(
        signedObject.certId,
        signedObject.from,
        signedObject.tos,
        signedObject.nonce,
        signedObject.signature
      )
      .estimateGas({ from: writerAddress });
    return await this.write(data, gasEstimate, writerAddress);
  }
  async createUserCert(writerAddress, signedObject) {
    const data = this.contract.methods
      .createUserCert(
        signedObject.userCertificate.certId,
        signedObject.userCertificate.from,
        signedObject.userCertificate.to,
        signedObject.nonce,
        signedObject.signature
      )
      .encodeABI();
    const gasEstimate = await this.contract.methods
      .createUserCert(
        signedObject.userCertificate.certId,
        signedObject.userCertificate.from,
        signedObject.userCertificate.to,
        signedObject.nonce,
        signedObject.signature
      )
      .estimateGas({ from: writerAddress });
    return await this.write(data, gasEstimate, writerAddress);
  }
  async createCert(writerAddress, signedObject) {
    const data = this.contract.methods
      .createCert(
        signedObject.signerAddress,
        signedObject.certificate.groupId,
        signedObject.certificate.title,
        signedObject.certificate.description,
        signedObject.certificate.image,
        signedObject.nonce,
        signedObject.signature
      )
      .encodeABI();
    const gasEstimate = await this.contract.methods
      .createCert(
        signedObject.signerAddress,
        signedObject.certificate.groupId,
        signedObject.certificate.title,
        signedObject.certificate.description,
        signedObject.certificate.image,
        signedObject.nonce,
        signedObject.signature
      )
      .estimateGas({ from: writerAddress });
    return await this.write(data, gasEstimate, writerAddress);
  }
}

module.exports = GxCertWriter;
