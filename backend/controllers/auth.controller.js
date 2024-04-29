const User = require("../models/user.model");
const bcrpyt = require("bcryptjs");
const generateTokenAndSetCookie = require("../lib/utils/generateToken");

// * @desc
// 1) iei datele din req si le verifici
// 2) encrypt the password
// 3) faci un instance of User
// 4) ii atasezi res un cookie cu jwt cu payload = user._id
// 5) il salvezi in MongoDB
// 6) return response cu user Fara password
const signup = async (req, res) => {
  try {
    // ! Verificarea datelor

    const { fullName, username, email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    // ! Hash the password

    const salt = await bcrpyt.genSalt(10);
    const hashedPassword = await bcrpyt.hash(password, salt);

    // ! new Instance of User

    // fullName: fullName,  devine doar fullName
    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    // posibil sa fie probleme cu Type
    if (newUser) {
      //! token (_id) -> cookie -> response

      generateTokenAndSetCookie(newUser._id, res); // ii generezi un wristband. Pui un cookie cu jwt in response

      // ! Salvezi in MongoDB

      await newUser.save(); // save it on DB

      // sends the response as the newUser except the password which can't be compromised even though is hashed

      // ! Trimiti response cu newUser Fara password

      res.status(200).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// * @desc
// 1) iei username si password din request
// 2) identifici user in MonogoDB cu username
// 3) compari client's password cu MongoDB user's password cu bcrypt.compare(pass, hash_pass || '')
// 4) generateTokenAndSetCookie
// 5) response = user fara password

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrpyt.compare(
      password,
      user?.password || ""
    );
    if (!user || !isPasswordCorrect)
      return res.status(400).json({ error: "Invalid credentials" });

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getMe controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getMe, signup, login, logout };
