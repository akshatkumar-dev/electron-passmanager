const electron = require("electron");
const email = document.getElementById("email");
const submit = document.getElementById("submit");
const otp = document.getElementById("otp");
const password = document.getElementById("password");
const reset = document.getElementById("reset");

submit.addEventListener("click",()=>{
    electron.ipcRenderer.send("reset:master",email.value);
})

reset.addEventListener("click",()=>{
    electron.ipcRenderer.send("confirm:master",{otp:otp.value,master:password.value})
})