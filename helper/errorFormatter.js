import responses from "./responses.js";

export const errorFormatter = ({ res, error }) => {
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
};

// "eventType": "clockin",
// const currentDate = new Date();
// const startDate = new Date(
//   currentDate.getFullYear(),
//   currentDate.getMonth(),
//   1
// );
// const endDate = new Date(
//   currentDate.getFullYear(),
//   currentDate.getMonth() + 1,
//   0
// );
