require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const bodyParser = require("body-parser");
const User = require("./models/User");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔗 Connect to MongoDB Atlas
mongoose
  .connect("mongodb+srv://ONLY_TESTING_USERNAME:ONLY_TESTING_PASSWORD@cluster0.qi4xgtf.mongodb.net/myDatabase?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// 📝 Signup API
app.post("/api/signup", async (req, res) => {
  try {
    const { username, mobile, email, password, confirmPassword, securityQuestion, securityAnswer } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "❌ Passwords do not match!" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "❌ Username already taken!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      mobile,
      email,
      password: hashedPassword,
      securityQuestion,
      securityAnswer,
    });

    await newUser.save();
    res.status(201).json({ message: "✅ Signup successful! You can now login." });
  } catch (error) {
    res.status(500).json({ message: "❌ Internal Server Error", error });
  }
});

// 🔑 Login API
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: "❌ User not found!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "❌ Incorrect password!" });
    }

    res.status(200).json({ message: "✅ Login successful!" });
  } catch (error) {
    res.status(500).json({ message: "❌ Internal Server Error", error });
  }
});

// 🚀 Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`🔥 Server running on http://localhost:${PORT}`));
