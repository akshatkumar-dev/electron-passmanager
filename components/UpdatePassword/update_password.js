const electron = require("electron");
let newPassword = document.getElementById("new_password");
let submit = document.getElementById("submit");

submit.addEventListener("click",(e)=>{
    electron.ipcRenderer.send("updated:password",newPassword.value);
})