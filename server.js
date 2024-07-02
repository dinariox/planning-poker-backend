const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "https://planning-poker.sauerland.love",
];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

let users = [];

io.on("connection", (socket) => {
  let userName = "";

  socket.on("join", (name) => {
    userName = name;
    if (!users.some((user) => user.name === userName)) {
      users.push({ name: userName, vote: null });
    }
    io.emit("users", users);
  });

  socket.on("vote", (data) => {
    const user = users.find((user) => user.name === data.name);
    if (user) {
      user.vote = data.value;
    }
    io.emit("users", users);
  });

  socket.on("reset", () => {
    users.forEach((user) => (user.vote = null));
    io.emit("reset");
  });

  socket.on("reveal", () => {
    io.emit("reveal");
  });

  socket.on("disconnect", () => {
    users = users.filter((user) => user.name !== userName);
    io.emit("users", users);
  });
});

server.listen(9090, () => {
  console.log("Socket.io server is running on http://localhost:9090");
});
