const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth.routes"); // the router
const connectMongoDB = require("./db/connectMongoDB");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/user.routes");
const cloudinary = require("cloudinary").v2;

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // for req.body
app.use(express.urlencoded({ extended: true })); // to parse form data
app.use(cookieParser()); // to access the cookies

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectMongoDB();
});
