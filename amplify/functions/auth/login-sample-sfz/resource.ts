import { defineFunction } from "@aws-amplify/backend";

export const loginSampleSfz = defineFunction({
  name: "login-Sample-SFZ",
  entry: "./loginSampleSfzMain.ts",
});
