const fs = require("./read_write_data");
const crypto = require("./encrypt_decrypt");

const deletePassword = (index) => {
    return new Promise((resolve,reject)=>{
        fs.read_masterpassword().then((masterKey)=>{
            fs.read_data().then((contents)=>{
                let newContents = {url:[],password:[]}
                if(contents.url.length != 1){
                for(let i = 0;i<contents.url.length;i++){
                    if(i == index){continue;}
                    else{
                        newContents.url.push(contents.url[i]);
                        newContents.password.push(contents.password[i]);
                    }
                }
            }
                fs.write_masterpassword(masterKey);
                let toWrite = "";
                if(contents.url.length != 1){
                for(let i = 0;i<newContents.url.length;i++){
                    toWrite += newContents.url[i]+" "+newContents.password[i]+"\n";
                }

                fs.write_data(toWrite);
            }
                if(contents.url.length == 1){resolve("empty")};
                resolve(newContents)
            }).catch((err)=>{reject(err)})
        }).catch((err)=>{reject(err)})
    })
}

const updatePassword = (index,newPassword) =>{
    return new Promise((resolve,reject)=>{
        fs.read_masterpassword().then((masterKey)=>{
            fs.read_data().then((contents)=>{
                let newContents = {url:[],password:[]}
                for(let i = 0;i<contents.url.length;i++){
                    if(i == index){
                        newContents.url.push(contents.url[i]);
                        newContents.password.push(newPassword);
                    }
                    else{
                        newContents.url.push(contents.url[i]);
                        newContents.password.push(contents.password[i]);
                }
            }
                fs.write_masterpassword(masterKey);
                let toWrite = "";
                for(let i = 0;i<newContents.url.length;i++){
                    toWrite += newContents.url[i]+" "+newContents.password[i]+"\n";
                }
                fs.write_data(toWrite);
                resolve(newContents)
            }
            ).catch((err)=>{reject(err)})
        }).catch((err)=>{reject(err)})
    })
}

module.exports = {
    deletePassword,
    updatePassword
}