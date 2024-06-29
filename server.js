const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 9090 });

let users = [];

wss.on("connection", (ws) => {
  let userName = "";

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case "join":
        userName = data.name;
        if (!users.some((user) => user.name === userName)) {
          users.push({ name: userName, vote: null });
        }
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "users", users }));
          }
        });
        break;
      case "vote":
        const user = users.find((user) => user.name === data.name);
        if (user) {
          user.vote = data.value;
        }
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "users", users }));
          }
        });
        break;
      case "reset":
        users.forEach((user) => (user.vote = null));
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
    users = users.filter((user) => user.name !== userName);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "users", users }));
      }
    });
  });
});

console.log("WebSocket server is running on ws://localhost:9090");
