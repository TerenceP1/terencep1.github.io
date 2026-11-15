// hash of sha
let VERIFY_HASH =
  "6c29689a6a81343d2f75857d6b02b40bbf1a9f23b8aba9ac95c37a5128d3efaed5f056483f149a224d98cce0593f399c12f84e2a888f7140d7e99ff9458e1860";
// salt

const saltBase64 = "AsQvUk6adu8CTGYSdjpZC6r7srf6cW8bnYQ03v6egn8";

const salt = Uint8Array.from(atob(saltBase64), (c) => c.charCodeAt(0));

// api key

const encryptedAPIKey =
  "83e3dc0a4b2cce445d6b54668c4ec8d549cc0a6e8a754f9108542dd9bf9e2976acbec6044ab692eeb5c07ea2e2d54d166bdf8965cc5eec8d0558005b482b27d0730f3dd4734f7598b0be2b716d58ebe694353ce268f6e155265326111b9dbc44";
const apikeyNonce = "5a1c6bf8188344e706ef9cb4172351e3";
const apikeypad = 13;

// password and auth

// web worker

let argon_worker = new Worker("argon_worker.js?cachebust=" + Math.random());

let e_pwdstat = document.getElementById("pwdstat");
let e_passbox = document.getElementById("passwordsec");
let e_pwd = document.getElementById("mainpwd");
let argon_hash;
let api_key;

function hexToBytes(hex) {
  return new Uint8Array(hex.match(/.{2}/g).map((byte) => parseInt(byte, 16)));
}

async function sha256_hash(inp) {
  const data = new TextEncoder().encode(inp);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  // const hex = Array.from(new Uint8Array(hashBuffer))
  // .map((byte) => byte.toString(16).padStart(2, "0"))
  // .join("");
  return hashBuffer;
}

async function decrypt_api_key() {
  const key = await crypto.subtle.importKey(
    "raw",
    await sha256_hash(argon_hash + "-auth-key"),
    { name: "AES-CTR" },
    false,
    ["decrypt"],
  );

  const plaintextBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-CTR",
      counter: hexToBytes(apikeyNonce),
      length: 64,
    },
    key,
    hexToBytes(encryptedAPIKey),
  );
  api_key = new TextDecoder().decode(plaintextBuffer).slice(0, -13);
  document.getElementById("mainstuff").removeAttribute("hidden");
  startsigsock();
}

async function hash_argon_verify(hash) {
  const data = new TextEncoder().encode(hash + "-auth-vf");
  const hashBuffer = await crypto.subtle.digest("SHA-512", data);
  const hex = Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  console.log("GOT HASH SHA", hex);
  if (VERIFY_HASH === hex) {
    e_passbox.setAttribute("hidden", "");
    argon_hash = hash;
    await decrypt_api_key();
  } else {
    e_pwdstat.innerText = "Password incorrect!";
  }
}

argon_worker.addEventListener("message", (e) => {
  // extract the hash part
  console.log("WORKER MESSAGE", JSON.stringify(e.data));
  const hash = e.data.hash.split("$").at(-1);
  // append -auth-rm and sha-512
  hash_argon_verify(hash);
});

function checkpwd() {
  // request an argon hash
  const worker_in = {
    password: e_pwd.value,
    salt: salt,
    parallelism: 1,
    memoryCost: 200000,
    timeCost: 15,
  };
  argon_worker.postMessage(worker_in);
  e_pwdstat.innerText = "Checking...";
}

// signaling manager (for the direct conns negotiation)

/** @type {WebSocket} */
let sigsock;
let e_sigstat = document.getElementById("signalconn");
let e_authstat = document.getElementById("authstat");

let computerPubKey =
  "ff60e5b55c8a6f31e8e19443c152a5bae5fef037b92f512e722fa8484d83851f";
let computerPubKey2;

function arrayBufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function importX25519PublicKey(hex) {
  // Convert hex string to bytes
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error("Invalid X25519 public key: expected 64 hex characters");
  }

  const bytes = new Uint8Array(
    hex.match(/.{2}/g).map((byte) => parseInt(byte, 16)),
  );

  // Import as an X25519 public key
  return await crypto.subtle.importKey(
    "raw",
    bytes,
    { name: "X25519" },
    false,
    [],
  );
}

let sigPrivateKey, sigPublicKey, sigPublicHex, sharedSecret;
let c_uuid;

// storage functions

