const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Debugging middleware
app.use((req, res, next) => {
  console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
  next();
});

mongoose.connect('mongodb+srv://hemanshiprajapati811:30esT3wt0KHr0tnS@registration-form-task1.u7kgi02.mongodb.net/?retryWrites=true&w=majority&appName=Registration-form-task1', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB", err));

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String
});
const User = mongoose.model('User', UserSchema);

// Signup route
app.post("/signup", async (req, res) => {
  const { username, password, confirm_password, email } = req.body;

  if (!username || !password || !confirm_password || !email) {
    return res.status(400).send("All fields are required");
  }

  if (password !== confirm_password) {
    return res.status(400).send("Passwords do not match");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email });
  if (existingUser) {
    return res.status(400).send("Account already exists");
  }

  // Create new user
  const newUser = new User({
    username: username,
    password: password,
    email: email
  });

  try {
    // Save user to database
    await newUser.save();
    console.log("User registered successfully");
    res.redirect(`/regi-success.html?username=${username}`);
  } catch (error) {
    console.error("Error saving user to the database:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  // Find user by email and password
  const user = await User.findOne({ email: email, password: password });
  if (!user) {
    return res.status(401).send("Invalid email or password");
  }

  console.log("Login Successful");
  res.redirect(`/login-success.html?username=${user.username}`);
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html as the main entry point
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
