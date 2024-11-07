// Open source RSA keygen software for web workers

self.onmessage=function(code){postMessage("An eval has been requested!");eval(code.data);};

// Generate 2048 bit prime number:

// Helpers:
function fastExpMod(base, exp, mod) {// parameters are BinInts
  // Convert exp into bit list to use square and multiply algorithm
  let expBinStr=exp.toString(2);
  // Implimentation:
  let res=BigInt(1);
  let mlt=base;
  for (let i=expBinStr.length-1;i>=0;i--){
    if (expBinStr[i]==="1"){
      res*=mlt;
      res%=mod;
    }
    mlt*=mlt;
    mlt%=mod;
  }
  return res;
}

function probP(prm, rounds){
  // Does a Miller-Rabin test for a given base and number
  // Decompose n-1 into d*2^s
  if (prm%2n==0){//postMessage("Divisable by 2");
                 return false;}
  let bigIntMin = (...args) => args.reduce((m, e) => e < m ? e : m);
  let d=prm-1n;
  let s=0n;
  //postMessage("starting pow2");
  while (d%2n==0n){
    s++;
    d/=2n;
  }
  //postMessage("decompsed.");
  for (let a=0;a<rounds;a++){
    let nmt=BigInt(2+Math.floor(Math.random()*(Number(bigIntMin(prm,1000000000n))-4)));
    let x=fastExpMod(nmt,d,prm);
    //postMessage("Testing a="+nmt+", prm="+prm+": x="+x+", s="+s+", d="+d+"...");
    if (x==1n){
      //postMessage("x is 1");
      continue;
    }
    else if (x==prm-1n){
      //postMessage("x is prm-1");
      continue;
    }
    else if (s==1n){
      //postMessage("s is 1");
      return false;
    }
    else {
      let comp=true;
      for (let i=0;i<Number(s)-1;i++) {
        x=(x*x)%prm;
        //postMessage("|-Testing x="+x+"...");
        if (x==prm-1n){comp=false;break;}
        if (x==1n){//postMessage("||-Reached 1");
                   return false;}
      }
      if (comp){//postMessage("||-Never reached prm-1");
                return false;}
      //postMessage("|-Pass!");
    }
  }
  return true;
}


function genPrm() {
  let res=0n;
  let mlt=0x100n;
  let amt=0;
  do {
    amt++;
    if (amt%50==0){
      postMessage(amt+" primes tested!!!");
    }
    res=0n;
    let tmp=new Uint8Array(256);
    crypto.getRandomValues(tmp);
    for (let i=0;i<256;i++){
      res*=mlt;
      res+=BigInt(tmp[i]);
    }
  }while (!probP(res,40));
  postMessage(res+" is prime!!!"); 
  return res;
}

// Extended Euclidean algorithm:
function euAlg(base, mod){// Parameters are all BigInt s
  // function assumes base and mod are coprime
  let mdLst=[mod, base];
  while (mdLst[mdLst.length-1]>1n){
    mdLst.push(mdLst[mdLst.length-2]%mdLst[mdLst.length-1]);
  }
  postMessage("Mod operation complete");
  let res=0n;
  for (let i=mdLst.length-2;i>=0;i--){
    res=(1n-mdLst[i]*res)/mdLst[i+1];
  }
  res%=mod;
  if (res<0n){
    res+=mod;
  }
  postMessage("Your private key should appear at any moment...");
  return res;
}

// Convert BigInt to hex
function mkHex(num,len){
  let res=num.toString(16);
  while (res.length<len){
    res="0"+res;
  }
  return res;
}

function gcd(a,b){
  while (a!=b&&a!=0n&&b!=0n){
    if (a>b){
      a%=b;
    }
    else{
      b%=a;
    }
  }
  return a>b?a:b;
}

function lcm(a,b){return a*b/gcd(a,b);}

// Keygen:
function keygen(){
  postMessage("Generating 2 primes. This may take a few seconds to a few minutes based on how fast your device is...");
  let pr1=genPrm();
  let pr2=genPrm();
  postMessage("Making keys...");
  let mlt=pr1*pr2;
  postMessage("Your public key is (anyone can see it): "+mkHex(mlt,1024));
  postMessage({reg:"pub",val:mkHex(mlt,1024)});
  let prv=euAlg(0x10001n,lcm(pr1-1n,pr2-1n));
  postMessage("Your private key is (keep secret): "+mkHex(mlt,1024)+mkHex(prv,1024));
  postMessage({reg:"prv",val:mkHex(mlt,1024)+mkHex(prv,1024)});
}

function enc(aesK, key){
  postMessage({reg:"eaes",val:fastExpMod(BigInt("0x"+aesK),0x10001n,BigInt("0x"+key))});
}

function denc(aesK, key){
  postMessage({reg:"aes",val:("0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"+fastExpMod(BigInt("0x"+aesK),BigInt("0x"+key.slice(1024,1024),BigInt("0x"+key.slice(0,1024)))).toString(16)).slice(-1024});
}
  
