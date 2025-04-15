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
  new Audio("assets/soundboard/sd1.mp3"),
  new Audio("assets/soundboard/sd2.mp3")
];

document.addEventListener("DOMContentLoaded",function(){
  let nm=2;
for (let i=0;i<nm;i++){
  let tmp=i;
  document.getElementById("btn"+i).addEventListener("click",function(){
                                                                      for (let j=0;j<nm;j++){sounds[j].pause();if(j==tmp){sounds[j].currentTime=0;}}
    sounds[tmp].play();document.getElementById("btn"+tmp).focus();
                                                                      });
  document.body.addEventListener("keydown",function(e){if(e.key===(tmp+1).toString()){document.getElementById("btn"+tmp).click();}});
}
});


