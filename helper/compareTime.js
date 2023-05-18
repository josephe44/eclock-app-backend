import dayjs from "dayjs";

export const getCurrentHour = () => {
  const nowTime = dayjs(new Date()).format("H");
  return { nowTime };
};
