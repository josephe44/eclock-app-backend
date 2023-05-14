import { errorFormatter } from "../../helper/errorFormatter.js";
import responses from "../../helper/responses.js";
import attendanceModel from "../../models/attendance.js";

import dayjs from "dayjs";

export const handleClockIn = async (req, res) => {
  const { eventType, location } = req.body;
  try {
    const user = req.user.id;

    // get the time frame within 24hrs
    const startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0); // Set to the beginning of the current day

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

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

    // proceed to create an event when there is no attendance
    const newEvent = attendanceModel({ eventType, location, user });
    await newEvent.save();

    return responses.resourceCreated({
      res,
      message: `user clocked in successfully`,
      data: newEvent,
    });
  } catch (error) {
    if (error) {
      errorFormatter({ res, error });
    } else {
      return responses.badRequest({
        res,
        message: `clock in failed`,
        error: error.message,
      });
    }
  }
};

export const handleClockOut = async (req, res) => {
  const { eventType, location } = req.body;
  try {
    const user = req.user.id;

    // get the time frame within 24hrs
    const startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0); // Set to the beginning of the current day

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

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
        message: `you already clocked out for today`,
      });

    // get 5pm time for the current day in seconds
    const check5PM = new Date();
    check5PM.setUTCHours(17, 0, 0, 0);
    const check5PMInSeconds = Math.floor(check5PM.getTime() / 1000);
    console.log(check5PMInSeconds);

    // get end date time for the current day in seconds
    const today = new Date();
    const currentDateInSeconds = Math.floor(today.getTime() / 1000);

    // check if the current date in seconds is less than the closing date , throw an error if it is true
    if (currentDateInSeconds < check5PMInSeconds) {
      return responses.badRequest({
        res,
        message: `you cannot clock out at this time`,
      });
    }

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
      errorFormatter({ res, error });
    } else {
      return responses.badRequest({
        res,
        message: `clock out failed`,
        error: error.message,
      });
    }
  }
};
