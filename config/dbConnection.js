const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.CONNECTION_LINK);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log("Error reported");
    console.log(err);
    process.exit(1);
  }
};

module.exports = connectDb;
