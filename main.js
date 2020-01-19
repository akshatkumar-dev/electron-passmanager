// All basic functions implemented
const {app,BrowserWindow,Menu,ipcMain, dialog,clipboard} = require("electron");
const crypto = require("./helper/encrypt_decrypt");
const sendMail = require("./helper/send_email");
const file = require("./helper/read_write_data");
const resetAllPassword = require("./helper/reset_all_password");
const del = require("./helper/delete_password");
let mainWindow;
let addPasswordWindow;
let showPasswordWindow;
let addMasterKeyWindow;
let resetMasterPasswordWindow;
let updatePasswordWindow;
let askMasterPasswordWindow;
let masterKey="";
let oldMasterKey = "";
let otp;
let updateIndex;
let authenticated = false;
app.on("ready",async ()=>{
    try{
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences:{
            nodeIntegration: true
        }
    })

    askMasterPasswordWindow = new BrowserWindow({
        width: 400,
        height: 400,
        webPreferences:{
            nodeIntegration: true
        }
    })
    
    //Load master key from file if exists
    let data = await file.read_masterpassword();
    masterKey = crypto.decrypt_aes(data,"Random MasterPassword Encryption Text")
    askMasterPasswordWindow.loadFile("./components/AskMasterPass/ask_master_pass.html")
    askMasterPasswordWindow.on("closed",()=>{
        if(!authenticated){app.quit()}
    })
    
    let newMenu = Menu.buildFromTemplate(menu);
        Menu.setApplicationMenu(newMenu);
}
    catch(err)
    {
        masterKey = "";
        mainWindow.loadFile("./components/PasswordList/password_list.html");
    }
})

const menu = [
    {
        label: "File",
        submenu: [{
            label: "Add password",
            click:function(){
                if(masterKey != "" && authenticated){
                addPasswordWindow = new BrowserWindow({
                    width: 300,
                    height: 200,
                    webPreferences: {
                        nodeIntegration: true
                    }
                })
                addPasswordWindow.loadFile("./components/AddPassword/add_password.html")
            }
            else{
                dialog.showMessageBox({
                    title: "No Master Key",
                    type: "info",
                    buttons:["OK"],
                    message: "To start adding passwords please add a master key for maximum security.\n The master key should be a strong key with atleast 8 characters and should not be forgotten."
                })
            }
        }
        },{
            label: "Add Master Key",
            click:async ()=>{
                try{
                    if(masterKey == ""){
                    addMasterKeyWindow = new BrowserWindow({
                        width: 400,
                        height: 400,
                        webPreferences:{
                            nodeIntegration: true
                        }
                    })
                    addMasterKeyWindow.loadFile("./components/AddMasterKey/add_master_key.html");
                }
                else{
                    let data = await dialog.showMessageBox({
                        title: "Master Key Exists",
                        type: "warning",
                        buttons:["OK","Reset"],
                        message: "Master key already exists. If you have forgotten the master key\n please click on reset to reset the master key"
                    })
                    if(data.response == 1 && authenticated){
                        resetMasterPasswordWindow = new BrowserWindow({
                            height: 500,
                            width: 500,
                            webPreferences:{
                                nodeIntegration: true
                            }
                        })
                        resetMasterPasswordWindow.loadFile("./components/ResetMasterPassword/reset_master_password.html");
                    }
                    else if(data.response == 1 && !authenticated){
                        dialog.showMessageBox({
                            title: "Master Key Exists",
                            type: "warning",
                            buttons:["OK"],
                            message: "You cannot reset master password unless inside the application"
                        })
                    }
                }
        }catch(error){console.log(error)}
    }

        },{
            label: "Reset Master Password",
            click: ()=>{
                if(authenticated)
                {
                resetMasterPasswordWindow = new BrowserWindow({
                    height: 500,
                    width: 500,
                    webPreferences:{
                        nodeIntegration: true
                    }
                })
                resetMasterPasswordWindow.loadFile("./components/ResetMasterPassword/reset_master_password.html");
            }else{dialog.showMessageBox({
                title: "Master Key Exists",
                type: "warning",
                buttons:["OK"],
                message: "You cannot reset master password unless inside the application"
            })}
        }
        }]
    },
    {
        label: "Developer Tools",
        submenu:[{
            label: "Toggle Developer Tools",
            click: function(item,focusedWindow){
                focusedWindow.toggleDevTools()
            }
        }]
    },
    {
        role: "reload"
    }
]

// Listeners

