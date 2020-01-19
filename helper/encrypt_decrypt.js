const cryptoJs = require("crypto-js");

const encrypt_aes = (data, masterPasswordHash) => {
    let secret = cryptoJs.SHA256(masterPasswordHash);
    secret.toString(cryptoJs.enc.Hex);
    let encrypted = cryptoJs.AES.encrypt(data,"'"+secret+"'");
    return encrypted.toString()
}

const decrypt_aes = (data, masterPasswordHash) => {
    let secret = cryptoJs.SHA256(masterPasswordHash);
    secret.toString(cryptoJs.enc.Hex);
    let decrypted = cryptoJs.AES.decrypt(data,"'"+secret+"'");
    return decrypted.toString(cryptoJs.enc.Utf8);
}

const encrypt_masterpassword = (data) => {
    let hash = cryptoJs.SHA256(data);
    return hash.toString();
}

module.exports = {encrypt_aes, decrypt_aes, encrypt_masterpassword};