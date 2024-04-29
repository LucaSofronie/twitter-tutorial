const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth.routes"); // the router
const connectMongoDB = require("./db/connectMongoDB");
const cookieParser = require("cookie-parser");

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // to parse form data
app.use(cookieParser());
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectMongoDB();
});
