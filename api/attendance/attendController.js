import { getCurrentHour } from "../../helper/compareTime.js";
import { errorFormatter } from "../../helper/errorFormatter.js";
import responses from "../../helper/responses.js";
import attendanceModel from "../../models/attendance.js";
import { compareAsc } from "date-fns";

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
    const newEvent = attendanceModel({
      eventType,
      location,
      user,
      status: true,
    });
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
    const clockInCheck = await attendanceModel.findOne({
      eventType: "clockin",
      createdAt: { $gte: startDate, $lte: endDate },
    });

    if (!clockInCheck)
      return responses.badRequest({
        res,
        message: `you need to be clocked in before performing this operation`,
      });

    // checks if the user has already clocked out for that day, throw an error if it true
    const clockOutCheck = await attendanceModel.findOne({
      eventType: "clockout",
      createdAt: { $gte: startDate, $lte: endDate },
    });

    if (clockOutCheck)
      return responses.badRequest({
        res,
        message: `you already clocked out for today`,
      });

    const { nowTime } = getCurrentHour();
    if (nowTime < 17)
      return responses.badRequest({
        res,
        message: `you can't clock in at this time`,
      });

    // proceed to create an event when there is no attendance
    const newEvent = attendanceModel({
      eventType,
      location,
      user,
      status: true,
    });
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
