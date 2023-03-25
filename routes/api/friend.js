const express = require("express");
const router = express.Router({ mergeParams: true });
const auth = require("../../middleware/auth");

// User Model
const User = require("../../models/User");

// @route   POST /api/users/:userId/friends/
// @desc    Add a friend
// @access  Private
router.post("/", auth, (req, res) => {
  const { userId } = req.params;
  const { friendId } = req.body;

  User.findById(userId, (err, foundUser) => {
    if (err) return res.status(400).json({ msg: "User must be logged in" });

    User.findById(friendId, (err, foundFriend) => {
      if (err) return res.status(400).json({ msg: "User does not exist" });

      // Remove request from both users
      foundUser.requests = foundUser.requests.filter((request) => {
        if (request.senderId != friendId && request.receiverId != friendId)
          return request;
      });

      foundFriend.requests = foundFriend.requests.filter((request) => {
        if (request.senderId != userId && request.receiverId != userId)
          return request;
      });

      // Add friend in both users
      const friendRequestReceiver = {
        friendId,
        timeCreated: Date.now(),
      };

      const friendRequestSender = {
        friendId: userId,
        timeCreated: Date.now(),
      };

      foundUser.friends.unshift(friendRequestReceiver);

      foundFriend.friends.unshift(friendRequestSender);

      foundUser.save();
      foundFriend.save();

      res.status(200).json({ friendRequestReceiver, friendRequestSender });
    });
  });
});

// @route   DELETE /api/users/:userId/friends/:friendId
// @desc    Delete a friend
// @access  Private
router.delete("/:friendId", auth, (req, res) => {
  const { userId, friendId } = req.params;

  User.findById(userId, (err, foundUser) => {
    if (err) return res.status(400).json({ msg: "User must be logged in" });

    User.findById(friendId, (err, foundFriend) => {
      if (err) return res.status(400).json({ msg: "User does not exist" });

      // Remove friend from both users
      foundUser.friends = foundUser.friends.filter((friend) => {
        if (friend.friendId != friendId) return friend;
      });

      foundFriend.friends = foundFriend.friends.filter((friend) => {
        if (friend.friendId != userId) return friend;
      });

      foundUser.save();
      foundFriend.save();

      res.status(200).json({ user: foundUser, friend: foundFriend });
    });
  });
});

// @route   POST /api/users/:userId/friends/:friendId/requests
// @desc    Send Friend Request
// @access  Private
router.post("/:friendId/requests", auth, (req, res) => {
  const { userId, friendId } = req.params;

  User.findById(userId, (err, foundUser) => {
    if (err) return res.status(400).json({ msg: "User must be logged in" });

    User.findById(friendId, (err, foundFriend) => {
      if (err) return res.status(400).json({ msg: "User does not exist" });

      // Validation to check if friend id is the same as user id
      if (foundUser._id == friendId) {
        return res
          .status(400)
          .json({ msg: "You cannot send a friend request to yourself" });
      }

      // Validation to check if there is already a request/friend with the same id
      const { friends, requests } = foundUser;

      for (let i = 0; i < friends.length; i++) {
        const friend = friends[i];
        if (friend.friendId == foundFriend._id) {
          return res
            .status(400)
            .json({ msg: "You are already friends with this user" });
        }
      }

      for (let i = 0; i < requests.length; i++) {
        const request = requests[i];
        if (
          request.senderId == foundFriend._id ||
          request.receiverId == foundFriend._id
        ) {
          if (request.type == "SENT")
            return res
              .status(400)
              .json({ msg: "You have already sent a request to this user" });
          if (request.type == "RECEIVED")
            return res
              .status(400)
              .json({ msg: "You already have pending request from this user" });
        }
      }

      // Add request in both users
      const senderRequest = {
        type: "SENT",
        receiverId: friendId,
        senderId: userId,
        timeCreated: Date.now(),
      };

      const receiverRequest = {
        type: "RECEIVED",
        receiverId: friendId,
        senderId: userId,
        timeCreated: Date.now(),
      };

      foundUser.requests.unshift(senderRequest);
      foundFriend.requests.unshift(receiverRequest);

      foundUser.save();
      foundFriend.save();

      res.status(200).json({ senderRequest, receiverRequest });
    });
  });

  return null;
});

// @route   DELETE /api/users/:userId/friends/:friendId/requests
// @desc    Delete Friend Request
// @access  Private
router.delete("/:friendId/requests", auth, (req, res) => {
  const { userId, friendId } = req.params;

  User.findById(userId, (err, foundUser) => {
    if (err) return res.status(400).json({ msg: "User must be logged in" });

    User.findById(friendId, (err, foundFriend) => {
      if (err) return res.status(400).json({ msg: "User does not exist" });

      // Remove request from both users
      foundUser.requests = foundUser.requests.filter((request) => {
        if (request.senderId != friendId && request.receiverId != friendId)
          return request;
      });

      foundFriend.requests = foundFriend.requests.filter((request) => {
        if (request.senderId != userId && request.receiverId != userId)
          return request;
      });

      foundUser.save();
      foundFriend.save();

      res.status(200).json({ deletedId: friendId });
    });
  });

  return null;
});

module.exports = router;
