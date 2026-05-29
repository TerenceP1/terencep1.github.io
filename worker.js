let started = false;
let makeRowDouble2, makeRowFloat, makeRowDouble;
let id;
let genId = 0.0;
let width = 400;
let buf = -1; // = new Uint8Array(400 * 3);
//let buf2;
let palette2;
let palettePtr = -1;
function run2() {
  makeRowDouble2 = Module.cwrap("makeRowDouble2", null, [
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
    // double-double
    let cFunc = makeRowDouble2;
    let step = new Decimal(4).div(zoom).div(aspect); // copying from my MandelbrotAsm c++ project to betetr fit
    let re2 = re.sub(new Decimal(2 * width).div(aspect).div(zoom)); //  (except for zoom because it increases
    let im2 = im.add(new Decimal(2 * height - 4 * row).div(aspect).div(zoom)); //  as does with the old design choice I made 2 years ago)
    //console.log(`Row ${row} is im=${im2.toString()}`);
    cFunc(
      ...toDouble2(re2),
      ...toDouble2(im2),
      ...toDouble2(step),
      speclen,
      maxitr,
      palettePtr,
      buf,
      BigInt(width),
    );
    return Module.HEAPU8.subarray(buf, buf + width * 3); // to be converted from BGR->RGBA
  }
}

self.onmessage = function (event) {
  let dat = event.data;
  switch (dat.type) {
    case 0: // startup
      importScripts("mandelbrot.js");
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
      this.postMessage({type:2});
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
  }
};
