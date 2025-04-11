// hover focus

let itms=document.getElementsByClassName("button");
for (let i=0;i<itms.length;i++){
  let ahh=itms[i];
  itms[i].addEventListener("mouseover",function(){ahh.focus();ahh.click();console.log(ahh);});
}
