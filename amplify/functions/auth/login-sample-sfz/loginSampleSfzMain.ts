import {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const USER_POOL_ID = process.env.USER_POOL_ID!;
const CLIENT_ID = process.env.CLIENT_ID!;
const REGION = process.env.REGION || "ap-northeast-1";

const client = new CognitoIdentityProviderClient({ region: REGION });

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { username, password } = body;

    const params = {
      AuthFlow: "ADMIN_NO_SRP_AUTH" as const,
      UserPoolId: USER_POOL_ID,
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    };

    const command = new AdminInitiateAuthCommand(params);
    const response = await client.send(command);

    if (response.ChallengeName === "NEW_PASSWORD_REQUIRED") {
      return {
        statusCode: 200,
        body: JSON.stringify({
          challenge: "NEW_PASSWORD_REQUIRED",
          session: response.Session,
          username,
        }),
      };
    }

    const expires = new Date(Date.now() + 60 * 60 * 24 * 1000).toUTCString();

    const idToken = response.AuthenticationResult?.IdToken;

    if (!idToken) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Login failed" }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Set-Cookie": `sample-sfz-token=${idToken}; Expires=${expires}; HttpOnly; Path=/; Secure; SameSite=Lax`,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true",
      },
      body: JSON.stringify({ message: "Login successful" }),
    };
  } catch (err: any) {
    console.error("Login error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message || "Login failed" }),
    };
  }
};
