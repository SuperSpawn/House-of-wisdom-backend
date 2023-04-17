const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

//@desc Get all users
//@route GET /
//@access private
const getUsers = asyncHandler(async (req, res, next) => {
  const validation = await checkValidation(req);
  if (validation !== 200) {
    res.status(validation);
    throw new Error("No validation");
  }
  if (req.user.isAdmin === false) {
    res.status(403);
    throw new Error("User does not have permission to access users info");
  }
  const users = await User.find({});
  if (!users) {
    res.status(400).json({ success: false, error: "Cannot fetch users" });
  }
  const mapUsers = users.map((user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    karma: user.karma,
    created_at: user.created_at,
  }));

  res.status(200).json({ success: true, data: mapUsers });
});

//@desc Create a new user
//@route POST /
//@access public
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(403).json({ success: false, error: "Invalid parameters" });
    throw new Error("All parameters required");
  }

  const userTaken = await User.findOne({ email });
  if (userTaken) {
    res.status(403).json({ success: false, error: "Email already taken" });
    throw new Error("User already taken");
  }

  //HASH
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });
  if (!user) {
    res.status(400).json({ success: false, error: "User create failed" });
    throw new Error("User create failed");
  }
  const accessToken = jwt.sign(
    {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        karma: user.karma,
        isAdmin: user.isAdmin,
        created_at: user.created_at,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "24h" }
  );
  res.status(201).json({
    success: true,
    data: { name: user.name, token: accessToken },
  });
});

//@desc Get a user
//@route GET /:id
//@access public
const getUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!id) {
    res.status(400).json({ success: false, error: "Invalid id" });
  }
  const user = await User.findById(id);
  if (!user) {
    res.status(404).json({ success: false, error: "User not found" });
  }
  const returnedUser = {
    _id: user._id,
    name: user.name,
    karma: user.karma,
  };
  res.status(200).json({ success: true, data: returnedUser });
});

//@desc Update a user
//@route PUT /:id
//@access private
const updateUser = asyncHandler(async (req, res) => {
  const validation = await checkValidation(req);
  if (validation !== 200) {
    res.status(validation);
    throw new Error("No validation");
  }
  const id = req.params.id;
  if (!id) {
    res.status(400).json({ success: false, error: "Invalid id" });
  }
  const user = await User.findById(id);
  if (!user) {
    res.status(404).json({ success: false, error: "User not found" });
  }
  //TO BE CONTINUED
});

//@desc Delete a user
//@route DELETE /:id
//@access private
const deleteUser = asyncHandler(async (req, res) => {
  const validation = await checkValidation(req);
  if (validation !== 200) {
    res.status(validation);
    throw new Error("No validation");
  }
  const id = req.params.id;
  const requested_by = req.user._id;
  if (!id) {
    res.status(403);
    throw new Error("Invalid delete request parameters");
  }

  const requestor = await User.findById(requested_by);
  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("Cannot delete non existent user");
  }

  if (id !== requested_by && requestor.isAdmin === false) {
    res.status(403);
    throw new Error("Does not have permission to delete user");
  }
  await User.findByIdAndDelete(id);
  res.status(200).json({ success: true });
});

//@desc Login user
//@route POST /login
//@access public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Invalid Login parameters");
  }
  const user = await User.findOne({ email: email });
  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign(
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          karma: user.karma,
          isAdmin: user.isAdmin,
          created_at: user.created_at,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "24h" }
    );
    res.status(200).json({
      success: true,
      data: { name: user.name, token: accessToken },
    });
  } else {
    res.status(403);
    throw new Error("Invalid Email or Password");
  }
});

module.exports = {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  loginUser,
};
