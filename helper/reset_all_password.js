const crypto = require("./encrypt_decrypt");
const fs = require("./read_write_data");

const resetAllPassword = (newMaster,oldMaster) => {
    return new Promise((resolve,reject)=>{
        fs.read_data().then((contents)=>{
            for(let i = 0;i<contents.password.length;i++){
                contents.url[i] = crypto.decrypt_aes(contents.url[i],oldMaster);
                contents.password[i] = crypto.decrypt_aes(contents.password[i],oldMaster);
            }
            let toStore = crypto.encrypt_aes(newMaster,"Random MasterPassword Encryption Text");
            fs.write_masterpassword(toStore);
            let toWrite = "";
            for(let i = 0;i<contents.password.length;i++){
                let old = contents.url[i];
                contents.url[i] = crypto.encrypt_aes(contents.url[i],newMaster);
                contents.password[i] = crypto.encrypt_aes(contents.password[i],newMaster);
                toWrite += contents.url[i]+" "+contents.password[i]+"\n";
                contents.url[i] = old;
            }
            fs.write_data(toWrite);
            resolve(contents);
        }).catch((err)=>{reject(err)})
    })
    
}

module.exports = resetAllPassword