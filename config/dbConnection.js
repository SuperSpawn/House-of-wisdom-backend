const { MongoClient } = require("mongodb");

const connectDb = async () => {
  try {
    const client = new MongoClient(process.env.CONNECTION_LINK);
    await client.connect();
    console.log("Database connected:");
  } catch (err) {
    console.log("Error reported");
    console.log(err);
    process.exit(1);
  }
};

module.exports = connectDb;
