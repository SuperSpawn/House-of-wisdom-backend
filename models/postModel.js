const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  owner_id: {
    type: String,
    required: [true, "Please add user name"],
  },
  title: {
    type: String,
    required: [true, "Please add post title"],
  },
  description: {
    type: String,
    required: [true, "Please add post description"],
  },
  content: {
    type: String,
    required: [true, "Please add post content"],
  },
  rating: {
    type: Number,
  },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  created_at: {
    type: Date,
    default: Date.now,
  },
  edited_at: {
    type: Date,
  },
});

module.exports = mongoose.model("Post", postSchema);
