import { defineFunction } from "@aws-amplify/backend";

export const fetchOperatingDatasSampleSfz = defineFunction({
  name: "fetch-operating-datas-Sample-SFZ",
  entry: "./FetchOperatingDatasSampleSfzMain.ts",
});
