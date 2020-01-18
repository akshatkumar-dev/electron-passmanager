const electron = require("electron");
let master = document.getElementById("masterpass");
let submit = document.getElementById("submit");

submit.addEventListener("click",(e)=>{
    electron.ipcRenderer.send("ask:master",master.value)
})