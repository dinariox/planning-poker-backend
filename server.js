const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 9090 });

let votes = [];
let activeUsers = [];

wss.on("connection", (ws) => {
  let userName = "";

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case "join":
        userName = data.name;
        if (!activeUsers.includes(userName)) {
          activeUsers.push(userName);
        }
        // Sende aktualisierte Liste der aktiven Benutzer an alle Clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "activeUsers", activeUsers }));
          }
        });
        break;
      case "vote":
        const existingVoteIndex = votes.findIndex((v) => v.name === data.name);
        if (existingVoteIndex !== -1) {
          votes[existingVoteIndex].value = data.value;
        } else {
          votes.push({ name: data.name, value: data.value });
        }
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "vote", votes }));
          }
        });
        break;
      case "reset":
        votes = [];
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "reset" }));
          }
        });
        break;
      case "reveal":
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "reveal" }));
          }
        });
        break;
    }
  });

  ws.on("close", () => {
    activeUsers = activeUsers.filter((user) => user !== userName);
    // Sende aktualisierte Liste der aktiven Benutzer an alle Clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "activeUsers", activeUsers }));
      }
    });
  });
});

console.log("WebSocket server is running on ws://localhost:9090");
