// This file sandboxes everything through a proxy
function(){
  let origin=window.location.origin;
  function proxynate(url){
    let ourl=url;
    if (url.startsWith("https://")){
      url=url.substring(8);
    }
    else{
      ourl=origin+ourl;
    }
    url="https://unblocked2.vercel.app"+url;
    return {url:url,ourl:ourl};
  }
  function readonly(ths,a,value){
    Object.defineProperty(ths, a, {
      get: function(){return value;},
      configurable: false,
      enumerable: true
    });
  }
  // Block fetch
  let oRequest=window.Request;
  window.Request=function(a,b=undefined){
    let frq;
    if (typeof a !== "string"){
      
      return new oRequest(a);
    }
    else{
      let proxied=proxynate(a);
      if (typeof b === "undefined"){
        frq=new oRequest(proxied.url);
      }
      else{
        frq=new oRequest(proxied.url,b);
      }
      
      
      readonly(frq,"url",proxied.ourl);
      
      return frq;
    }
  }
}();
