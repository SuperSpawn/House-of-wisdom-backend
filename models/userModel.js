const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  name: {
    type: String,
    required: [true, "Please add user name"],
  },
  email: {
    type: String,
    required: [true, "Please add user email"],
  },
  password: {
    type: String,
    required: [true, "Please add user password"],
  },
  karma: {
    type: Number,
    default: 0,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
