const express = require("express");
const protectRoute = require("../middleware/protectRoute");
const router = express.Router();
const {
  getUserProfile,
  followUnfollowUser,
  getSuggestedUsers,
  updateUser,
} = require("../controllers/user.controller");

// @route /api/users/...

router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.post("/update", protectRoute, updateUser);

module.exports = router;
