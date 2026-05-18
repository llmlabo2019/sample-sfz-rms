import { defineFunction } from "@aws-amplify/backend";

export const completePasswordSampleSfz = defineFunction({
  name: "complete-passoword-Sample-SFZ",
  entry: "./completePasswordSampleSfzMain.ts",
});
