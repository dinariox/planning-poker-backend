const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 9090 });

let votes = [];

wss.on("connection", (ws) => {
  // Sende aktuelle Votes an den neuen Client
  ws.send(JSON.stringify({ type: "init", votes }));

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case "vote":
        const existingVoteIndex = votes.findIndex((v) => v.name === data.name);
        if (existingVoteIndex !== -1) {
          votes[existingVoteIndex].value = data.value;
        } else {
          votes.push({ name: data.name, value: data.value });
        }

        // Sende aktualisierte Votes an alle Clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "vote",
                votes,
              })
            );
          }
        });
        break;
      case "reset":
        votes = [];
        // Informiere alle Clients, dass zurückgesetzt wurde
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "reset" }));
          }
        });
        break;
      case "reveal":
        // Informiere alle Clients, dass die Votes aufgedeckt wurden
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "reveal" }));
          }
        });
        break;
    }
  });
});

console.log("WebSocket server is running on ws://localhost:9090");
