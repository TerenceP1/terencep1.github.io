let rqs=0;
function spam(url, msg){
  while (true){
    let rq=XMLHttpRequest();
    rq.open("POST",url);
    rq.send("{\"text\":\""+msg+"\"}");
  }
}
