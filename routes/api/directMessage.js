const express = require("express");
const router = express.Router({ mergeParams: true });
const mongoose = require("mongoose");
const auth = require("../../middleware/auth");

const DirectMessage = require("../../models/DirectMessage");

// @route   GET /api/directMessages
// @desc    Get all direct messages for user
// @access  Private
router.get("/", auth, (req, res) => {
  const { userId } = req.query;

  DirectMessage.find({ members: userId }, (err, directMessages) => {
    if (err)
      return res
        .status(400)
        .json({ msg: "No direct messages found for this user" });

    res.status(200).json({ directMessages });
  });
});

// @route   POST /api/directMessages
// @desc    Create direct message for user
// @access  Private
router.post("/", auth, (req, res) => {
  const { userId, friendId } = req.body;

  const members = [userId, friendId];

  const newDirectMessage = new DirectMessage({
    members,
    messages: [],
    lastMessageTime: null,
  });

  newDirectMessage.save((err, directMessage) => {
    if (err) return res.status(500).json({ msg: "Internal server error" });

    res.status(200).json({ directMessage });
  });
});

// @route   DELETE /api/directMessages/:directMessageId
// @desc    Create direct message for user
// @access  Private
router.delete("/:directMessageId", auth, (req, res) => {
  const { directMessageId } = req.params;

  DirectMessage.findByIdAndDelete(
    directMessageId,
    (err, deletedDirectMessage) => {
      if (err)
        return res.status(500).json({ msg: "Could not delete direct message" });

      res.send(deletedDirectMessage);
    }
  );
});

// @route   POST /api/directMessages/:directMessageId/messages
// @desc    Create a message in a direct message
// @access  Private
router.post("/:directMessageId/messages", auth, (req, res) => {
  const { directMessageId } = req.params;
  const { text, userId, username } = req.body;

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
    _id: mongoose.Types.ObjectId(),
    text,
    userId,
    username,
    date: dateTime,
    timeCreated: Date.now(),
  };

  DirectMessage.findById(directMessageId, (err, foundDirectMessage) => {
    if (err)
      return res.status(400).json({ msg: "Could not find direct message" });

    foundDirectMessage.messages.push(newMessage);
    foundDirectMessage.lastMessageTime = newMessage.timeCreated;

    foundDirectMessage.save();

    res.send(newMessage);
  });
});

// @route   DELETE /api/directMessages/:directMessageId/messages/:messageId
// @desc    Delete a message in a direct message
// @access  Private
router.delete("/:directMessageId/messages/:messageId", auth, (req, res) => {
  const { directMessageId, messageId } = req.params;

  DirectMessage.findById(directMessageId, (err, foundDirectMessage) => {
    if (err)
      return res.status(400).json({ msg: "Could not find direct message" });

    foundDirectMessage.messages = foundDirectMessage.messages.filter(
      (message) => {
        if (message._id != messageId) return message;
      }
    );

    foundDirectMessage.save();

    res.send(foundDirectMessage);
  });
});

module.exports = router;
