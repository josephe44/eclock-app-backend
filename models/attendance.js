import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
    },
    location: {
      lat: {
        type: String,
        required: true,
      },
      long: {
        type: String,
        required: true,
      },
    },

    // user and task relationship
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
  },

  {
    timestamps: true,
  }
);

// convert the user mongo object to a json object and delete some user field
attendanceSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  userObject.id = userObject._id;

  delete userObject._id;
  delete userObject.__v;
  delete userObject.updatedAt;
  return userObject;
};

const attendanceModel = mongoose.model("attendance", attendanceSchema);
export default attendanceModel;
