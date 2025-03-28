// Web worker that implements AES256

self.onmessage=function(evt){
  postMessage("An eval has been requested!");
  eval(evt.data);
}

let sbox=[
  0x63,
  0x7c,
  0x77,
  0x7b,
  0xf2,
  0x6b,
  0x6f,
  0xc5,
  0x30,
  0x01,
  0x67,
  0x2b,
  0xfe,
  0xd7,
  0xab,
  0x76,
  0xca,
  0x82,
  0xc9,
  0x7d,
  0xfa,
  0x59,
  0x47,
  0xf0,
  0xad,
  0xd4,
  0xa2,
  0xaf,
  0x9c,
  0xa4,
  0x72,
  0xc0,
  0xb7,
  0xfd,
  0x93,
  0x26,
  0x36,
  0x3f,
  0xf7,
  0xcc,
  0x34,
  0xa5,
  0xe5,
  0xf1,
  0x71,
  0xd8,
  0x31,
  0x15,
  0x04,
  0xc7,
  0x23,
  0xc3,
  0x18,
  0x96,
  0x05,
  0x9a,
  0x07,
  0x12,
  0x80,
  0xe2,
  0xeb,
  0x27,
  0xb2,
  0x75,
  0x09,
  0x83,
  0x2c,
  0x1a,
  0x1b,
  0x6e,
  0x5a,
  0xa0,
  0x52,
  0x3b,
  0xd6,
  0xb3,
  0x29,
  0xe3,
  0x2f,
  0x84,
  0x53,
  0xd1,
  0x00,
  0xed,
  0x20,
  0xfc,
  0xb1,
  0x5b,
  0x6a,
  0xcb,
  0xbe,
  0x39,
  0x4a,
  0x4c,
  0x58,
  0xcf,
  0xd0,
  0xef,
  0xaa,
  0xfb,
  0x43,
  0x4d,
  0x33,
  0x85,
  0x45,
  0xf9,
  0x02,
  0x7f,
  0x50,
  0x3c,
  0x9f,
  0xa8,
  0x51,
  0xa3,
  0x40,
  0x8f,
  0x92,
  0x9d,
  0x38,
  0xf5,
  0xbc,
  0xb6,
  0xda,
  0x21,
  0x10,
  0xff,
  0xf3,
  0xd2,
  0xcd,
  0x0c,
  0x13,
  0xec,
  0x5f,
  0x97,
  0x44,
  0x17,
  0xc4,
  0xa7,
  0x7e,
  0x3d,
  0x64,
  0x5d,
  0x19,
  0x73,
  0x60,
  0x81,
  0x4f,
  0xdc,
  0x22,
  0x2a,
  0x90,
  0x88,
  0x46,
  0xee,
  0xb8,
  0x14,
  0xde,
  0x5e,
  0x0b,
  0xdb,
  0xe0,
  0x32,
  0x3a,
  0x0a,
  0x49,
  0x06,
  0x24,
  0x5c,
  0xc2,
  0xd3,
  0xac,
  0x62,
  0x91,
  0x95,
  0xe4,
  0x79,
  0xe7,
  0xc8,
  0x37,
  0x6d,
  0x8d,
  0xd5,
  0x4e,
  0xa9,
  0x6c,
  0x56,
  0xf4,
  0xea,
  0x65,
  0x7a,
  0xae,
  0x08,
  0xba,
  0x78,
  0x25,
  0x2e,
  0x1c,
  0xa6,
  0xb4,
  0xc6,
  0xe8,
  0xdd,
  0x74,
  0x1f,
  0x4b,
  0xbd,
  0x8b,
  0x8a,
  0x70,
  0x3e,
  0xb5,
  0x66,
  0x48,
  0x03,
  0xf6,
  0x0e,
  0x61,
  0x35,
  0x57,
  0xb9,
  0x86,
  0xc1,
  0x1d,
  0x9e,
  0xe1,
  0xf8,
  0x98,
  0x11,
  0x69,
  0xd9,
  0x8e,
  0x94,
  0x9b,
  0x1e,
  0x87,
  0xe9,
  0xce,
  0x55,
  0x28,
  0xdf,
  0x8c,
  0xa1,
  0x89,
  0x0d,
  0xbf,
  0xe6,
  0x42,
  0x68,
  0x41,
  0x99,
  0x2d,
  0x0f,
  0xb0,
  0x54,
  0xbb,
  0x16,
];
let isbox=[];
for (let i=0;i<256;i++){isbox.push(0);}
for (let i=0;i<256;i++){isbox[sbox[i]]=i;}

// Helpers (states are always arrays of arrays):

function _mlt(a,b){
  // Multiply a and b in GF(2^8)
  let res=0;
  for (let i=0;i<8;i++){
    if (b&1){res^=a;}
    let reduce=(a&0x80)>0;
    a=(a<<1)&0xff;
    if (reduce){a^=0x1b;}
    b>>=1;
  }
  return res;
}

function SubBytes(state){// Unit tested
  for (let i=0;i<4;i++){
    for (let j=0;j<4;j++){
      state[i][j]=sbox[state[i][j]];
    }
  }
}

function InvSubBytes(state){// Unit tested
  for (let i=0;i<4;i++){
    for (let j=0;j<4;j++){
      state[i][j]=isbox[state[i][j]];
    }
  }
}

function ShiftRows(state){// Unit tested
  let res=[
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0]
  ];
  for (let i=0;i<4;i++){
    for (let j=0;j<4;j++){
      res[i][(j+4-i)%4]=state[i][j];
    }
  }
  for (let i=0;i<4;i++){
    for (let j=0;j<4;j++){
      state[i][j]=res[i][j];
    }
  }
}

