const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    country: {
      type: String,
      trim: true,
    },

    incomeBracket: {
      type: String,
      enum: ["low", "middle", "high"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
