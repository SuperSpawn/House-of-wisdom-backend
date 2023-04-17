const express = require("express");
const router = express.Router();
const {
  getPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
  getPostsLight,
  upvotePost,
  downvotePost,
} = require("../controllers/postsController");

router.get("/", getPosts);
router.post("/", createPost);
router.get("/light", getPostsLight);
router.put("/upvote/:id", upvotePost);
router.put("/downvote/:id", downvotePost);
router.get("/:id", getPost);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);

module.exports = router;
