const electron = require("electron");
const ul = document.querySelector("#passwords-ul");
electron.ipcRenderer.on("add:password",(e,data)=>{
    let li = document.createElement("li");
    let text = document.createTextNode(data.url+"->"+data.password);
    li.appendChild(text);
    ul.appendChild(li);
})