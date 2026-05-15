const { successResponse } = require("../utils/response");
const { registerUser, loginUser } = require("../services/auth.service");

const register = async (req, res, next) => {
  try {
    const { name, email, password, country, incomeBracket } = req.body;

    if (!name || !email || !password) {
      const error = new Error("All fields are required");
      error.statusCode = 400;
      throw error;
    }

    const result = await registerUser({
      name,
      email,
      password,
      country,
      incomeBracket,
    });

    successResponse(res, result, "User registered successfully", 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error("Email and password are required");
      error.statusCode = 400;
      throw error;
    }

    const result = await loginUser({ email, password });

    successResponse(res, result, "Login successful");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
