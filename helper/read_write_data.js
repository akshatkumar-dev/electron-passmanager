const fs = require("fs");
const crypto = require("./encrypt_decrypt");
const cryptojs = require("crypto-js");
const write_data = (data, masterPasswordHash) => {
    let newUrl = crypto.encrypt_aes(data.url, masterPasswordHash);
    let newPassword = crypto.encrypt_aes(data.password, masterPasswordHash);
    fs.appendFile("data.bin",newUrl+" "+newPassword+"\n","utf-8",(err)=>{console.log(err)});
    return newPassword;
}

const read_data = (masterPasswordHash) => {
    return new Promise((resolve,reject)=>{
        fs.readFile("data.bin","utf-8",(err,result)=>{
            if(err) {reject(err)}
            else{
                let data = getUrlPass(result,masterPasswordHash);
                resolve(data);
            }
        })
    })
}

const write_masterpassword = (masterPasswordHash) => {
    let toWrite = crypto.encrypt_aes(masterPasswordHash,"Random MasterPassword Encryption Text");
    fs.appendFile("data.bin",toWrite+"\n","utf-8",(err)=>{console.log(err)});
}

const read_masterpassword = () => {
    return new Promise((resolve,reject)=>{
        fs.readFile("data.bin","utf-8",(err,result)=>{
            if(err){reject(err)}
            else{
                let encrypted = getMasterKey(result);
                let decryptedPass = crypto.decrypt_aes(encrypted,"Random MasterPassword Encryption Text")
                resolve(decryptedPass.toString(cryptojs.enc.Utf8));
            }
        })
    })
}

const getMasterKey = (data) =>{
    let i = 0;
    let masterKey = "";
    while(data[i] != "\n"){
        masterKey += data[i];
        i++;
    }
    return masterKey;
}

const getUrlPass = (data, masterKey) =>{
    let i = 0
    while(data[i] != "\n"){
        i++;
    }
    i++;
    let toAppend = "";
    let toSend = {url:[],password:[]}
    while(i < data.length)
    {
        if(data[i] == " "){
            toAppend = crypto.decrypt_aes(toAppend,masterKey);
            toSend.url.push(toAppend);
            toAppend = "";
        }
        else if(data[i] == "\n"){
            toSend.password.push(toAppend);
            toAppend = "";
        }
        else{toAppend+=data[i]}
        i++;
    }
    return toSend;
}

module.exports = {
    write_data,
    read_data,
    write_masterpassword,
    read_masterpassword
};
