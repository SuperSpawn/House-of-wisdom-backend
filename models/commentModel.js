const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
  comment_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  owner_id: {
    type: String,
    required: [true, "Please add user"],
  },
  post_id: {
    type: String,
    required: [true, "Please add post"],
  },
  content: {
    type: String,
    required: [true, "Please add comment content"],
  },
  rating: {
    type: Number,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  edited_at: {
    type: Date,
  },
});

module.exports = mongoose.model("Comment", commentSchema);
