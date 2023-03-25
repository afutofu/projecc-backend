const express = require("express");
const router = express.Router({ mergeParams: true });
const auth = require("../../middleware/auth");

const ObjectId = require("bson-objectid");

// Project Model
const Project = require("../../models/Project");

// @route   GET /api/projects/:projectId/channels/:channelId/messages
// @desc    Get all messages from a channel
// @access  Public
router.get("/", (req, res) => {
  const { projectId, channelId } = req.params;

  Project.findById(projectId, (err, foundProject) => {
    if (err) return res.status(500).send(err);
    foundProject.channels.forEach((channel) => {
      if (channel._id == channelId) {
        return res.send(channel.messages);
      }
    });
  });
});

// @route   POST /api/projects/:projectId/channels/:channelId/messages
// @desc    Create a message in a channel
// @access  Private
router.post("/", auth, (req, res) => {
  const { projectId, channelId } = req.params;
  const { text, username, userId } = req.body;

  const dateObj = new Date();
  const date =
    dateObj.getMonth() +
    1 +
    "/" +
    dateObj.getDate() +
    "/" +
    dateObj.getFullYear();
  const time = dateObj.getHours() + ":" + dateObj.getMinutes();

  const dateTime = date + " " + time;

  const newMessage = {
    _id: ObjectId(),
    text,
    username,
    userId,
    date: dateTime,
  };

  Project.findById(projectId, (err, foundProject) => {
    if (err) return res.status(500).send(err);

    let channelIndex = null;
    let messageIndex = null;
    let newChannels = foundProject.channels;

    newChannels.some((channel, i) => {
      if (channel._id == channelId) {
        channel.messages.push(newMessage);
        channelIndex = i;
        messageIndex = channel.messages.length - 1;
        return true;
      }
    });

    Project.findByIdAndUpdate(
      projectId,
      {
        channels: newChannels,
      },
      { new: true },
      (err, updatedProject) => {
        if (err) return res.status(500).send(err);
        res.send(updatedProject.channels[channelIndex].messages[messageIndex]);
      }
    );
  });
});

// @route   DEL /api/projects/:projectId/channels/:channelId/messages/:messageId
// @desc    Delete a messages from a channel
// @access  Private
router.delete("/:messageId", auth, (req, res) => {
  const { projectId, channelId, messageId } = req.params;

  Project.findById(projectId, (err, foundProject) => {
    if (err) return res.status(500).send(err);

    let channelIndex = null;
    let newChannels = foundProject.channels;

    newChannels.some((channel, i) => {
      if (channel._id == channelId) {
        channelIndex = i;
        newChannels[i].messages = channel.messages.filter(
          (message) => message._id != messageId
        );
        return true;
      }
    });

    Project.findByIdAndUpdate(
      projectId,
      {
        channels: newChannels,
      },
      { new: true },
      (err, deletedProject) => {
        if (err) return res.status(500).send(err);

        res.send(deletedProject.channels[channelIndex]);
      }
    );
  });
});

module.exports = router;
