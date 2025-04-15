// hover focus
setTimeout(function(){
let itms=document.getElementsByClassName("button");
for (let i=0;i<itms.length;i++){
  let ahh=itms[i];
  itms[i].addEventListener("mouseover",function(){ahh.focus();ahh.click();console.log(ahh);});
}
},1000);

// sounds

let sounds=[
  new Audio("assets/soundboard/sd1.mp3")
];

document.addEventListener("DOMContentLoaded",function(){
for (let i=0;i<1;i++){
  let tmp=i;
  document.getElementById("btn"+i).addEventListener("click",function(){sounds[tmp].play();});
  document.body.addEventListener("keydown",function(e){if(e.key===(tmp+1).toString()){document.getElementById("btn"+tmp).click();}});
}
});


