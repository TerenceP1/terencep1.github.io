// obtain url

// sorry its hardcoded will be encrypted soon

let url =
  "wss://free.blr2.piesocket.com/v3/1?api_key=PrXGxBurNTQHrKy0WaMvGlkw5s3PvQag1ID2i2Ou";

// get element things

let signalstat = document.getElementById("signalstat");
let rtcstat = document.getElementById("rtcstat");

// deal with the signaling first

let sock = new WebSocket(url);

function onDead(e) {
  sock = new WebSocket(url);
  signalstat.innerText = "Connecting...";
  if (!connected) rtcstat.innerText = "No signaling";
}

function opened(e) {
  signalstat.innerText = "Connected";
  if (!connected) rtcstat.innerText = "Waiting on signal";
}

function msg(e) {
  let parsed = JSON.parse(e.data);
  if (parsed["from"] === "computer") {
    gotSignal(parsed["msg"]);
  }
}
sock.onerror = onDead;
sock.onclose = onDead;
sock.onopen = opened;
sock.onmessage = msg;

// WebRTC part

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};
let pc;
let dataChannel;
let connected = false;

async function gotSignal(sig) {
  console.log(JSON.stringify(sig));
  if (connected) return;
  try {
    connected = true;
    const remoteDescription = new RTCSessionDescription({
      type: sig.type,
      sdp: sig.sdp,
    });

    pc = new RTCPeerConnection(configuration);
    //dataChannel = pc.createDataChannel("data");
    pc.ondatachannel = (event) => {
      dataChannel = event.channel;
      dataChannel.onmessage = (e) => {
        console.log("Computer sent", e.data);
      };
    };
    pc.onicegatheringstatechange = () => {
      if (pc.iceGatheringState === "complete") {
        // 1. Grab your fully populated description from the connection object
        const finalLocalDescription = pc.localDescription;

        // 2. Format it into the exact JSON structure the signaling socket expects
        const responsePayload = {
          from: "phone",
          msg: {
            type: finalLocalDescription.type, // Will be "answer"
            sdp: finalLocalDescription.sdp, // The raw text block containing your STUN addresses
          },
        };

        // 3. Stringify the object if your socket requires raw text data
        const jsonText = JSON.stringify(responsePayload);

        // 4. PUSH IT OUT TRANSMISSION: Send it through your active socket
        // Replace 'yourSocketInstance' with your actual socket, WebSocket, or socket.io variable
        sock.send(jsonText);
        rtcstat.innerText = "Connecting...";
        pc.onconnectionstatechange = () => {
          console.log("Connection State Changed:", pc.connectionState);

          if (pc.connectionState === "connected") {
            console.log("SUCCESS: Peers are directly connected!");
            rtcstat.innerText = "Connected";
          } else if (
            pc.connectionState === "new" ||
            pc.connectionState === "connecting"
          ) {
          } else {
            console.error(`FAILURE: ${pc.connectionState}`);
    alert(`FAILURE: ${pc.connectionState}`);
            connected = false;
            rtcstat.innerText = "Waiting on signal";
          }
        };

        console.log("Your description has been sent back to the computer!");
      }
    };
    rtcstat.innerText = "Gathering ICE data";
    await pc.setRemoteDescription({
      type: sig.type,
      sdp: sig.sdp,
    });
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
  } catch (e) {
    // Code that handles the error
    console.error("An error occurred:", e.message);
    alert(e.message);
    connected = false;
    rtcstat.innerText = "Waiting on signal";
  }
}
