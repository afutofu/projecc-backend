const mongoose = require("mongoose");

const DirectMessageSchema = mongoose.Schema({
  members: {
    type: Array,
    default: [],
  },
  messages: {
    type: Array,
    default: [],
  },
  lastMessageTime: {
    type: Date,
  },
});

module.exports = mongoose.model("directMessage", DirectMessageSchema);
