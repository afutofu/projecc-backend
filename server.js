const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
require("dotenv/config");

const { connectSocket } = require("./websockets");

const PORT = process.env.PORT || 5000;

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// IMPORT ROUTES
const projectRoutes = require("./routes/api/projects");
const channelRoutes = require("./routes/api/channels");
const messageRoutes = require("./routes/api/messages");
const userRoutes = require("./routes/api/users");
const friendRoutes = require("./routes/api/friend");
const directMessageRoutes = require("./routes/api/directMessage");
const authRoutes = require("./routes/api/auth");

// USE ROUTES
app.use("/api/projects", projectRoutes);
app.use("/api/projects/:projectId/channels", channelRoutes);
app.use("/api/projects/:projectId/channels/:channelId/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/users/:userId/friends", friendRoutes);
app.use("/api/directMessages", directMessageRoutes);
app.use("/api/auth", authRoutes);

// WEBSOCKETS
const server = http.createServer(app);
connectSocket(server);

// CONNECT TO DB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_CONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

// SERVE STATIC ASSETS IF IN PRODUCTION
// app.use(express.static("client/build"));

// app.get("*", (_req, res) => {
//   res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
// });

// Connect to the database before listening
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Listening for requests...");
  });
});