ipcMain.on("add:password",async (e,data)=>{
    try{
        let decrypted = data.url;
        data.url = crypto.encrypt_aes(data.url,masterKey);
        data.password = crypto.encrypt_aes(data.password,masterKey);
        let toWrite = data.url+" "+data.password+"\n";
        await file.write_data(toWrite);
        data.url = decrypted;
        mainWindow.webContents.send("add:password",data);
        addPasswordWindow.close()
    }
    catch(error) {console.log(error)}
})

ipcMain.on("decrypt:password",async (e,data)=>{
    try{
        data = data.slice(1,data.length);
        let decrypted = crypto.decrypt_aes(data,masterKey);
        showPasswordWindow = new BrowserWindow({
            height: 400,
            width: 400,
            webPreferences:{
                nodeIntegration: true
            }
        }) 
        await showPasswordWindow.loadFile("./components/ShowPassword/show_password.html")
        showPasswordWindow.webContents.send("receive:decrypt",decrypted);
    }
    catch(error){console.log(error)}
})

ipcMain.on("add:master",async (e,data)=>{
    try{
        masterKey = crypto.encrypt_masterpassword(data);
        let toStore = crypto.encrypt_aes(masterKey,"Random MasterPassword Encryption Text")
        await file.write_masterpassword(toStore);
        addMasterKeyWindow.close();
    }
    catch(error){console.log(error)}
})

ipcMain.on("reset:master",async (e,data)=>{
    try{
        let datarecv = await sendMail(data);
        otp = datarecv;
    }
    catch(error){console.log(error)}
})
ipcMain.on("confirm:master",async (e,data)=>{
    try{
        if(data.otp == otp){
            oldMasterKey = masterKey;
            masterKey = crypto.encrypt_masterpassword(data.password);
            let data = await resetAllPassword(masterKey,oldMasterKey);
            mainWindow.webContents.send("password:list",data);
            resetMasterPasswordWindow.close();
        }
        else{ //implement later
            console.log("wrong otp");
            resetMasterPasswordWindow.close();
        }
    }
    catch(error){console.log(error)}
})

ipcMain.on("delete:password",async (e,index)=>{
    try{
        let data = await dialog.showMessageBox({
            title: "Confirm Delete",
            type: "info",
            buttons:["OK","Cancel"],
            message: "Are you sure you want to delete the password?\nThis action cannot be reversed"
        })
        if(data.response == 0){
            let contents = await del.deletePassword(index);
            if(contents != "empty"){
                for(let i = 0;i<contents.url.length;i++){
                    contents.url[i] = crypto.decrypt_aes(contents.url[i],masterKey);
                }
                mainWindow.webContents.send("password:list",contents);
            }
            else{mainWindow.webContents.send("clear","nothing")}
        }
    }
    catch(error){console.log(error)}
})


ipcMain.on("update:password",(e,index)=>{
    updateIndex = index;
    updatePasswordWindow = new BrowserWindow({
        width: 400,
        height: 400,
        webPreferences:{
            nodeIntegration: true
        }
    })
    updatePasswordWindow.loadFile("./components/UpdatePassword/update_password.html");
})

ipcMain.on("updated:password",async (e,data)=>{
    try{
        updatePasswordWindow.close()
        let encrypted = crypto.encrypt_aes(data,masterKey);
        let contents = await del.updatePassword(updateIndex,encrypted);
        for(let i = 0;i<contents.url.length;i++){
            contents.url[i] = crypto.decrypt_aes(contents.url[i],masterKey);
        }
        mainWindow.webContents.send("password:list",contents);
    }
    catch(error){console.log(error)}
})

ipcMain.on("copy:text",(e,data)=>{
    let decrypt = crypto.decrypt_aes(data,masterKey);
    clipboard.writeText(decrypt);
})

ipcMain.on("ask:master",async (e,data)=>{
    try{
        let encrypted = crypto.encrypt_masterpassword(data);
        if(encrypted == masterKey){
            authenticated = true;
            askMasterPasswordWindow.close();
            let contents = await file.read_data();
            for(let i = 0;i<contents.url.length;i++){
                contents.url[i] = crypto.decrypt_aes(contents.url[i],masterKey);
            }
            await mainWindow.loadFile("./components/PasswordList/password_list.html")
            mainWindow.webContents.send("password:list",contents);
        }
        else
        {
            dialog.showMessageBox({
                title: "Wrong Master Password",
                type: "warning",
                buttons:["OK"],
                message: "The entered master password is invalid"
            })
        }
    }
    catch(error){console.log(error)}
})

