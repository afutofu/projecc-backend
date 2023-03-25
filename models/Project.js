const mongoose = require("mongoose");
const ObjectId = require("bson-objectid");

const ProjectSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  members: {
    type: Array,
    default: [],
  },
  channels: {
    type: Array,
    default: [
      {
        _id: ObjectId(),
        name: "general",
        messages: [],
      },
    ],
  },
});

module.exports = mongoose.model("project", ProjectSchema);
