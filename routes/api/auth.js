const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
require("dotenv/config");
const jwt = require("jsonwebtoken");
const auth = require("../../middleware/auth");

// User Model
const User = require("../../models/User");

// @route   POST /api/auth
// @desc    Authenticate user
// @access  Public
router.post("/", (req, res) => {
  const { email, password } = req.body;

  // Simple validation
  if (!email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  // Check for existing user
  User.findOne({ email }).then((user) => {
    if (!user) return res.status(400).json({ msg: "User does not exist" });

    // Validate password
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

      jwt.sign(
        { _id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: 3600 },
        (err, token) => {
          if (err) throw err;

          res.json({
            token,
            user: {
              _id: user.id,
              name: user.name,
              email: user.email,
            },
            friends: {
              friends: user.friends,
              requests: user.requests,
            },
          });
        }
      );
    });
  });
});

// @route   GET /api/auth/user
// @desc    Get user data
// @access  Private
router.get("/user", auth, (req, res) => {
  User.findById(req.user._id, (err, foundUser) => {
    if (err) return res.status(400).json({ msg: "Cannot find user" });

    jwt.sign(
      { _id: foundUser.id },
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;

        res.json({
          token,
          user: {
            _id: foundUser.id,
            name: foundUser.name,
            email: foundUser.email,
          },
          friends: {
            friends: foundUser.friends,
            requests: foundUser.requests,
          },
        });
      }
    );
  });
});

module.exports = router;
