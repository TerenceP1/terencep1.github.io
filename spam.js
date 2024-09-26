
function spam(url, msg){
  let rq=new XMLHttpRequest();
  rq.open("POST",url);
  rq.send("{\"text\":\""+msg+"\"}");
  setTimeout(function(){spam(url,msg);},1000);
}
