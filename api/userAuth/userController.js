import { errorFormatter } from "../../helper/errorFormatter.js";
import responses from "../../helper/responses.js";
import attendanceModel from "../../models/attendance.js";
import userModel from "../../models/userModel.js";
import bcrypt from "bcryptjs";

export const handleCreateUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const newUser = userModel({ name, email, password });
    const token = await newUser.generateAuthToken();
    await newUser.save();
    return responses.resourceCreated({
      res,
      message: `user created`,
      token: token,
      data: newUser,
    });
  } catch (error) {
    errorFormatter({ error, res });
  }
};

// Login a user
export const handleUserLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    // check if the request body is empty
    if (!email || !password) {
      responses.badRequest({
        res,
        message: `username and password are required`,
      });
    }

    const user = await userModel.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    return responses.successfulRequest({
      res,
      message: `user has successful login`,
      token: token,
      data: user,
    });
  } catch (error) {
    return responses.badRequest({
      res,
      message: error.message,
    });
  }
};

// Logout a user
export const handleUserLogout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    return responses.successfulRequest({
      res,
      message: `user Logged out successfully`,
    });
  } catch (e) {
    responses.badRequest({
      res,
      message: `Logout failed`,
    });
  }
};

export const handleGetLoggedInUserProfile = async (req, res) => {
  try {
    // get the time frame within 24hrs
    const startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0); // Set to the beginning of the current day

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    // checks if the user has already clocked in for that day
    const clockInCheck = await attendanceModel.findOne({
      eventType: "clockin",
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // checks if the user has already clocked out for that day
    const clockOutCheck = await attendanceModel.findOne({
      eventType: "clockout",
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // return the user info and their clockin and clockout for that day
    return responses.successfulRequest({
      res,
      message: `Fetched successfully`,
      data: { user: req.user, clockInCheck, clockOutCheck },
    });
  } catch (e) {
    responses.badRequest({
      res,
      message: `Failed to fetch user profile`,
    });
  }
};

// Update a user profile
export const handleUpdateUserProfile = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["bio", "avatar"];
    const isValidOperation = updates.every((update) => {
      return allowedUpdates.includes(update);
    });

    if (!isValidOperation)
      return responses.badRequest({
        res,
        message: `cross check the fields you are trying to update`,
      });
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });
    await req.user.save();
    return responses.resourceCreated({
      res,
      message: `user Logged out successfully`,
      data: req.user,
    });
  } catch (e) {
    responses.badRequest({
      res,
      message: `update failed`,
    });
  }
};

// change a user password
export const handleChangePassword = async (req, res) => {
  const user = req.user;
  console.log(user);

  try {
    const { old_password, new_password } = req.body;

    // check if the request is empty
    if (!old_password || !new_password) {
      responses.badRequest({
        res,
        message: `old_password and new_password are required`,
      });
    }

    const is_match = await bcrypt.compare(old_password, user.password);
    const same_password = await bcrypt.compare(new_password, user.password);

    if (!is_match)
      return responses.badRequest({
        res,
        message: "Incorrect Password",
        error: "Could not update password",
      });

    if (same_password)
      return responses.badRequest({
        res,
        message: "New Password cannot be the same as the old password",
        error: "Could not update password",
      });

    user.password = new_password;
    await user.save();

    responses.successfulRequest({
      res,
      message: "Password updated successfully",
    });
  } catch (error) {
    responses.badRequest({
      res,
      message: `server error`,
    });
  }
};

// Fetch all users in the system
export const handleFetchAllUsers = async (req, res) => {
  try {
    const users = await userModel.find();
    return responses.resourceCreated({
      res,
      message: `Fetched all users in the app`,
      data: users,
    });
  } catch (error) {
    responses.badRequest({
      res,
      message: `fail to fetch all users`,
    });
  }
};
