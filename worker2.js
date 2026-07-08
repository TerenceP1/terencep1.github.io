let started = false;
let makeRowDouble2, makeRowFloat, makeRowDouble;
let id;
let genId = 0.0;
let width = 400;
let buf = -1; // = new Uint8Array(400 * 3);
//let buf2;
let palette2;
let palettePtr = -1;

let refRePtr = -1;
let refImPtr = -1;
let refLen = -1;

function run2() {
  makeRowPert = Module.cwrap("makeRowPert", null, [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]);
  makeRowFloat = Module.cwrap("makeRowFloat", null, [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]);
  makeRowDouble = Module.cwrap("makeRowDouble", null, [
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
    "number",
  ]);
  width = 400;
  if (buf != -1) {
    Module._free(buf);
  }
  buf = Module._malloc(width * 3);

  postMessage({ type: 0 }); // 0 is done setup
}
var Module = {
  onRuntimeInitialized: run2,
  noInitialRun: true,
  noExitRuntime: true,
};
function decomposeNumber(num) {
  // chatgpt
  if (num === 0) return { sign: 0, exponent: 0, mantissa: 0n };

  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);

  view.setFloat64(0, num);

  const bits = view.getBigUint64(0);

  const sign = bits >> 63n;
  const exponent = (bits >> 52n) & 0x7ffn;
  const mantissa = bits & ((1n << 52n) - 1n);

  return {
    sign: Number(sign),
    exponent: Number(exponent) - 1023,
    mantissa,
  };
}
function toGoodDecimal(num) {
  // chatgpt
  // the reason i want this is  because new Decimal appears to do Number.toString or something related and this though
  // being enough for distinguishing numbers is not a truely faithful ieee double conversion so this is why
  const { sign, exponent, mantissa } = decomposeNumber(num);

  if (num === 0) return new Decimal(0);

  const m = new Decimal(mantissa.toString()).div(new Decimal(2).pow(52)).add(1);

  const value = m.mul(new Decimal(2).pow(exponent));

  return sign ? value.neg() : value;
}
function toDouble2(inp) {
  let hi = inp.toNumber();
  let lo = inp.sub(toGoodDecimal(hi)).toNumber();
  return [hi, lo];
}
function genRow(re, im, zoom, speclen, maxitr, row, height) {
  // re and im assumed Decimal
  //Decimal.set({ precision: Math.ceil() });
  let aspect = Math.min(width, height);
  if (zoom < 1e4) {
    // float
    let cFunc = makeRowFloat;
    let step = 4 / zoom / aspect; // copying from my MandelbrotAsm c++ project to betetr fit
    let re2 = re.sub((2 * width) / aspect / zoom); //  (except for zoom because it increases
    let im2 = im.add((2 * height - 4 * row) / aspect / zoom); //  as does with the old design choice I made 2 years ago)
    cFunc(
      re2.toNumber(),
      im2.toNumber(),
      step,
      speclen,
      maxitr,
      palettePtr,
      buf,
      BigInt(width),
    );
    return Module.HEAPU8.subarray(buf, buf + width * 3); // to be converted from BGR->RGBA
  } else if (zoom < 1e13) {
    // double
    let cFunc = makeRowDouble;
    let step = 4 / zoom / aspect; // copying from my MandelbrotAsm c++ project to betetr fit
    let re2 = re.sub((2 * width) / aspect / zoom); //  (except for zoom because it increases
    let im2 = im.add((2 * height - 4 * row) / aspect / zoom); //  as does with the old design choice I made 2 years ago)
    cFunc(
      re2.toNumber(),
      im2.toNumber(),
      step,
      speclen,
      maxitr,
      palettePtr,
      buf,
      BigInt(width),
    );
    return Module.HEAPU8.subarray(buf, buf + width * 3); // to be converted from BGR->RGBA
  } else {
    // pert
    let cFunc = makeRowPert;
    let step = new Decimal(4).div(zoom).div(aspect); // copying from my MandelbrotAsm c++ project to betetr fit
    //let re2 = new Decimal(-2 * width).div(aspect).div(zoom); //  (except for zoom because it increases
    //let im2 = new Decimal(2 * height - 4 * row).div(aspect).div(zoom); //  as does with the old design choice I made 2 years ago)
    //console.log(`Row ${row} is im=${im2.toString()}`);
    cFunc(
      -(2 * width) / aspect / zoom,
      (2 * height - 4 * row) / aspect / zoom,
      step,
      speclen,
      maxitr,
      palettePtr,
      buf,
      BigInt(width),
      refLen,
      refRePtr,
      refImPtr,
    );
    return Module.HEAPU8.subarray(buf, buf + width * 3); // to be converted from BGR->RGBA
  }
}

