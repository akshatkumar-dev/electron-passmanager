const {app,BrowserWindow,Menu,ipcMain} = require("electron");
let mainWindow;
let addPasswordWindow;
app.on("ready",function(){
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences:{
            nodeIntegration: true
        }
    })
    mainWindow.loadFile("./components/PasswordList/password_list.html")
    let newMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(newMenu);
})
ipcMain.on("add:password",(e,data)=>{
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