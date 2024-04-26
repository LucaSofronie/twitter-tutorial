const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth.routes"); // the router
const connectMongoDB = require("./db/connectMongoDB");

dotenv.config();

const app = express();

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectMongoDB();
});
