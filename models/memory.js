const mongoose = require("mongoose");

const memorySchema = new mongoose.Schema(
  {
    brotherName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },

    sisterName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },

    photos: [
      {
        type: String
      }
    ],

    memoryId: {
      type: String,
      required: true,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Memory", memorySchema);