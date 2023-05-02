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
    name: {
      ...sharedProps,
    },
    email: {
      ...sharedProps,
      unique: true,
      lowercase: true,

      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email Address");
        }
      },
    },
    password: {
      ...sharedProps,
    },
    bio: {
      type: String,
    },
    avatar: {
      type: String,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hashes the password before it saves to the database
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
    next();
  }
});

// check if the credentials already exist in the database
userSchema.statics.findByCredentials = async function (email, password) {
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      throw new Error("Incorrect Email or Password");
    }
    console.log(user);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Incorrect Email or Password");
    }
    return user;
  } catch (error) {
    throw error;
  }
};

// This generate tokens for all new users
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

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
