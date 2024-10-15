// Open source RSA keygen software for web browsers

// Generate 2048 bit prime number:

// Helpers:
function fastExpMod(base, exp, mod) {// parameters are BinInts
  // Convert exp into bit list to use square and multiply algorithm
  let expBinStr=exp.toString(2);
  // Implimentation:
  let res=BigInt(1);
  let mlt=1;
  for (let i=expBinStr.length-1;i>=0;i--){
    if (expBinStr[i]==="1"){
      res*=mlt;
      res%=mod;
    }
    mlt*=2;
    mlt%=mod;
  }
  return res;
}

function probP(prm, rounds){
  // Does a Miller-Rabin test for a given base and number
  // Decompose n-1 into d*2^s
  let d=n-1;
  let s=0;
  while (d%2==0){
    s++;
    d/=2;
  }
  for (let a=2;a<rounds+2;a++){
    let x=fastExpMod(a,d,prm);
  }
}
