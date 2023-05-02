import responses from "../../helper/responses.js";
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
    if (error) {
      if (error.errors)
        return responses.badRequest({
          res,
          message: `Could not create user, the '${Object.keys(
            error.errors
          )[0].replace(/_/g, " ")}' field is missing or badly formatted`,
          error: `${Object.keys(error.errors)[0]
            .charAt(0)
            .toUpperCase()}${Object.keys(error.errors)[0]
            .replace(/_/g, " ")
            .slice(1)} is required`,
        });

      if (error.keyValue)
        return responses.badRequest({
          res,
          message: `Could not create user, ${
            Object.keys(error.keyValue)[0]
          } already exists`,
          error: `${Object.keys(error.keyValue)[0]
            .charAt(0)
            .toUpperCase()}${Object.keys(error.keyValue)[0]
            .replace(/_/g, " ")
            .slice(1)} must be unique`,
        });
    }
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
    res.status(200).send(req.user);
  } catch (e) {
    res.status(500).send();
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
