import { Amplify } from "aws-amplify";

export function configureAmplify() {
  const env = process.env.NEXT_PUBLIC_ENV;

  if (env === "dev") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const outputs = require("@/amplify_outputs.dev.json");
    Amplify.configure(outputs);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const outputs = require("@/amplify_outputs.main.json");
    Amplify.configure(outputs);
  }
}
