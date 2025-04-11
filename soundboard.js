// hover focus

let itms=getElementsByClassName("button");
for (let i=0;i<itms.length();i++){
  itms[i].addEventListener("mouseover",function(){itms[i].focus();});
}
