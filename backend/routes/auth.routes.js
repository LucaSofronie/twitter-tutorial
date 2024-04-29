const express = require("express");
const protectRoute = require("../middleware/protectRoute"); // verifica token-ul user-ului
const {
  getMe,
  signup,
  login,
  logout,
} = require("../controllers/auth.controller");

const router = express.Router();

router.get("/me", protectRoute, getMe);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;
