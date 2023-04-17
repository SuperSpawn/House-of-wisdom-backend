const asyncHandler = require("express-async-handler");
const Post = require("../models/postModel");
const User = require("../models/userModel");
const Comment = require("../models/commentModel");

const checkValidation = asyncHandler(async (req) => {
  if (!req.user) {
    return 401;
  }
  const id = req.user._id;
  if (!id) {
    return 401;
  }
  const user = await User.findById(id);
  if (!user) {
    return 401;
  }
  if (!user.isAdmin) {
    return 403;
  }
  return 200;
});

//@desc Get all comments
//@route GET /
//@access public
const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({});
  if (!comments) {
    res.status(400);
    throw new Error("Couldn't fetch comments");
  }
  res.status(200).json({ success: true, data: comments });
});

//@desc Create a new comment
//@route POST /
//@access private
const createComment = asyncHandler(async (req, res) => {
  const validation = await checkValidation(req);
  if (validation !== 200) {
    res.status(validation);
    throw new Error("No validation");
  }
  const posterId = req.user._id;
  const postId = req.body.post_id;
  if (!postId) {
    res.status(403);
    throw new Error("Cannot comment without a post");
  }
  const post = await Post.findById(postId);
  if (!post) {
    res.status(403);
    throw new Error("Couldn't find post");
  }
  const { content } = req.body;
  if (!content) {
    res.status(400);
    throw new Error("Cannot comment an empty comment");
  }

  const comment = await Comment.create({
    owner_id: posterId,
    post_id: postId,
    content,
    rating: 0,
    edited_at: null,
  });
  if (!comment) {
    res.status(500);
    throw new Error("Error creating comment");
  }
  post.comments.push(comment._id);
  await Post.findByIdAndUpdate(postId, post);
  res.status(201).json({ success: true, data: post });
});

//@desc Get a comment
//@route GET /:id
//@access public
const getComment = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!id) {
    res.status(400);
    throw new Error("ID is required");
  }
  const comment = await Comment.findById(id);
  if (!comment) {
    res.status(404);
    throw new Error("Couldn't find comment");
  }
  res.status(200).json({ success: true, data: comment });
});

//@desc Update a comment
//@route PUT /:id
//@access private
const updateComment = asyncHandler(async (req, res) => {
  const validation = await checkValidation(req);
  if (validation !== 200) {
    res.status(validation);
    throw new Error("No validation");
  }
  const id = req.params.id;
  if (!id) {
    res.status(403);
    throw new Error("Cannot delete a comment without ID");
  }
  const requesterId = req.user._id;
  const comment = await Comment.findById(id);
  if (!comment) {
    res.status(404);
    throw new Error("Cannot find comment");
  }
  const post = await Post.findById(comment.post_id);
  if (!post) {
    res.status(403);
    throw new Error("Cannot find post");
  }
  const user = await User.findById(requesterId);
  if (!user.isAdmin && comment.owner_id !== requesterId) {
    res.status(403);
    throw new Error("Cannot delete this comment");
  }

  const { content } = req.body;
  if (!content) {
    res.status(403);
    throw new Error("Invalid update parameters");
  }
  comment.content = content;
  comment.edited_at = new Date.now();
  await Comment.findByIdAndUpdate(id, comment);
  res.status(200).json({ success: true, data: comment });
});

//@desc Delete a comment
//@route DELETE /:id
//@access private
const deleteComment = asyncHandler(async (req, res) => {
  const validation = await checkValidation(req);
  if (validation !== 200) {
    res.status(validation);
    throw new Error("No validation");
  }
  const id = req.params.id;
  if (!id) {
    res.status(403);
    throw new Error("Cannot delete a comment without ID");
  }
  const requesterId = req.user._id;

  const comment = await Comment.findById(id);
  if (!comment) {
    res.status(404);
    throw new Error("Cannot find comment");
  }
  const post = await Post.findById(comment.post_id);
  if (!post) {
    res.status(403);
    throw new Error("Cannot find post");
  }
  const user = await User.findById(requesterId);
  if (!user.isAdmin && comment.owner_id !== requesterId) {
    res.status(403);
    throw new Error("Cannot delete this comment");
  }

  await Comment.findByIdAndDelete(id);
  post.comments = post.comments.filter((comment) => comment !== id);
  await Post.findByIdAndUpdate(comment.post_id, post);
  res.status(200).json({ success: true, data: comment });
});

module.exports = {
  getComments,
  createComment,
  getComment,
  updateComment,
  deleteComment,
};
