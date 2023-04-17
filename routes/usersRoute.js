const express = require("express");
const router = express.Router();
const {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  loginUser,
} = require("../controllers/usersController");

router.get("/", getUsers);
router.post("/", createUser);
router.post("/login", loginUser);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
