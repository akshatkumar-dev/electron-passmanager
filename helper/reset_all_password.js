const crypto = require("./encrypt_decrypt");
const fs = require("./read_write_data");

const resetAllPassword = (newMaster,oldMaster) => {
    return new Promise((resolve,reject)=>{
        fs.read_data(oldMaster).then((contents)=>{
            for(let i = 0;i<contents.password.length;i++){
                contents.password[i] = crypto.decrypt_aes(contents.password[i],oldMaster);
            }
            fs.write_masterpassword(newMaster);
            for(let i = 0;i<contents.password.length;i++){
                contents.password[i] = fs.write_data({url:contents.url[i],password:contents.password[i]},newMaster);
            }
            resolve(contents);
        }).catch((err)=>{reject(err)})
    })
    
}

module.exports = resetAllPassword