function InvShiftRows(state){// Unit tested
  let res=[
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0]
  ];
  for (let i=0;i<4;i++){
    for (let j=0;j<4;j++){
      res[i][(j+i)%4]=state[i][j];
    }
  }
  for (let i=0;i<4;i++){
    for (let j=0;j<4;j++){
      state[i][j]=res[i][j];
    }
  }
}

function MixColumns(state){// Unit tested
  for (let i=0;i<4;i++){
    let tmp=[0,0,0,0];
    tmp[0]=
      _mlt(state[0][i],2)^
      _mlt(state[1][i],3)^
      state[2][i]^
      state[3][i];
    tmp[1]=
      state[0][i]^
      _mlt(state[1][i],2)^
      _mlt(state[2][i],3)^
      state[3][i];
    tmp[2]=
      state[0][i]^
      state[1][i]^
      _mlt(state[2][i],2)^
      _mlt(state[3][i],3);
    tmp[3]=
      _mlt(state[0][i],3)^
      state[1][i]^
      state[2][i]^
      _mlt(state[3][i],2);
    for (let j=0;j<4;j++){
      state[j][i]=tmp[j];
    }
  }
}

function InvMixColumns(state){// Unit tested
  for (let i=0;i<4;i++){
    let tmp=[0,0,0,0];
    tmp[0]=
      _mlt(state[0][i],0xe)^
      _mlt(state[1][i],0xb)^
      _mlt(state[2][i],0xd)^
      _mlt(state[3][i],0x9);
    tmp[1]=
      _mlt(state[0][i],0x9)^
      _mlt(state[1][i],0xe)^
      _mlt(state[2][i],0xb)^
      _mlt(state[3][i],0xd);
    tmp[2]=
      _mlt(state[0][i],0xd)^
      _mlt(state[1][i],0x9)^
      _mlt(state[2][i],0xe)^
      _mlt(state[3][i],0xb);
    tmp[3]=
      _mlt(state[0][i],0xb)^
      _mlt(state[1][i],0xd)^
      _mlt(state[2][i],0x9)^
      _mlt(state[3][i],0xe);
    for (let j=0;j<4;j++){
      state[j][i]=tmp[j];
    }
  }
}


// Helpers for key expansion:

function SubWord(wd){// Unit tested
  let res=[0,0,0,0];
  for (let i=0;i<4;i++){
    res[i]=sbox[wd[i]];
  }
  return res;
}

function RotWord(wd){// Unit tested
  let tmp=[0,0,0,0];
  tmp[0]=wd[1];
  tmp[1]=wd[2];
  tmp[2]=wd[3];
  tmp[3]=wd[0];
  return tmp;
}

function _xorWord(a,b){
  // xors two words:
  return [a[0]^b[0],
          a[1]^b[1],
          a[2]^b[2],
          a[3]^b[3]
          ];
}

function KeyExpansion(key, w){
  let Nk=8;
  let i=0;
  let temp=[0,0,0,0];
  let Rcon=[
    [0,0,0,0],
    [0x1,0,0,0],
    [0x2,0,0,0],
    [0x4,0,0,0],
    [0x8,0,0,0],
    [0x10,0,0,0],
    [0x20,0,0,0],
    [0x40,0,0,0],
    [0x80,0,0,0],
    [0x1b,0,0,0],
    [0x36,0,0,0]
    ];
  while (i<Nk){
    w[i]=[key[4*i],key[4*i+1],key[4*i+2],key[4*i+3]];
    i++;
  }
  while (i<60){
    temp=JSON.parse(JSON.stringify(w[i-1]));
    if (i%Nk==0){
      temp=_xorWord(SubWord(RotWord(temp)),Rcon[i/Nk]);
    }
    else if (i%Nk==4){
      temp=SubWord(temp);
    }
    w[i]=_xorWord(w[i-Nk],temp);
    i++;
  }
}

function AddRoundKey(state, w, ind){
  for (let i=0;i<4;i++){
    for (let j=0;j<4;j++){
      state[j][i]^=w[ind+i][j];
    }
  }
}

function aes(
  inp, // Uint8Array length 16 representing input
  key, // Uint8Array length 32 representing key
  mode // false if decryting, true if encrypting
){
  if (mode){
    let state=[
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0]
    ];
    for (let i=0;i<4;i++){
      for (let j=0;j<4;j++){
        state[i][j]=inp[i+4*j];
      }
    }
    let w=[];
    for (let i=0;i<60;i++){w.push([0,0,0,0]);}
    KeyExpansion(key,w);
    AddRoundKey(state,w,0);
    for (let round=1;round<14;round++){
      SubBytes(state);
      ShiftRows(state);
      MixColumns(state);
      AddRoundKey(state,w,round*4);
    }
    SubBytes(state);
    ShiftRows(state);
    AddRoundKey(state,w,56);
    let res=new Uint8Array(16);
    for (let i=0;i<4;i++){
      for (let j=0;j<4;j++){
        res[i+4*j]=state[i][j];
      }
    }
    return res;
  }
  else{
    let state=[
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0]
    ];
    for (let i=0;i<4;i++){
      for (let j=0;j<4;j++){
        state[i][j]=inp[i+4*j];
      }
    }
    let w=[];
    for (let i=0;i<60;i++){w.push([0,0,0,0]);}
    KeyExpansion(key,w);
    AddRoundKey(state,w,56);
    for (let round=13;round>0;round--){
      InvShiftRows(state);
      InvSubBytes(state);
      AddRoundKey(state,w,round*4);
      InvMixColumns(state);
    }
    InvShiftRows(state);
    InvSubBytes(state);
    AddRoundKey(state,w,0);
    let res=new Uint8Array(16);
    for (let i=0;i<4;i++){
      for (let j=0;j<4;j++){
        res[i+4*j]=state[i][j];
      }
    }
    return res;
  }
}
