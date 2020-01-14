const electron = require("electron");
let h1 = document.querySelector("h1");
electron.ipcRenderer.on("receive:decrypt",(event,data)=>{
    h1.textContent = data;
})