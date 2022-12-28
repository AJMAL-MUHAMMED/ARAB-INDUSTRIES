const express = require("express");
const {
  register,
  login,
  changePassword,
  getAllUsers,
  logout
} = require("../controllers/userController");
const { authUser } = require("../middlewares/auth");
const router = express.Router();

// all user routes
router.post("/register", register);
router.post("/login", login);
router.put("/changePassword", authUser, changePassword);
router.get("/getAllUsers", authUser, getAllUsers);
router.get("/logout", authUser, logout);

module.exports = router;
