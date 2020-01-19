const fs = require("./read_write_data");
const deletePassword = (index) => {
    return new Promise(async (resolve,reject)=>{
        try{
        let masterKey = await fs.read_masterpassword();
        let contents = await fs.read_data();
        if(contents.url.length == 1)
        {
            await fs.write_masterpassword(masterKey);
            resolve("empty");
        }
        let newContents = {url:[],password:[]}
        for(let i = 0;i<contents.url.length;i++){
            if(i == index){continue;}
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
    catch(error){reject(error)}
           
    })
}

const updatePassword = (index,newPassword) =>{
    return new Promise(async (resolve,reject)=>{
        try{
        let masterKey = await fs.read_masterpassword();
        let contents = await fs.read_data();
        let newContents = {url:[],password:[]}
        for(let i = 0;i<contents.url.length;i++){
            newContents.url.push(contents.url[i]);
            if(i == index){
                newContents.password.push(newPassword);
            }
            else{
                newContents.password.push(contents.password[i]);
            }
        }
        await fs.write_masterpassword(masterKey);
        let toWrite = "";
        for(let i = 0;i<newContents.url.length;i++){
            toWrite += newContents.url[i]+" "+newContents.password[i]+"\n";
        }
        await fs.write_data(toWrite);
        resolve(newContents)
    }
    catch(error){reject(error)}
    })
}
        


module.exports = {
    deletePassword,
    updatePassword
}