import { defineFunction } from "@aws-amplify/backend";

export const fetchAlarmDatasSampleSfz = defineFunction({
  name: "fetch-alarm-datas-Sample-Sfz",
  entry: "./FetchAlarmDatasSample-SfzMain.ts",
});
