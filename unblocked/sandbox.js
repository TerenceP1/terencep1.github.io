// This file sandboxes everything through a proxy
function(){
  let origin=window.location.origin;
  function proxynate(url){
    let ourl=url;
    if (url.startsWith("https://")){
      url=url.substring(8);
    }
    else{
      ourl="https://"+origin+ourl;
    }
    url="https://unblocked2.vercel.app"+url;
    return {url:url,ourl:ourl};
  }
  function readonly(ths,a){
    Object.defineProperty(ths, a, {
      value: ths[a],
      writable: false
    });
  }
  // Block fetch
  let oRequest=window.Request;
  window.Request=function(a,b=undefined){
    let frq;
    if (typeof a !== "string"){
      this.body = a.body;readonly(this,"body");
      this.bodyUsed = a.bodyUsed;readonly(this,"bodyUsed");
      this.cache = a.cache;readonly(this,"cache");
      this.credentials = a.credentials;readonly(this,"credentials");
      this.destination = a.destination;readonly(this,"destination");
      this.headers = a.headers;readonly(this,"headers");
      this.integrity = a.integrity;readonly(this,"integrity");
      this.isHistoryNavigation = a.isHistoryNavigation;readonly(this,"isHistoryNavigation");
      this.keepalive = a.keepalive;readonly(this,"keepalive");
      this.method = a.method;readonly(this,"method");
      this.redirect = a.redirect;readonly(this,"redirect");
      this.referrer = a.referrer;readonly(this,"referrer");
      this.referrerPolicy = a.referrerPolicy;readonly(this,"referrerPolicy");
      this.signal = a.signal;readonly(this,"signal");
      this.url = a.url;readonly(this,"url");
      this.mode = a.mode;
      if (a.mode === "navigate"){
        this.mode="same-origin";
      }
      readonly(this,"mode");
      this.arrayBuffer = a.arrayBuffer;
      this.blob = a.blob;
      this.bytes = a.bytes;
      this.clone = a.clone;
      this.formData = a.formData;
      this.json = a.json;
      this.text = a.text;
      return this;
    }
    else{
      let proxied=proxynate(a);
      if (typeof b === "undefined"){
        frq=new oRequest(proxied.url);
      }
      else{
        frq=new oRequest(proxied.url,b);
      }
      
      this.body = frq.body;readonly(this,"body");
      this.bodyUsed = frq.bodyUsed;readonly(this,"bodyUsed");
      this.cache = frq.cache;readonly(this,"cache");
      this.credentials = frq.credentials;readonly(this,"credentials");
      this.destination = frq.destination;readonly(this,"destination");
      this.headers = frq.headers;readonly(this,"headers");
      this.integrity = frq.integrity;readonly(this,"integrity");
      this.isHistoryNavigation = frq.isHistoryNavigation;readonly(this,"isHistoryNavigation");
      this.keepalive = frq.keepalive;readonly(this,"keepalive");
      this.method = frq.method;readonly(this,"method");
      this.mode = frq.mode;readonly(this,"mode");
      this.redirect = frq.redirect;readonly(this,"redirect");
      this.referrer = frq.referrer;readonly(this,"referrer");
      this.referrerPolicy = frq.referrerPolicy;readonly(this,"referrerPolicy");
      this.signal = frq.signal;readonly(this,"signal");
      this.url = frq.url;readonly(this,"url");
      this.arrayBuffer = frq.arrayBuffer;
      this.blob = frq.blob;
      this.bytes = frq.bytes;
      this.clone = frq.clone;
      this.formData = frq.formData;
      this.json = frq.json;
      this.text = frq.text;
      return this;
    }
  }
}();
