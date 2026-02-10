const net = require("net");
const express = require("express");

Const BRIDGE_LISTEN_PORT = 8787;
const DAS_HOST = "127.0.0.1";
const DAS_CMD_API_PORT = 5566;

// CHANGE THESE
const TRADER = "YOUR_TRADER";
const PASSWORD = "YOUR_PASSWORD";
const ACCOUNT = "YOUR_ACCOUNT";
const MONTAGE_WINDOW_NAME = "DasMontage";

let socket;
let loggedIn = false;

function connectToDAS() {
  socket = net.createConnection({ host: DAS_HOST, port: DAS_CMD_API_PORT }, () => {
    console.log("[DAS] connected");
    //socket.write(`LOGIN ${TRADER} ${PASSWORD} ${ACCOUNT} 0\r\n`);
  });

  socket.on("data", (data) => {
    const msg = data.toString().trim();
    console.log("[DAS]", msg);
    loggedIn = true;
  });

  socket.on("error", (err) => {
    console.error("[DAS] error", err.message);
  });

  socket.on("close", () => {
    console.log("[DAS] disconnected, retrying...");
    loggedIn = false;
    setTimeout(connectToDAS, 1000);
  });
}

connectToDAS();

// HTTP side
const app = express();
app.use(express.json());

app.post("/symbol", (req, res) => {
  const symbol = req.body?.symbol;
  if (!symbol || !loggedIn) {
    return res.sendStatus(400);
  }

  const cmd = `SCRIPT ${MONTAGE_WINDOW_NAME} SYMBOL ${symbol}\r\n`;
  console.log("[BRIDGE] →", cmd.trim());
  socket.write(cmd);
  res.sendStatus(200);
});

app.listen(BRIDGE_LISTEN_PORT, () => {
  console.log("[BRIDGE] listening on " + BRIDGE_LISTEN_PORT);
});