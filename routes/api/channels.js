const express = require("express");
const router = express.Router({ mergeParams: true });

const ObjectId = require("bson-objectid");

// Project Model
const Project = require("../../models/Project");

// @route   GET /api/projects/:projectId/channels
// @desc    Get all channels in a project
// @access  Public
router.get("/", async (req, res) => {
  const projectId = req.params.projectId;
  Project.findById(projectId, (err, foundProject) => {
    if (err) return res.status(500).send(err);
    res.status(200).send(foundProject.channels);
  });
});

// @route   POST /api/projects/:projectId/channels
// @desc    Create a channel in a project
// @access  Public
router.post("/", async (req, res) => {
  const projectId = req.params.projectId;
  const channelName = req.body.channelName;

  Project.findById(projectId, (err, foundProject) => {
    if (err) return res.status(500).send(err);
    let newChannels = foundProject.channels;
    const newChannel = {
      _id: ObjectId(),
      name: channelName,
      messages: [],
    };
    newChannels.push(newChannel);
    Project.findByIdAndUpdate(
      projectId,
      { channels: newChannels },
      { new: true },
      (err, updatedProject) => {
        if (err) return res.status(500).send(err);
        res.status(200).send(newChannel);
      }
    );
  });
});

// @route   UPDATE /api/projects/:projectId/channels/:channelId
// @desc    Rename a channel in a project
// @access  Public
router.patch("/:channelId", async (req, res) => {
  const projectId = req.params.projectId;
  const channelId = req.params.channelId;
  const newChannelName = req.body.newChannelName;
  let channelIndex = 0;

  Project.findById(projectId, (err, foundProject) => {
    if (err) return res.status(500).send(err);
    const newChannels = foundProject.channels.map((channel, i) => {
      if (channel._id == channelId) {
        channelIndex = i;
        channel.name = newChannelName;
      }
      return channel;
    });
    Project.findByIdAndUpdate(
      projectId,
      { channels: newChannels },
      { new: true },
      (err, updatedProject) => {
        if (err) return res.status(500).send(err);
        res.status(200).send(updatedProject.channels[channelIndex]);
      }
    );
  });
});

// @route   DEL /api/projects/:projectId/channels/:channelId
// @desc    Delete a channel in a project
// @access  Public
router.delete("/:channelId", async (req, res) => {
  const projectId = req.params.projectId;
  const channelId = req.params.channelId;

  Project.findById(projectId, (err, foundProject) => {
    if (err) return res.status(500).send(err);
    const newChannels = foundProject.channels.filter(
      (channel) => channel._id != channelId
    );
    Project.findByIdAndUpdate(
      projectId,
      { channels: newChannels },
      { new: true },
      (err, updatedProject) => {
        if (err) return res.status(500).send(err);
        res.status(200).send(updatedProject);
      }
    );
  });
});

module.exports = router;
