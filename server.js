const express = require("express");
const connectDb = require("./config/dbConnection");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

connectDb();

app.use(express.json());
app.use(cors());
app.use(require("./middleware/authentication"));
app.use("/users/", require("./routes/usersRoute"));
app.use("/posts/", require("./routes/postsRoute"));
app.use("/comments/", require("./routes/commentsRoute"));
app.use(require("./middleware/errorHandler"));

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
