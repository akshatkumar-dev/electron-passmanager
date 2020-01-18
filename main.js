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
let masterKey="";
let oldMasterKey = "";
let otp;
let updateIndex;
app.on("ready",function(){
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences:{
            nodeIntegration: true
        }
    })
    //Load master key from file if exists
    file.read_masterpassword().then((data)=>{
        masterKey = crypto.decrypt_aes(data,"Random MasterPassword Encryption Text")

        file.read_data().then((contents)=>{
            for(let i = 0;i<contents.url.length;i++){
                contents.url[i] = crypto.decrypt_aes(contents.url[i],masterKey);
            }
            mainWindow.loadFile("./components/PasswordList/password_list.html").then((data1)=>{
                mainWindow.webContents.send("password:list",contents);
            
            }).catch((err)=>{masterKey="";console.log(err)})
        
        }).catch((err)=>{masterKey="";console.log(err)})
    
    }).catch((err)=>{masterKey = "";mainWindow.loadFile("./components/PasswordList/password_list.html")});
    let newMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(newMenu);
    
})

const menu = [
    {
        label: "File",
        submenu: [{
            label: "Add password",
            click:function(){
                if(masterKey != ""){
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
            click:()=>{
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
                dialog.showMessageBox({
                    title: "Master Key Exists",
                    type: "warning",
                    buttons:["OK","Reset"],
                    message: "Master key already exists. If you have forgotten the master key\n please click on reset to reset the master key"
                }).then((data)=>{
                    if(data.response == 1){
                        resetMasterPasswordWindow = new BrowserWindow({
                            height: 500,
                            width: 500,
                            webPreferences:{
                                nodeIntegration: true
                            }
                        })
                        resetMasterPasswordWindow.loadFile("./components/ResetMasterPassword/reset_master_password.html");
                    }
                })
            }
        }

        },{
            label: "Reset Master Password",
            click: ()=>{
                resetMasterPasswordWindow = new BrowserWindow({
                    height: 500,
                    width: 500,
                    webPreferences:{
                        nodeIntegration: true
                    }
                })
                resetMasterPasswordWindow.loadFile("./components/ResetMasterPassword/reset_master_password.html");
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
ipcMain.on("add:password",(e,data)=>{
    let decrypted = data.url;
    data.url = crypto.encrypt_aes(data.url,masterKey);
    data.password = crypto.encrypt_aes(data.password,masterKey);
    let toWrite = data.url+" "+data.password+"\n";
    file.write_data(toWrite);
    data.url = decrypted;
    mainWindow.webContents.send("add:password",data);
    addPasswordWindow.close()
})

ipcMain.on("decrypt:password",(e,data)=>{
    data = data.slice(1,data.length);
    let decrypted = crypto.decrypt_aes(data,masterKey);
    showPasswordWindow = new BrowserWindow({
        height: 400,
        width: 400,
        webPreferences:{
            nodeIntegration: true
        }
    })
    showPasswordWindow.loadFile("./components/ShowPassword/show_password.html").then(function(data){
        showPasswordWindow.webContents.send("receive:decrypt",decrypted);
    }).catch(function(err){console.log(err)})

})

ipcMain.on("add:master",(e,data)=>{
    masterKey = crypto.encrypt_masterpassword(data);
    let toStore = crypto.encrypt_aes(masterKey,"Random MasterPassword Encryption Text")
    file.write_masterpassword(toStore);
    
    addMasterKeyWindow.close();
})

ipcMain.on("reset:master",(e,data)=>{
    sendMail(data).then((datarecv)=>{
        otp = datarecv;
    }).catch((err)=>{
        console.log(err);
    })
})
ipcMain.on("confirm:master",(e,data)=>{
    if(data.otp == otp){
        oldMasterKey = masterKey;
        masterKey = crypto.encrypt_masterpassword(data.password);
        resetAllPassword(masterKey,oldMasterKey).then((data)=>{

            mainWindow.webContents.send("password:list",data);
            resetMasterPasswordWindow.close();
            console.log("changed");
        }).catch((err)=>{console.log(err)})
    }
    else{ //implement later
        console.log("wrong otp");
        resetMasterPasswordWindow.close();
    }
    
})

ipcMain.on("delete:password",(e,index)=>{
    dialog.showMessageBox({
        title: "Confirm Delete",
        type: "info",
        buttons:["OK","Cancel"],
        message: "Are you sure you want to delete the password?\nThis action cannot be reversed"
    }).then((data)=>{
        
        if(data.response == 0){
            del.deletePassword(index).then((contents)=>{
                if(contents != "empty"){
                for(let i = 0;i<contents.url.length;i++){
                    contents.url[i] = crypto.decrypt_aes(contents.url[i],masterKey);
                }
                mainWindow.webContents.send("password:list",contents);
            }
            else{mainWindow.webContents.send("clear","nothing")}
            }).catch((err)=>{console.log(err)})
        
        }
    })
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

ipcMain.on("updated:password",(e,data)=>{
    updatePasswordWindow.close()
    let encrypted = crypto.encrypt_aes(data,masterKey);
    del.updatePassword(updateIndex,encrypted).then((contents)=>{
        for(let i = 0;i<contents.url.length;i++){
            contents.url[i] = crypto.decrypt_aes(contents.url[i],masterKey);
        }
        mainWindow.webContents.send("password:list",contents);
    }).catch((reject)=>{console.log(reject)})
})

ipcMain.on("copy:text",(e,data)=>{
    let decrypt = crypto.decrypt_aes(data,masterKey);
    clipboard.writeText(decrypt);
})