function makeRef(re, im, maxitr, prc, id) {
  let reOut = [];
  let imOut = [];
  let re2 = new Decimal(0);
  let im2 = new Decimal(0);
  let lstTime = 0;
  for (
    let i = 0;
    i < maxitr && re2.times(re2).plus(im2.times(im2)).lte(4);
    i++
  ) {
    reOut.push(re2.toNumber());
    imOut.push(im2.toNumber());
    let prod = re2.times(im2);
    re2 = re2.times(re2).minus(im2.times(im2)).plus(re);
    im2 = prod.plus(prod).plus(im);
    if (Date.now() - lstTime > 100) {
      this.postMessage({
        type: 4, // progress
        msg: `Reference progress (${prc} digits): ${i} iterations...`,
        id: id,
      });
      lstTime = Date.now();
    }
  }
  return [reOut, imOut];
}

self.onmessage = function (event) {
  let dat = event.data;
  switch (dat.type) {
    case 0: // startup
      importScripts("mandelbrot2.js");
      id = dat.id;
      importScripts(
        "https://cdn.jsdelivr.net/npm/decimal.js@10.4.3/decimal.min.js",
      );
      Decimal.set({ precision: 34 }); // around 110 bits which is what the c++ used
      console.log("READY");
      break;
    case 1: // set the generation ID (mayve not needed)
      genId = dat.id;
      break;
    case 2: // set width
      width = dat.width;
      if (buf != -1) {
        Module._free(buf);
      }
      buf = Module._malloc(width * 3);
      break;
    case 3: // make row
      //let startT = performance.now();
      let res = genRow(
        new Decimal(dat.re),
        new Decimal(dat.im),
        dat.zoom,
        dat.speclen,
        dat.maxitr,
        dat.row,
        dat.height,
      );
      res = new Uint8Array(res);
      //console.log(`Took about ${performance.now() - startT}ms to genRow`);
      this.postMessage(
        {
          type: 1,
          row: res,
          id: dat.id,
          row2: dat.row,
          ts: this.performance.now(),
        },
        [res.buffer],
      ); // should be copied
      break;

    case 4:
      // set pallete
      palette2 = dat.plt;
      if (palettePtr != -1) {
        Module._free(palettePtr);
      }
      palettePtr = Module._malloc(256 * 3);
      Module.HEAPU8.set(palette2, palettePtr);
      break;
    case 5: // make reference
      {
        Decimal.set({
          precision: Math.ceil(
            Math.ceil(Math.log10(dat.zoom * Math.max(width, dat.height))),
          ),
        });
        let re = new Decimal(dat.re);
        let im = new Decimal(dat.im);
        let res = makeRef(
          re,
          im,
          dat.maxitr,
          Math.ceil(Math.log10(dat.zoom * Math.max(width, dat.height))),
          dat.id,
        );
        this.postMessage({
          type: 2,
          re: res[0],
          im: res[1],
          id: dat.id,
          //ts: this.performance.now(),
        });
      }
      break;
    case 6: // set reference
      {
        if (refRePtr != -1) {
          Module._free(refRePtr);
          Module._free(refImPtr);
        }
        refRePtr = Module._malloc(8 * dat.re.length);
        refImPtr = Module._malloc(8 * dat.re.length);
        refLen = dat.re.length;
        let refReArr = new Float64Array(dat.re);
        let refImArr = new Float64Array(dat.im);
        Module.HEAPU8.set(new Uint8Array(refReArr.buffer), refRePtr);
        Module.HEAPU8.set(new Uint8Array(refImArr.buffer), refImPtr);
        this.postMessage({
          type: 3, // done setting reference
        });
      }
      break;
  }
};
