const {
  validateEmail,
  validateLength,
} = require("../helpers/validation");
const bcrypt = require("bcrypt");
const { generateToken } = require("../helpers/tokens");
const User = require("../models/User");

exports.register = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
    } = req.body;
    // validate email
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }
    // check if user exists
    const check = await User.findOne({ email: email });
    if (check) {
      return res.status(400).json({
        message: "Email already exists, try using another email",
      });
    }
    if (!validateLength(first_name, 3, 30)) {
      return res
        .status(400)
        .json({ message: "First name should be between 3 and 30 characters" });
    }
    if (!validateLength(last_name, 1, 30)) {
      return res
        .status(400)
        .json({ message: "Last name should be between 3 and 30 characters" });
    }
    if (!validateLength(password, 6, 40)) {
      return res
        .status(400)
        .json({ message: "Password should be between 6 and 40 characters" });
    }
    // encrypt the password using bcrypt
    const cryptedPassword = await bcrypt.hash(password, 12);


    // Create and save new user
    const user = await new User({
      first_name,
      last_name,
      email,
      password: cryptedPassword,
    }).save();
    console.log(user)
    // generate jwt token
    const token = generateToken({ id: user._id.toString() }, "7d");

    await User.findByIdAndUpdate(user._id, {
      $push: { token: token }
    })
    //send response back to the client
    res.status(200).json({
      status: "Registration successfully",
      token: token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message,
    });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User does not exist" });
    // validate password
    const check = await bcrypt.compare(password, user.password);
    if (!check)
      return res.status(400).json({ message: "Incorrect loign details" });
    // generate token
    const token = generateToken({ id: user._id.toString() }, "7d");

    await User.findByIdAndUpdate(user._id, {
      $push: { token: token }
    })

    //send response back to the client
    res.status(200).json({
      status: "User logged in successfully",
      token: token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;
    // find user by id
    const user = await User.findById(userId);
    // validate old password
    const check = await bcrypt.compare(oldPassword, user.password);
    if (!check)
      return res.status(400).json({ message: "Old password is invalid" });
    // validate new password
    if (!validateLength(newPassword, 6, 40)) {
      return res
        .status(400)
        .json({ message: "Password should be between 6 and 40 characters" });
    }
    // encrypt new password using bcrypt
    const cryptedPassword = await bcrypt.hash(newPassword, 12);
    // update user with new password
    const response = await User.findByIdAndUpdate(userId, {
      $set: { password: cryptedPassword },
    });
    // send response back to the client
    res.status(200).json({
      status: "Password updated",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    // get all users
    const users = await User.find().select("-password");
    // send users back to the client
    res.status(200).json({ status: "ok", users: users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    let temp = req.header("Authorization");
    // split the Authorization header into bearer token and select the token
    let token = temp ? temp.split(" ")[1] : "";
    const response = await User.findByIdAndUpdate(req.user.id, {
      $pull: { token: token }
    })
    res.status(200).json({ message: 'logout successfull' })
  } catch (error) {
    console.log(error)
  }
}