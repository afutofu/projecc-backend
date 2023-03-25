const socketio = require("socket.io");

const Project = require("./models/Project");

const connectSocket = (server) => {
  const io = socketio(server);

  io.on("connection", (socket) => {
    console.log(socket.id, "has connected");

    // DIRECT MESSAGE EVENT LISTENERS
    // Listening for direct message group from client
    socket.on("createDirectMessageGroup", ({ directMessage, clientId }) => {
      // Emits direct message to other clients, frontend filters which client receives information
      socket.broadcast.emit("directMessageGroup", {
        type: "CREATE",
        directMessage,
        clientId,
      });
    });

    // Listening for deleted direct message group
    socket.on("deleteDirectMessageGroup", ({ directMessage, clientId }) => {
      // Delete direct message group to other clients, frontend filters which client receives information
      socket.broadcast.emit("directMessageGroup", {
        type: "DELETE",
        directMessage,
        clientId,
      });
    });

    // Listening for direct message from client
    socket.on(
      "sendDirectMessage",
      ({ message, directMessageId, clientId }, callback) => {
        const messageObj = {
          _id: 131313,
          userId: "2r2v4t2vq",
          username: "John Doe",
          text: "Yo wassup",
          date: "7/4/2020 12:11",
          timeCreated: 3526262,
        };

        // Emits direct message to other clients, frontend filters which client receives information
        socket.broadcast.emit("directMessage", {
          type: "CREATE",
          message,
          directMessageId,
          clientId,
        });

        callback();
      }
    );

    // Listening for direct message from client
    socket.on(
      "deleteDirectMessage",
      ({ messageId, directMessageId, clientId }) => {
        // Emits direct message to other clients, frontend filters which client receives information
        socket.broadcast.emit("directMessage", {
          type: "DELETE",
          messageId,
          directMessageId,
          clientId,
        });
      }
    );

    // FRIENDS EVENT LISTENERS
    socket.on("sendFriendRequest", ({ newRequest, clientId }, callback) => {
      // Emits direct message to other clients, frontend filters which client receives information
      socket.broadcast.emit("friendRequest", {
        type: "CREATE",
        newRequest,
        clientId,
      });
      callback();
    });

    // Listening for deleted direct message group
    socket.on("deleteFriendRequest", ({ friendId, clientId }) => {
      // Delete friend request to other clients, frontend filters which client receives information
      socket.broadcast.emit("friendRequest", {
        type: "DELETE",
        friendId,
        clientId,
      });
    });

    socket.on("addFriend", ({ friend, clientId }) => {
      // Emits friend to other clients, frontend filters which client receives information
      socket.broadcast.emit("friend", {
        type: "CREATE",
        friend,
        clientId,
      });
    });

    // Listening for deleted direct message group
    socket.on("deleteFriend", ({ friend, clientId }) => {
      // Delete friend to other clients, frontend filters which client receives information
      socket.broadcast.emit("friend", {
        type: "DELETE",
        friend,
        clientId,
      });
    });

    // Find all projects in database
    Project.find(async (err, projects) => {
      if (err) return (projects = []);

      // Socket joins every channel, start initializing listeners
      socket.on("initSockets", () => {
        projects.forEach((project) => {
          project.channels.forEach((channel) => {
            // socket.join(`/channels/${channel._id}`);
          });
        });
      });

      // MESSAGE EVENT LISTENERS
      // Listening for message from client
      socket.on("sendMessage", ({ data, channelId, projectId }, callback) => {
        const messageObject = {
          _id: 131313,
          username: "John Doe",
          userId: "2r2v4t2vq",
          text: "Yo wassup",
          date: "7/4/2020 12:11",
        };

        console.log("\tNew message in", channelId);

        // Emits message to other clients in same room to be created in frontend
        socket.broadcast.emit("message", {
          type: "CREATE",
          data,
          channelId,
          projectId,
        });

        callback();
      });

      // Listening for message from client
      socket.on("deleteMessage", ({ data, channelId, projectId }) => {
        console.log("\tDeleted message in", channelId);

        // Emits message info to other clients in same room to remove in frontend
        socket.broadcast.emit("message", {
          type: "DELETE",
          data,
          channelId,
          projectId,
        });
      });

      // CHANNEL EVENT LISTENERS
      socket.on("createChannel", ({ data, projectId }, callback) => {
        console.log("\tNew channel in", projectId);

        // Emits message to other clients in same room to create channel in frontend
        socket.broadcast.emit("channel", {
          type: "CREATE",
          data,
          projectId,
        });

        callback();
      });

      socket.on("renameChannel", ({ data, channelId, projectId }, callback) => {
        console.log("\tRenamed channel", channelId);

        // Emits message to other clients in same room to create channel in frontend
        socket.broadcast.emit("channel", {
          type: "RENAME",
          data,
          channelId,
          projectId,
        });

        callback();
      });

      socket.on("deleteChannel", ({ channelId, projectId }) => {
        console.log("\tDeleted channel in", projectId);

        // Emits message to other clients in same room to create channel in frontend
        socket.broadcast.emit("channel", {
          type: "DELETE",
          channelId,
          projectId,
        });
      });

      // PROJECT EVENT LISTENERS
      socket.on("createProject", ({ data }, callback) => {
        console.log("\tNew project");

        // Emits message to other clients in same room to create channel in frontend
        socket.broadcast.emit("project", {
          type: "CREATE",
          data,
        });

        callback();
      });

      socket.on("renameProject", ({ data, projectId }, callback) => {
        console.log("\tRenamed project", projectId);

        // Emits message to other clients in same room to create channel in frontend
        socket.broadcast.emit("project", {
          type: "RENAME",
          data,
          projectId,
        });

        callback();
      });

      socket.on("deleteProject", ({ projectId }) => {
        console.log("\tDeleted project", projectId);

        // Emits message to other clients in same room to create channel in frontend
        socket.broadcast.emit("project", {
          type: "DELETE",
          projectId,
        });
      });
    });

    // Listening for client force diconnect on app
    socket.on("forceDisconnect", () => {
      socket.disconnect();
    });

    // Listening for client diconnect on app
    socket.on("disconnect", () => {
      console.log(socket.id, "has disconnected");
      socket.removeAllListeners("connection");
      socket.disconnect();
    });
  });
};

module.exports = { connectSocket };
