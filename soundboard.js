// hover focus

let itms=document.getElementsByClassName("button");
for (let i=0;i<itms.length();i++){
  itms[i].addEventListener("mouseover",function(){itms[i].focus();});
}