async function aescbc(inp) {
  const plaintext = new TextEncoder().encode(inp);
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    await crypto.subtle.importKey(
      "raw",
      await sha256_hash(argon_hash + "-storage"), // Uint8Array or ArrayBuffer, exactly 32 bytes
      { name: "AES-CBC" },
      false,
      ["encrypt", "decrypt"],
    ),
    plaintext,
  );
  return JSON.stringify({
    iv: arrayBufferToHex(iv),
    ciphertext: arrayBufferToHex(ciphertext),
  });
}

async function invaescbc(inp) {
  const parsed = JSON.parse(inp);
  const iv = hexToBytes(parsed.iv);
  const ciphertext = hexToBytes(parsed.ciphertext);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv },
    await crypto.subtle.importKey(
      "raw",
      await sha256_hash(argon_hash + "-storage"), // Uint8Array or ArrayBuffer, exactly 32 bytes
      { name: "AES-CBC" },
      false,
      ["encrypt", "decrypt"],
    ),
    ciphertext,
  );
  return new TextDecoder().decode(plaintext);
}

async function askAuth() {
  computerPubKey2 = await importX25519PublicKey(computerPubKey);
  const keyPair = await crypto.subtle.generateKey({ name: "X25519" }, true, [
    "deriveBits",
  ]);

  sigPrivateKey = keyPair.privateKey;
  sigPublicKey = keyPair.publicKey;
  const rawPublic = await crypto.subtle.exportKey("raw", sigPublicKey);

  sigPublicHex = Array.from(new Uint8Array(rawPublic))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const sharedSecret2 = await crypto.subtle.deriveBits(
    {
      name: "X25519",
      public: computerPubKey2,
    },
    sigPrivateKey,
    256,
  );
  sharedSecret = await crypto.subtle.digest("SHA-256", sharedSecret2);
  console.log("shared secret", arrayBufferToHex(sharedSecret));
  // now we have shared secret now to authenticate this message
  const hmacKey = await crypto.subtle.importKey(
    "raw",
    await sha256_hash(argon_hash + "-osign"),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );

  // Sign the public key bytes
  const signature = await crypto.subtle.sign("HMAC", hmacKey, rawPublic);

  // send this info over websockets

  sigsock.send(
    JSON.stringify({
      type: "handshake",
      pubkey: sigPublicHex,
      hmac: arrayBufferToHex(signature),
    }),
  );

  // cache this info

  const toSave = {
    pubkey: sigPublicHex,
    hmac: arrayBufferToHex(signature),
    sharedsecret: arrayBufferToHex(sharedSecret),
  };
  console.log("SAVING COOOKIE");
  await cookieStore.set({
    name: "sigauthrqc",
    value: await aescbc(JSON.stringify(toSave)),
    expires: Date.now() + 60 * 60 * 1000,
    path: "/",
    sameSite: "lax",
  });
  e_authstat.innerText = "Authorizing (sent request)...";
}

async function authrequest() {
  e_authstat.innerText = "Authorizing...";
  let authinfo;
  if ((authinfo = await cookieStore.get("sigauthrqc"))) {
    let authcookie = authinfo.value;
    let decryptedC = JSON.parse(await invaescbc(authcookie));
    if (Object.hasOwn(decryptedC, "uuid")) {
      c_uuid = decryptedC.uuid;
      sigPublicHex = decryptedC.pubkey;
      sharedSecret = hexToBytes(decryptedC.sharedsecret);
      e_authstat.innerText = "Authorized";
    } else {
      console.log("Recovering from failed handshake");
      await askAuth();
    }
  } else {
    console.log("Not found for cookie");
    await askAuth();
  }
}

function onsigopen(e) {
  e_sigstat.innerText = "Connected";
  // deal with auth
  authrequest();
}

function startsigsock() {
  e_sigstat.innerText = "Connecting...";
  sigsock = new WebSocket(api_key);
  sigsock.onopen = onsigopen;
  sigsock.onclose = startsigsock;
  sigsock.onmessage = sigmsg;
}

// encrypted comms layer

//let gotUUID = false;

async function decryptGcm(msg) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    sharedSecret,
    { name: "AES-GCM" },
    false, // false if you want to prevent JavaScript from exporting it back to raw bytes
    ["encrypt", "decrypt"],
  );
  let cbuf = hexToBytes(msg);
  const iv = cbuf.subarray(0, 12);

  const ciphertext = cbuf.subarray(12);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    cryptoKey,
    ciphertext,
  );
  return decrypted;
}

