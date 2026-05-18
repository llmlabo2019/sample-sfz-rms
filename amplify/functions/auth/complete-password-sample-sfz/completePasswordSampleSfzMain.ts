import {
  CognitoIdentityProviderClient,
  AdminRespondToAuthChallengeCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const USER_POOL_ID = process.env.USER_POOL_ID!;
const CLIENT_ID = process.env.CLIENT_ID!;
const REGION = process.env.REGION || 'ap-northeast-1';

const client = new CognitoIdentityProviderClient({
  region: REGION,
});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { username, newPassword, session } = body;

    const command = new AdminRespondToAuthChallengeCommand({
      ChallengeName: "NEW_PASSWORD_REQUIRED",
      ClientId: CLIENT_ID,
      UserPoolId: USER_POOL_ID,
      Session: session,
      ChallengeResponses: {
        USERNAME: username,
        NEW_PASSWORD: newPassword,
      },
    });

    const response = await client.send(command);
    const idToken = response.AuthenticationResult?.IdToken;

    if (!idToken) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Invalid challenge response" }),
      };
    }

    const expires = new Date(Date.now() + 60 * 60 * 24 * 1000).toUTCString();

    return {
      statusCode: 200,
      headers: {
        "Set-Cookie": `vdf-sunroyal-token=${idToken}; Expires=${expires}; HttpOnly; Path=/; Secure; SameSite=Lax`,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true",
      },
      body: JSON.stringify({ message: "Password updated successfully" }),
    };
  } catch (err: any) {
    console.error("Complete password error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message || "Server error" }),
    };
  }
};
