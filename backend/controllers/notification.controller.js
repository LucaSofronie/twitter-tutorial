const mongoose = require("mongoose");

const User = require("../models/user.model");
const Notification = require("../models/notification.model");

// ***@route /api/notifications

// @route /
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profileImg",
    });

    await Notification.updateMany({ to: userId }, { read: true });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in getNotifications controller: ", error);
  }
};

// @route /:id
const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    if (notification.to.toString() !== userId.toString()) {
      return res
        .status(400)
        .json({ error: "You are not allowed to delete this notification" });
    }

    await Notification.findByIdAndDelete(id);

    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in deleteNotification controller: ", error);
  }
};

// @route /
const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({ to: userId });

    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in deleteNotifications controller: ", error);
  }
};

module.exports = {
  getNotifications,
  deleteNotification,
  deleteNotifications,
};
