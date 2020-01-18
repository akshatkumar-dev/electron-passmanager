const electron = require("electron");
const ul = document.querySelector("#passwords-ul");
let count = -1;
electron.ipcRenderer.on("add:password",(e,data)=>{

    let li = document.createElement("li");
    count++;
    let text = document.createTextNode(data.url+"->"+data.password);
    li.appendChild(text);
    ul.appendChild(li);
    let button = document.createElement("button");
    let text2 = document.createTextNode("decrypt");
    button.appendChild(text2);
    button.value = count.toString()+data.password;
    button.addEventListener("click",decryptPassword);
    ul.appendChild(button);
    let deleteButton = document.createElement("button");
    let deleteText = document.createTextNode("Delete");
    deleteButton.appendChild(deleteText);
    deleteButton.value = count.toString()+data.password;
    deleteButton.addEventListener("click",deleteEntry);
    ul.appendChild(deleteButton)
    let updateButton = document.createElement("button");
    let updateText = document.createTextNode("Update");
    updateButton.appendChild(updateText);
    updateButton.addEventListener("click",updatePassword);
    updateButton.value = count.toString()+data.password;
    ul.appendChild(updateButton);
})

const updatePassword = (e) =>{
    electron.ipcRenderer.send("update:password",parseInt(e.target.value[0]))
}

const decryptPassword = (e) => {
    electron.ipcRenderer.send("decrypt:password", e.target.value);
}

const deleteEntry = (e) => {
    electron.ipcRenderer.send("delete:password",parseInt(e.target.value[0]));
}

electron.ipcRenderer.on("clear",(e,data)=>{
    ul.innerHTML = "";
    count = -1;
})
electron.ipcRenderer.on("password:list",(e,data)=>{
    if(data.url.length != 0){
        ul.innerHTML = "";
        count = -1;
        for(let i = 0;i < data.url.length; i++){
            let li = document.createElement("li");
            count++;
            let texNode = document.createTextNode(data.url[i]+"->"+data.password[i]);
            li.appendChild(texNode);
            ul.appendChild(li);
            let button = document.createElement("button");
            let text2 = document.createTextNode("decrypt");
            button.appendChild(text2);
            button.value = count.toString()+data.password[i];
            button.addEventListener("click",decryptPassword);
            let deleteButton = document.createElement("button");
            let deleteText = document.createTextNode("Delete");
            deleteButton.appendChild(deleteText);
            ul.appendChild(button);
            deleteButton.value = count.toString()+data.password;
            deleteButton.addEventListener("click",deleteEntry);
            ul.appendChild(deleteButton);
            let updateButton = document.createElement("button");
            let updateText = document.createTextNode("Update");
            updateButton.appendChild(updateText);
            updateButton.addEventListener("click",updatePassword);
            updateButton.value = count.toString()+data.password;
            ul.appendChild(updateButton);
        }
    }
})
