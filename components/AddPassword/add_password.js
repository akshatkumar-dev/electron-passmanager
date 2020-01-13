const electron = require("electron");
const url = document.querySelector("#url-input");
const password = document.querySelector("#password-input");
const submit = document.querySelector("#submit-input");

submit.addEventListener("click",function(e){
    let sendData = {
        url: url.value,
        password: password.value
    }
    electron.ipcRenderer.send("add:password", sendData);
})