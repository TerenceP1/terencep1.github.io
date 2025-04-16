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
];

for (let i=0;i<9;i++){
  sounds.push(new Audio("assets/soundboard/sd"+(i+1).toString()+".mp3"));
}

document.addEventListener("DOMContentLoaded",function(){
  let nm=9;
for (let i=0;i<nm;i++){
  let tmp=i;
  document.getElementById("btn"+i).addEventListener("click",function(){
                                                                      for (let j=0;j<nm;j++){sounds[j].pause();if(j!=tmp){sounds[j].currentTime=0;}}
    sounds[tmp].play();document.getElementById("btn"+tmp).focus();
                                                                      });
  document.body.addEventListener("keydown",function(e){if(e.key===(tmp+1).toString()){document.getElementById("btn"+tmp).click();}});
}
  document.body.addEventListener("keydown",function(e){if(e.key=="s"){document.getElementsByClassName("bigb")[0].click();}});
});

function stop(){
  let nm=9;
  for (let j=0;j<nm;j++){sounds[j].pause();sounds[j].currentTime=0;}
}
