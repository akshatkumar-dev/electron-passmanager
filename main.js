const {app,BrowserWindow,Menu,ipcMain, dialog} = require("electron");
const encrypt_decrypt = require("./helper/encrypt_decrypt");
const sendMail = require("./helper/send_email");
let mainWindow;
let addPasswordWindow;
let showPasswordWindow;
let addMasterKeyWindow;
let resetMasterPasswordWindow;
let masterKey="";
let otp;
app.on("ready",function(){
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences:{
            nodeIntegration: true
        }
    })
    //Load master key from file if exists
    mainWindow.loadFile("./components/PasswordList/password_list.html")
    let newMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(newMenu);
})
ipcMain.on("add:password",(e,data)=>{
   data.password = encrypt_decrypt(0,masterKey,data.password);
    mainWindow.webContents.send("add:password",data);
    addPasswordWindow.close()
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
ipcMain.on("decrypt:password",(e,data)=>{
    let decrypted = encrypt_decrypt(1,masterKey,data);
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
    masterKey = encrypt_decrypt(2,data,"");
    addMasterKeyWindow.close();
})

ipcMain.on("reset:master",(e,data)=>{
    sendMail(data).then((data)=>{
        otp = data;
    }).catch((err)=>{
        console.log(err);
    })
})
ipcMain.on("confirm:master",(e,data)=>{
    if(data.otp == otp){
        masterKey = data.master;
        console.log("changed");
    }
    else{ //implement later
        console.log("wrong otp");
    }
    resetMasterPasswordWindow.close();
})

