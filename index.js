const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();


const app = express();

const PORT = Number(process.env.PORT || 3000);
const MONGO_URI = process.env.MONGO_URI;

// middleware

app.use(cors());
app.use(express.json());

// HTTP server (IMPORTANT)
const server = http.createServer(app);


// socket io

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use((req, res, next) => {
  req.io = io;
  next();
});


// root 

app.get('/', (req, res) => {
  res.send('server is working on PORT 3000')
})

// routes

app.use("/api/users", require("./routes/users"));
app.use("/api/doc102", require("./routes/doc102"));
app.use("/api/req101", require("./routes/req101"));
app.use("/api/rmi", require("./routes/rmi"));
app.use("/api/consumption", require("./routes/consumption"));

// سجل الوارد — يجب أن تطابق مسارات تطبيق Flutter ([LedgerKind.incoming])
app.use("/api/inward/doc102", require("./routes/inward_doc102"));
app.use("/api/inward/req101", require("./routes/inward_req101"));
app.use("/api/inward/rmi", require("./routes/inward_rmi"));
app.use("/api/inward/consumption", require("./routes/inward_consumption"));


// socket events

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("message", (data) => {
    console.log("message:", data);

    socket.emit("message", {
      from: "server",
      text: "hello from backend"
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// connect db

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));



// server running

server.listen(PORT, () => {
  console.log('server is running on port 3000');
});


