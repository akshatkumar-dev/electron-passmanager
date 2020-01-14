const {app,BrowserWindow,Menu,ipcMain} = require("electron");
const encrypt_decrypt = require("./helper/encrypt_decrypt");
let mainWindow;
let addPasswordWindow;
let showPasswordWindow;
let masterKey;
app.on("ready",function(){
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences:{
            nodeIntegration: true
        }
    })
    //Load master key from file if exists
    masterKey = "5c26333ad8b2f7796debbc03ede56adab2707bd900d31efc84904a4efe4c2cbb"
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
                addPasswordWindow = new BrowserWindow({
                    width: 300,
                    height: 200,
                    webPreferences: {
                        nodeIntegration: true
                    }
                })
                addPasswordWindow.loadFile("./components/AddPassword/add_password.html")
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

