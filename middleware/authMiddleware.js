import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import responses from "../helper/responses.js";

export const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      //   Get token from header
      token = req.headers.authorization.split(" ")[1];

      //   Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      //   Get user from model using token
      const user = await userModel.findOne({
        _id: decoded._id,
        "tokens.token": token,
      });
      if (!user) {
        return responses.badRequest({
          res,
          message: ` You are not authorized to perform this action`,
        });
      }

      req.token = token;
      req.user = user;

      next();
    } catch (error) {
      console.log(error);
      return responses.badRequest({
        res,
        message: ` You are not authorized to perform this action`,
      });
    }
  }

  if (!token) {
    return responses.notFound({
      res,
      message: `Token is required`,
    });
  }
};
