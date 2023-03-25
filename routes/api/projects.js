const express = require("express");
const router = express.Router();

// Project Model
const Project = require("../../models/Project");

// @route   GET /api/projects
// @desc    Get All Projects
// @access  Public
router.get("/", (req, res) => {
  Project.find((err, projects) => {
    if (err) return res.status(500).send(err);
    res.status(200).send(projects);
  });
});

// @route   GET /api/projects/:projectId
// @desc    Get a Project
// @access  Public
router.get("/:projectId", (req, res) => {
  const projectId = req.params.projectId;

  Project.findById(projectId, (err, foundProject) => {
    if (err) return res.status(500).send(err);
    res.send(foundProject);
  });
});

// @route   POST /api/projects
// @desc    Create a Project
// @access  Public
router.post("/", (req, res) => {
  const newProject = new Project({
    name: req.body.name,
    members: [req.body.creatorName],
  });

  newProject.save((err) => {
    if (err) return res.status(500).send(err);
    res.status(200).send(newProject);
  });
});

// @route   PATCH /api/projects/:projectId
// @desc    Delete a Project
// @access  Public
router.patch("/:projectId", (req, res) => {
  const projectId = req.params.projectId;
  const updates = req.body; // {name:"project"}

  Project.findByIdAndUpdate(
    projectId,
    updates,
    { new: true },
    (err, updatedProject) => {
      if (err) res.json({ message: err });
      res.send(updatedProject);
    }
  );
});

// @route   DELETE /api/projects/:projectId
// @desc    Delete a Project
// @access  Public
router.delete("/:projectId", async (req, res) => {
  const projectId = req.params.projectId;

  Project.findByIdAndDelete(projectId, (err, deletedProject) => {
    if (err) return res.status(500).send(err);
    res.status(200).send(deletedProject);
  });
});

module.exports = router;