async function encryptGcm(msg) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    sharedSecret,
    { name: "AES-GCM" },
    false, // false if you want to prevent JavaScript from exporting it back to raw bytes
    ["encrypt", "decrypt"],
  );
  let plaintext = new TextEncoder().encode(msg);
  let iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    cryptoKey,
    plaintext,
  );
  return arrayBufferToHex(iv) + arrayBufferToHex(ciphertext);
}

async function askNewConn() {
  if (c_uuid) {
    dcurl = " ";
    setTimeout(() => {
      if (dcurl !== " ") dcurl = "";
    }, 0.5);
    await sigsock.send(
      JSON.stringify({
        type: "msg",
        uuid: c_uuid,
        msg: await encryptGcm("OPENPORT"),
      }),
    );
  } else {
    await askAuth();
  }
}

let dcurl = "";
let dcsock;
let e_dcstat = document.getElementById("dcstat");
let dctry_ts;
let is_nonce_dc = true;

async function dcmessagehandle(e) {
  if (is_nonce_dc) {
    // it is garanteed to be the nonce
    is_nonce_dc = false;
    const hmacKey = await crypto.subtle.importKey(
      "raw",
      await sha256_hash(argon_hash + "-auth-dc"),
      {
        name: "HMAC",
        hash: "SHA-256",
      },
      false,
      ["sign"],
    );

    const response = await crypto.subtle.sign("HMAC", hmacKey, e.data);
    dcsock.send(response);
    console.log("AUTHED");
    e_dcstat.innerText = "Connected";
  } else {
    // message format: json
    // must have a type key with the info
    // binary messages must start with a random header which was declared beforehand
    // header to be removed
    if (e.data instanceof ArrayBuffer) {
      handle_binmsg(e.data);
    } else {
      handle_txtmsg(JSON.parse(e.data));
    }
  }
}

function dcready(e) {
  e_dcstat.innerText = "Connected (Completing auth)";
}

async function handleSockConn() {
  if (Date.now() - dctry_ts > 10000) {
    dcurl = "";
    return;
  }
  dcsock = new WebSocket(dcurl);
  dcsock.onmessage = dcmessagehandle;
  dcsock.onopen = dcready;
  dcsock.onclose = () => {
    if (is_nonce_dc) {
      handleSockConn();
    } else {
      dcurl = "";
    }
  };
  dcsock.binaryType = "arraybuffer";
  e_dcstat.innerText = "Connecting...";
  is_nonce_dc = true;
}

async function sigmsg(e) {
  console.log("GOT MESSAGE FROM SIGNALING: ", e.data);
  // try json everything is
  let parsed = JSON.parse(e.data);
  if (parsed.type === "handshake") {
    if (parsed.pubkey === sigPublicHex) {
      // its meant for me
      // verify its good

      let decoded = new TextDecoder().decode(await decryptGcm(parsed.verify));
      if (decoded === "VERIFY") {
        console.log("VERIFIED");
        let cookieAuth = JSON.parse(
          await invaescbc((await cookieStore.get("sigauthrqc")).value),
        );
        cookieAuth.uuid = parsed.uuid;
        c_uuid = parsed.uuid;
        await cookieStore.set({
          name: "sigauthrqc",
          value: await aescbc(JSON.stringify(cookieAuth)),
          expires: Date.now() + 60 * 60 * 1000,
          path: "/",
          sameSite: "lax",
        });
        console.log("MY UUID!!!", c_uuid);

        e_authstat.innerText = "Authorized";
      }
    }
  } else if (parsed.type === "msg") {
    // only type coming to me will be where to connect

    if (parsed.uuid === c_uuid) {
      // decrypt
      let dmsg = new TextDecoder().decode(await decryptGcm(parsed.msg));
      if (dmsg.startsWith("wss://")) {
        console.log("GOT URL", dmsg);
        dcurl = dmsg;
        handleSockConn();
      }
    }
  }
}

setInterval(() => {
  // check for whether to direct connect
  if (dcurl === "") {
    if (sigsock && sigsock.readyState == 1) {
      askNewConn();
      dctry_ts = Date.now();
    }
  }
}, 1000);

let getE = (...a) => document.getElementById(...a);

let mainInfo = {};

function updMainInfo() {
  getE("wstat").innerText = mainInfo.rstat;
  getE("gprog").innerText = mainInfo.prog;
  getE("rtime").innerText = mainInfo.timer;
}

async function handle_txtmsg(msg) {
  if (msg.type === "overview") {
    mainInfo = msg;
    updMainInfo();
  }
}
async function handle_binmsg(msg) {}
