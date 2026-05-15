const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const { generateToken } = require("../config/jwt");

const registerUser = async ({
  name,
  email,
  password,
  country,
  incomeBracket,
}) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    country,
    incomeBracket,
  });

  const userObj = user.toObject();
  delete userObj.password;

  const token = generateToken({ id: user._id });

  return { user: userObj, token };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const userObj = user.toObject();
  delete userObj.password;

  const token = generateToken({ id: user._id });

  return { user: userObj, token };
};

module.exports = {
  registerUser,
  loginUser,
};
