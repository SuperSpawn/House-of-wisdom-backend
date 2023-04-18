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
  return 200;
});

//@desc Get all posts
//@route GET /
//@access public
const getPosts = asyncHandler(async (req, res) => {
  console.log("GETTING posts");
  const posts = await Post.find({});
  if (!posts) {
    res.status(400).json({ success: false, error: "Couldn't fetch posts" });
    throw new Error("Couldn't fetch posts");
  }
  res.status(200).json({ success: true, data: posts });
});

//@desc Create a new post
//@route POST /
//@access private
const createPost = asyncHandler(async (req, res) => {
  const validation = await checkValidation(req);
  if (validation !== 200) {
    res.status(validation).json({ success: false, error: "No validation" });
    throw new Error("No validation");
  }
  const posterId = req.user._id;
  const { title, description, content } = req.body;
  if (!title || !content || !description) {
    res.status(403).json({
      success: false,
      error: "Cannot create a post without a title or content",
    });
    throw new Error("Cannot create a post without a title or content");
  }

  const post = await Post.create({
    title,
    description,
    content,
    owner_id: posterId,
    rating: 0,
    comments: [],
    edited_at: null,
  });
  res.status(201).json({ success: true, data: post });
});

//@desc Get a post
//@route GET /:id
//@access public
const getPost = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!id) {
    res.status(400).json({ success: false, error: "ID is required" });
    throw new Error("ID is required");
  }
  const post = await Post.findById(id);
  if (!post) {
    res.status(404).json({ success: false, error: "Couldn't find post" });
    throw new Error("Couldn't find post");
  }
  res.status(200).json({ success: true, data: post });
});

//@desc Update a post
//@route PUT /:id
//@access private
const updatePost = asyncHandler(async (req, res) => {
  const validation = await checkValidation(req);
  if (validation !== 200) {
    res.status(validation).json({ success: false, error: "No validation" });
    throw new Error("No validation");
  }
  const id = req.params.id;
  if (!id) {
    res.status(403).json({ success: false, error: "ID is required" });
    throw new Error("ID is required");
  }
  const requesterID = req.user._id;
  const post = await Post.findById(id);
  if (!post) {
    res.status(404).json({ success: false, error: "Cannot find post" });
    throw new Error("Cannot find post");
  }
  const user = await User.findById(requesterID);
  if (!user.isAdmin && post.owner_id !== requesterID) {
    res.status(403).json({ success: false, error: "User cannot update post" });
    throw new Error("User cannot update post");
  }

  const { title, content, description } = req.body;
  if (!title && !content && !description) {
    res
      .status(403)
      .json({ success: false, error: "Invalid update request parameters" });
    throw new Error("Invalid update request parameters");
  }
  if (title) post.title = title;
  if (content) post.content = content;
  if (description) post.description = description;
  post.edited_at = Date.now();
  const updatedPost = await Post.findOneAndUpdate(id, post);
  if (!updatedPost) {
    res.status(500).json({ success: false, error: "Failed to update post" });
    throw new Error("Failed to update post");
  }
  res.status(200).json({ success: true, data: post });
});

//@desc Delete a post
//@route DELETE /:id
//@access private
const deletePost = asyncHandler(async (req, res) => {
  const validation = await checkValidation(req);
  if (validation !== 200) {
    res.status(validation).json({ success: false, error: "No validation" });
    throw new Error("No validation");
  }
  const id = req.params.id;
  if (!id) {
    res.status(403).json({ success: false, error: "ID is required" });
    throw new Error("ID is required");
  }
  const requesterID = req.user._id;

  const post = await Post.findById(id);
  if (!post) {
    res.status(404).json({ success: false, error: "Cannot find post" });
    throw new Error("Cannot find post");
  }
  const user = await User.findById(requesterID);

  if (post.owner_id !== requesterID && !user.isAdmin) {
    res
      .status(401)
      .json({ success: false, error: "User cannot delete this post" });
    throw new Error("User cannot delete this post");
  }
  await Comment.deleteMany({ _id: { $in: post.comments } });
  await Post.findByIdAndDelete(id);

  res.status(200).json({ success: true, data: post });
});

//@desc Get all posts (light version)
//@route GET /light
//@access public
const getPostsLight = asyncHandler(async (req, res) => {
  const posts = await Post.find({});
  if (!posts) {
    res.status(404).json({ success: false, error: "Cannot fetch posts" });
    throw new Error("Cannot fetch posts");
  }
  const lightPosts = posts.map((post) => ({
    _id: post._id,
    owner_id: post.owner_id,
    title: post.title,
    description: post.description,
    rating: post.rating,
    created_at: post.created_at,
    edited_at: post.edited_at,
  }));
  res.status(200).json({ success: true, data: lightPosts });
});

//@desc Upvote a post
//@route PUT /upvote/:id
//@access private
const upvotePost = asyncHandler(async (req, res) => {
  const validation = await checkValidation(req);
  if (validation !== 200) {
    res.status(validation).json({ success: false, error: "No validation" });
    throw new Error("No validation");
  }
  const id = req.params.id;
  if (!id) {
    res.status(403).json({ success: false, error: "Invalid parameters" });
    throw new Error("Invalid parameters");
  }
  const post = await Post.findById(id);
  if (!post) {
    res.status(404).json({ success: false, error: "No post found" });
    throw new Error("No post found");
  }
  post.rating++;
  await Post.findByIdAndUpdate(id, post);
  res.status(200).json({ success: true, data: { rating: post.rating } });
});

//@desc Downvote a post
//@route PUT /downvote/:id
//@access private
const downvotePost = asyncHandler(async (req, res) => {
  const validation = await checkValidation(req);
  if (validation !== 200) {
    res.status(validation).json({ success: false, error: "No validation" });
    throw new Error("No validation");
  }
  const id = req.params.id;
  if (!id) {
    res.status(403).json({ success: false, error: "Invalid parameters" });
    throw new Error("Invalid parameters");
  }
  const post = await Post.findById(id);
  if (!post) {
    res.status(404).json({ success: false, error: "No post found" });
    throw new Error("No post found");
  }
  post.rating--;
  await Post.findByIdAndUpdate(id, post);
  res.status(200).json({ success: true, data: { rating: post.rating } });
});

module.exports = {
  getPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
  getPostsLight,
  upvotePost,
  downvotePost,
};
