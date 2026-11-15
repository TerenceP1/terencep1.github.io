// argon2.worker.js
// // Import hash-wasm via CDN inside the worker
importScripts(
  "https://cdn.jsdelivr.net/npm/hash-wasm@4/dist/argon2.umd.min.js",
);
//import { argon2id, argon2Verify } from "hash-wasm";

self.onmessage = async function (e) {
  const { password, salt, parallelism, memoryCost, timeCost } = e.data;

  try {
    // Compute Argon2id hash using hash-wasm
    const hash = await hashwasm.argon2id({
      password: password,
      salt: salt,
      parallelism: parallelism,
      memorySize: memoryCost, // in KiB
      iterations: timeCost,
      hashLength: 64, // output length in bytes
      outputType: "encoded", // returns the standard $argon2id$v=... string
    });

    // Send the result back to the main thread
    self.postMessage({ success: true, hash: hash });
  } catch (err) {
    self.postMessage({ success: false, error: err.message });
  }
};
