const express = require("express");
const router = express.Router();

const protectRoute = require("../middleware/protectRoute");
const {
  getNotifications,
  deleteNotification,
  deleteNotifications,
} = require("../controllers/notification.controller");

// @route

router.get("/", protectRoute, getNotifications);
router.delete("/:id", protectRoute, deleteNotification);
router.delete("/", protectRoute, deleteNotifications);

module.exports = router;
