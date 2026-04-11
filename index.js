const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = Number(process.env.PORT);
const MONGO_URI = process.env.MONGO_URI;

// middleware

app.use(cors());
app.use(express.json());

// root 

app.get('/',(req,res)=>{
  res.send('server is working on PORT 3000')
})

// routes

app.use("/api/users", require("./routes/users"));
app.use("/api/doc102", require("./routes/doc102"));
app.use("/api/req101", require("./routes/req101"));
app.use("/api/rmi", require("./routes/rmi"));
app.use("/api/consumption", require("./routes/consumption"));

// connect db

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// server running

const server = app.listen(PORT, () => {
  console.log('server is running on port 3000');
});


