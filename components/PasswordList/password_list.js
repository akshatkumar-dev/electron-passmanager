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

electron.ipcRenderer.on("password:list",(e,data)=>{
    if(data.url.length != 0){
        for(let i = 0;i < data.url.length; i++){
            let li = document.createElement("li");
            let texNode = document.createTextNode(data.url[i]+"->"+data.password[i]);
            li.appendChild(texNode);
            ul.appendChild(li);
            let button = document.createElement("button");
            let text2 = document.createTextNode("decrypt");
            button.appendChild(text2);
            button.value = data.password[i];
            button.addEventListener("click",decryptPassword);
            ul.appendChild(button);
        }
    }
})
