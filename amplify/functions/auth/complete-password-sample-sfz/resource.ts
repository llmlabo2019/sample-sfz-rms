import { defineFunction } from "@aws-amplify/backend";

export const completePasswordSampleSfz = defineFunction({
  name: "complete-password-Sample-SFZ",
  entry: "./completePasswordSampleSfzMain.ts",
});
