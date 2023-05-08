import responses from "../../helper/responses.js";
import attendanceModel from "../../models/attendance.js";
import dayjs from "dayjs";

export const handleClockIn = async (req, res) => {
  const { eventType, location } = req.body;
  try {
    const user = req.user.id;

    const currentDate = new Date();
    const startDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    // checks if the user has already clocked in for that day, throw an error if it true
    const clockInCheck = await attendanceModel.find({
      eventType: "clockin",
      createdAt: { $gte: startDate, $lte: endDate },
    });

    if (clockInCheck.length)
      return responses.badRequest({
        res,
        message: `you already clocked in for today`,
      });

    //   proceed to create an event when there is no attendance
    const newEvent = attendanceModel({ eventType, location, user });
    await newEvent.save();

    return responses.resourceCreated({
      res,
      message: `user clocked in successfully`,
      data: newEvent,
    });
  } catch (error) {
    if (error.errors) {
      return responses.badRequest({
        res,
        message: `Could not create attendance, the '${Object.keys(
          error.errors
        )[0].replace(/_/g, " ")}' field is missing or badly formatted`,
        error: `${Object.keys(error.errors)[0]
          .charAt(0)
          .toUpperCase()}${Object.keys(error.errors)[0]
          .replace(/_/g, " ")
          .slice(1)} is required`,
      });
    } else {
      return responses.badRequest({
        res,
        message: `clock in failed`,
      });
    }
  }
};

export const handleClockOut = async (req, res) => {
  const { eventType, location } = req.body;
  try {
    const user = req.user.id;
    const currentDate = new Date();
    const startDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    // checks if the user has already clocked in for that day , throw an error if it false
    const clockInCheck = await attendanceModel.find({
      eventType: "clockin",
      createdAt: { $gte: startDate, $lte: endDate },
    });

    if (!clockInCheck.length)
      return responses.badRequest({
        res,
        message: `you need to be clocked in before performing this operation`,
      });

    // checks if the user has already clocked out for that day, throw an error if it true
    const clockOutCheck = await attendanceModel.find({
      eventType: "clockout",
      createdAt: { $gte: startDate, $lte: endDate },
    });

    if (clockOutCheck.length)
      return responses.badRequest({
        res,
        message: `you already clocked out`,
      });

    // proceed to create an event when there is no attendance
    const newEvent = attendanceModel({ eventType, location, user });
    await newEvent.save();

    return responses.resourceCreated({
      res,
      message: `user clocked out successfully`,
      data: newEvent,
    });
  } catch (error) {
    if (error.errors) {
      return responses.badRequest({
        res,
        message: `Could not create attendance, the '${Object.keys(
          error.errors
        )[0].replace(/_/g, " ")}' field is missing or badly formatted`,
        error: `${Object.keys(error.errors)[0]
          .charAt(0)
          .toUpperCase()}${Object.keys(error.errors)[0]
          .replace(/_/g, " ")
          .slice(1)} is required`,
      });
    } else {
      return responses.badRequest({
        res,
        message: `clock out failed`,
      });
    }
  }
};
