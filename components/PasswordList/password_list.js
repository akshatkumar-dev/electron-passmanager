const electron = require("electron");
const ul = document.querySelector("#passwords-ul");
electron.ipcRenderer.on("add:password",(e,data)=>{
    let li = document.createElement("li");
    let text = document.createTextNode(data.url+"->"+data.password);
    li.appendChild(text);
    ul.appendChild(li);
    let button = document.createElement("button");
    let text2 = document.createTextNode("decrypt");
    button.appendChild(text2);
    button.value = data.password;
    button.addEventListener("click",decryptPassword);
    ul.appendChild(button);
})

const decryptPassword = (e) => {
    electron.ipcRenderer.send("decrypt:password", e.target.value);
    
}
