let getE=(a)=>document.getElementById(a);
let disableAd=true; // Dont forget to set to false for ads
let popup=getE('promptBg');
/*setTimeout(function(){
  popup.removeAttribute("hidden");
},2000);*/
function downloadFile(){
  //alert("to be implemented");
  let blob=new Blob([getE("mainEditor").value],{type:"text/plain"});
  let url=URL.createObjectURL(blob);
  let a=document.createElement("a");
  a.href=url;
  a.download=getE("ddown").value+".txt";
  a.target="_blank";
  a.click();
  URL.revokeObjectURL(url);
}
let lastResolve=[];
let promptMsgQueue=[];
let defaults=[];
function subM(){
  //alert("submit prompt here");
  popup.setAttribute("hidden",'');
  let rs=lastResolve.shift();
  (rs===undefined?()=>0:rs)(getE('textInp').value);
  getE('textInp').value='';
  //promptMsgQueue.shift();
  //defaults.shift();
  let next=promptMsgQueue.shift();
  if (next!==undefined){
    popup.removeAttribute("hidden");
    getE("promptTtl").innerText=next;
    getE('textInp').value=defaults.shift();
  }
}
function asyncPrompt(msg){
  if (lastResolve.length==0){
  getE("promptTtl").innerText=msg;
  }
  popup.removeAttribute("hidden");
  return new Promise(function(resolve){lastResolve.push(resolve);/*promptMsgQueue.push(msg);defaults.push('');*/})
}
function asyncPrompt2(msg,defaultMsg){
  if (lastResolve.length==0){
  getE("promptTtl").innerText=msg;
    getE("textInp").value=defaultMsg;
  }
  popup.removeAttribute("hidden");
  return new Promise(function(resolve){lastResolve.push(resolve);/*promptMsgQueue.push(msg);defaults.push(defaultMsg);*/})
}
async function tester(){
  alert(await asyncPrompt("Message 1"));
  alert(await asyncPrompt("Message 2"));
  alert(await asyncPrompt("Message 3"));
}
if (disableAd){
    getE('free-robux').setAttribute('hidden','');
}

let rickcount=0;
let adDelay=60000;
async function rick(){
  if (disableAd){
    return;
  }
  window.open("https://terencep1.github.io/rick",'_blank');
  getE('free-robux').setAttribute('hidden','')
  rickcount++;
  if (rickcount>1){
    let maxAtt=5;
    let pi="3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679"
    for (let i=0;i<maxAtt;i++){
      let attempt=await asyncPrompt2("NO ADS!","WANT NO ADS????? DELETE THIS TEXT AND LIST THE FIRST 100 DIGITS OF PI HERE TO WIN YOUR NO AD TICKET!!!!!!! Try "+(i+1)+"/"+maxAtt);
      if (attempt===pi){
        disableAd=true;
        return;
      }
    }
    
  }
  setTimeout(function(){
    getE('free-robux').removeAttribute('hidden');
  },adDelay);
  adDelay=Math.max(100,adDelay*0.5)
}
function deleteFile(){
  alert("To be implemented")
}
let lastVal="tmp";
getE("ddown").addEventListener("change",function(e){
  if (this.value==="newFle"){
    newFle(lastVal);
  }
  lastVal=this.val;
});
async function renameFle(fle){
  alert("A rename was requested but I have yet to inplement it.")
}
async function newFle(lastV){
  let promptRes=await asyncPrompt("Filename");
  if (promptRes==='tmp' || promptRes==='newFle'){
    asyncPrompt2("Error","I'm so sorry but tmp and newFle are reserved file names. Please choose a different one. Exit this when you are done reading.");
    getE("ddown").value=lastV;
    return;
  }
  // Check if value exists
  getE("ddown").value=promptRes;
  if (getE("ddown").value==promptRes){
    renameFle(promptRes);
    getE("ddown").value=lastV;
    return;
  }
  
  //alert(promptRes);
  localStorage.setItem("fle-"+getE("ddown").value,"");
  getE("fileName2").innerText=promptRes;
  getE("mainEditor").value="";
  let newOption=document.createElement("option");
  newOption.value=promptRes;
  newOption.text=promptRes;
  getE("ddown").prepend(newOption);
  getE("ddown").value=promptRes;
}
asyncPrompt2("Info","Dear beloved user:\nIf this is your first time using this, read on. If not, please feel free to dismiss this message"+
". First of all, your files are always stored locally, none are EVER uploaded to any server.\n"+
"A guide to navigating this UI:\nIf this is your first time using this, you may find certain design choices confusing. I will break them down here. \n"+
"1. The file named temporary file is temporary: it will not be stored and is wiped on reload.\n"+
"2. The file selector dropdown in the middle contains the option to create a file and is the only way to do so.\n"+
"3. To rename a file, create a new file with the name of the file you wish to rename. A new prompt will appear asking you for the new name.\n"+
"4. Delete file only deletes the file that is open.\n"+
"5. To exit/submit prompts like this one, double tap the prompt header/message/prompt.\n"+
"I will apologize in advance for any interruptions. This page is in active development so please be patient. \n - Terence");

document.getElementById('promptTtl').addEventListener('dblclick', function(event) {
    event.preventDefault();
});
document.getElementById('promptTtl').addEventListener('click', function(event) {
    event.preventDefault();
});