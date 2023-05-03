import mongoose from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const sharedProps = {
  type: String,
  required: true,
  trim: true,
};

const userSchema = new mongoose.Schema(
  {
    clockin: {
      type: Boolean,
      default: false,
    },
    clockout: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// convert the user mongo object to a json object and delete some user field
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.createdAt;
  delete userObject.updatedAt;
  return userObject;
};

const userModel = mongoose.model("user", userSchema);
export default userModel;
