const fs = require("fs");
const write_data = (data) => {

    fs.appendFile("data.bin",data,"utf-8",(err)=>{if(err){console.log(err)}});
}

const read_data = () => {
    return new Promise((resolve,reject)=>{
        fs.readFile("data.bin","utf-8",(err,result)=>{
            if(err) {reject(err)}
            else{
                let data = getUrlPass(result);
                resolve(data);
            }
        })
    })
}

const write_masterpassword = (data) => {
    //let toWrite = crypto.encrypt_aes(masterPasswordHash,"Random MasterPassword Encryption Text");
    fs.writeFile("data.bin",data+"\n","utf-8",(err)=>{if(err){console.log(err)}});
}

const read_masterpassword = () => {
    return new Promise((resolve,reject)=>{
        fs.readFile("data.bin","utf-8",(err,result)=>{
            if(err){reject(err)}
            else{
                let encrypted = getMasterKey(result);
                //let decryptedPass = crypto.decrypt_aes(encrypted,"Random MasterPassword Encryption Text")
                resolve(encrypted);
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

const getUrlPass = (data) =>{
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
