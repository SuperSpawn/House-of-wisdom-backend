const express = require("express");
const router = express.Router();
const {
  getComments,
  createComment,
  getComment,
  updateComment,
  deleteComment,
} = require("../controllers/commentsController");

router.get("/", getComments);
router.post("/", createComment);

router.get("/:id", getComment);
router.put("/:id", updateComment);
router.delete("/:id", deleteComment);

module.exports = router;
