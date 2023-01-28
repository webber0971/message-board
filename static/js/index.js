let upload = document.getElementById("file-uploader")
upload.addEventListener("change",handleFiles,false);
let submit=document.getElementById("submitMessage")
submit.addEventListener("click",uploadMessage,false)
let body=document.querySelector("body")
// body.addEventListener("load",function(event){
//     getAllMessage()
// })
// 
getAllMessage()
async function uploadMessage(){
    event.preventDefault()
    let url=""
    // 判斷是否有要上傳圖片
    if(upload.value!=""){
        //取得presigned url (送get request到後端)
        url =await getPresignedUrl()
        //如果有檔案則使用 presigned url 上傳檔案至s3
        console.log(url["setUrl"])
        let getUrl = await usePresignedUrlUploadFileToS3(url)
        console.log(getUrl)
        //將imageUrl(setUrl) 及 訊息內容傳至伺服器(post request api)
        await sendImageAndMessageContentToServer((url["setUrl"]))
    }else{
        //將訊息內容傳至伺服器(post request api)
        await sendImageAndMessageContentToServer((url))
    }            
    //如果上傳成功則更新畫面
    await getAllMessage()
}

//取得presigned url
function getPresignedUrl(){
    return new Promise((resolve,reject)=>{
        fetch("/api/requestUploadToS3",{
            method:"get"
        })
        .then((res)=>res.json())
        .then((data)=>{
            // console.log(data)
            console.log(data)
            console.log("------")
            resolve(data)
        })
        .catch((error)=>{
            reject(error)
        })
    })
}
// 使用presigned url 上傳檔案
function usePresignedUrlUploadFileToS3(url){
    return new Promise((resolve,reject)=>{
        console.log(url)
        console.log("+++++")
        console.log(upload)
        let form = new FormData()
        form.append("image",upload.files)
        console.log(upload.files)
        fetch(url["url"],{
            method:"put",
            body:upload.files[0]
        })
        .then((res)=>res.text())
        .then((data)=>{
            console.log(data)
            resolve(data)
        })
        .catch((error)=>{
            reject(error)
        })
    })   
}

// 將留言及圖片URL上傳到伺服器端，伺服器端會自動更新到RDS
function sendImageAndMessageContentToServer(setUrl){
    return new Promise((resolve,reject)=>{
        let contentText=document.getElementById("file-content").value
        let submitForm=document.getElementById("submitForm").reset()
        let fd=new FormData()

        fd.append("imageUrl",setUrl)
        fd.append("contentText",contentText)
        console.log(setUrl)
        console.log(contentText)
        console.log(fd)
        fetch("/api/allMessage",{
            method:"post",
            body:fd
        })
        .then((res)=>res.json())
        .then((data)=>{
            console.log(data)
            resolve(data)
        })
        .catch((error)=>{
            reject(error)
        })
    })
}
// 從RDS上取得所有留言及圖片連結
function getAllMessage(){
    return new Promise((resolve,reject)=>{
        console.log("-==-=-=-=-")
        fetch("/api/allMessage",{
            method:"get"
        })
        .then((res)=>res.json())
        .then((data)=>{
            console.log(data)
            console.log(data["data"].length)
            generateMessageBox(data)
            resolve("yy")
        })
        .catch((error)=>{
            reject("errorrr")
        })
    })
    
}
// 用取得的留言及圖片連結產生顯示圖示
function generateMessageBox(data){
    let message=document.getElementById("message")
    message.innerHTML=""
    for(let i=0;i<data["data"].length;i++){
        let messageCell=document.createElement("div")
        messageCell.setAttribute("class","messageCell")
        let textTemp=document.createElement("span")
        textTemp.innerHTML=data["data"][i]["contentText"]
        message.appendChild(messageCell)
        messageCell.appendChild(textTemp)
        console.log("----")
        console.log(data["data"][i]["imageUrl"])
        if(data["data"][i]["imageUrl"]!=""){
            let br=document.createElement("br")
            let tempImage = document.createElement("img")
            console.log(data["data"][i]["imageUrl"])
            tempImage.src=data["data"][i]["imageUrl"]
            tempImage.setAttribute("class","tempImage")
            messageCell.appendChild(br)
            messageCell.appendChild(tempImage)
        }
        let line=document.createElement("br")
        messageCell.appendChild(line)
    }
}

function handleFiles(){
    console.log(this)
    console.log(this.files.length)
    readURL(this)
}
function readURL(input){
    var reader = new FileReader()
    reader.onload = function(e){
        document.getElementById("preview").src=e.target.result
    }
    reader.readAsDataURL(input.files[0])
}
function printAllMessage(){
    fetch("url",{
        method:"get"
    })
    .then((res)=>res.json())
    .then((data)=>{
        console.log(data)
    })
}