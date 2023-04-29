import responses from "../../helper/responses.js";
import userModel from "../../models/userModel.js";

export const handleCreateUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const newUser = userModel({ name, email, password });
    const token = await newUser.generateAuthToken();
    await newUser.save();
    return responses.resourceCreated({
      res,
      message: `user created`,
      entity: token,
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
    // check if the request is empty
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
      entity: token,
      data: user,
    });
  } catch (error) {
    res.status(400).json({ message: "Invalid username or password" });
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
    res.status(500).send();
  }
};

export const handleGetLoggedInUserProfile = async (req, res) => {
  try {
    res.status(200).send(req.user);
  } catch (e) {
    res.status(500).send();
  }
};
