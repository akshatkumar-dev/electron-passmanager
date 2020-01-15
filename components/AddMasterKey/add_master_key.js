const electron = require("electron");
const key = document.getElementById("input-master");
const submit = document.getElementById("submit");

submit.addEventListener("click",()=>{
    electron.ipcRenderer.send("add:master",key.value);
})