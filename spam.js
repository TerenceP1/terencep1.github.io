
function spam(url, msg){
  let rq=XMLHttpRequest();
  rq.open("POST",url);
  rq.send("{\"text\":\""+msg+"\"}");
  setTimeout(function(){spam(url,msg)},200);
}
