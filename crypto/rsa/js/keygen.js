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
    mlt*=base;
    mlt%=mod;
  }
  return res;
}

function probP(prm, rounds){
  // Does a Miller-Rabin test for a given base and number
  // Decompose n-1 into d*2^s
  if (prm%2n==0){postMessage("Divisable by 2");return false;}
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
    postMessage("Testing a="+a+", prm="+prm+": x="+x+", s="+s+", d="+d+"...");
    if (x==1n){
      postMessage("x is 1");
      continue;
    }
    else if (x==prm-1n){
      postMessage("x is prm-1");
      continue;
    }
    else if (s==1n){
      postMessage("s is 1");
    }
    else {
      let comp=true;
      for (let i=0;i<Number(s)-1;i++) {
        x=(x*x)%prm;
        postMessage("|-Testing x="+x+"...");
        if (x==prm-1n){comp=false;break;}
        if (x==1n){postMessage("||-Reached 1");return false;}
      }
      if (comp){postMessage("||-Never reached prm-1");return false;}
      postMessage("|-Pass!");
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
