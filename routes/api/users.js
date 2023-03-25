const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
require("dotenv/config");
const jwt = require("jsonwebtoken");
const auth = require("../../middleware/auth");

// User Model
const User = require("../../models/User");

// @route   POST /api/users
// @desc    Register New User
// @access  Public
router.post("/", (req, res) => {
  const { name, email, password } = req.body;

  // Simple validation
  if (!name || !email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  // Email validation
  // Regex test returns true if email format is correct
  const re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!re.test(email)) {
    return res.status(400).json({ msg: "Incorrect email format" });
  }

  // Password validation
  // Password length should be 6 or more characters
  if (password.length < 6) {
    return res
      .status(400)
      .json({ msg: "Password should be 6 or more characters" });
  }

  // Check for existing user
  User.findOne({ email }).then((user) => {
    if (user) return res.status(400).json({ msg: "User already exists" });

    const newUser = new User({
      name,
      email,
      password,
    });

    // Create salt & hash
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;

        newUser.password = hash;
        newUser.save().then((user) => {
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
  });
});

// @route   POST /api/users/guest
// @desc    Register New Guest
// @access  Public
router.post("/guest", (req, res) => {
  // Create custom unique ID based on time
  let id = "";
  const date = new Date();

  id += date.getFullYear();
  id += date.getMonth();
  id += date.getDay();
  id += date.getHours();
  id += date.getMinutes();
  id += date.getSeconds();
  id += date.getMilliseconds();

  res.json({
    user: {
      _id: id,
      name: "Guest" + id,
      email: "",
      isGuest: true,
    },
    friends: {
      friends: [],
      requests: [],
    },
  });
});

// @route   GET /api/users/:userId
// @desc    Fetch User Data
// @access  Private
router.get("/:userId", auth, (req, res) => {
  const userId = req.params.userId;

  User.findById(userId, (err, foundUser) => {
    if (err) return res.status(400).json({ msg: "User not found" });

    res.status(200).json({
      _id: foundUser.id,
      name: foundUser.name,
    });
  });
});

module.exports = router;
