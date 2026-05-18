import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource.js";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import { loginSampleSfz } from "./functions/auth/login-sample-sfz/resource";
import { completePasswordSampleSfz } from "./functions/auth/complete-password-sample-sfz/resource";
import { fetchAlarmDatasSampleSfz } from "./functions/main/fetch-alarm-datas-sample-sfz/resource";
import { fetchOperatingDatasSampleSfz } from "./functions/main/fetch-operating-datas-sample-sfz/resource";
import { fetchPackageStatusDatasSampleSfz } from "./functions/main/fetch-package-status-sample-sfz/resource";
import * as path from "path";
import * as dotenv from "dotenv";

// 環境の判定
// Amplify: AWS_BRANCH が自動設定される → dotenv 不要、コンソールの環境変数を使用
// ローカル: npm script の dotenv CLI が .env.* をロード済み (ENV_NAME が設定される)
//           ENV_NAME が未設定の場合は .env.dev をフォールバックとして読み込む
if (!process.env.AWS_BRANCH) {
  const envName = process.env.ENV_NAME ?? "dev";
  const envFile = envName === "main" ? ".env.main" : ".env.dev";
  dotenv.config({ path: path.resolve(process.cwd(), envFile) });
}

// Environment configuration
const config = {
  region: process.env.AWS_REGION || "ap-northeast-1",
  corsOrigins: (process.env.CORS_ORIGINS || "*").split(","),
  rateLimit: parseInt(process.env.RATE_LIMIT || "100", 10),
  burstLimit: parseInt(process.env.BURST_LIMIT || "50", 10),
  envName: process.env.ENV_NAME || process.env.AWS_BRANCH || "dev",
  debugMode: process.env.DEBUG_MODE === "true",
  tableAlarm: process.env.TABLE_ALARM || "df-sf-zero-rms-alarm-table",
  tableAlarmPrimaryKey: process.env.TABLE_ALARM_PRIMARY_KEY || "devicename",
  tableAlarmSortKey: process.env.TABLE_ALARM_SORT_KEY || "alarmtimestamp",
  tableDatas: process.env.TABLE_DATAS || "df-sf-zero-rms-data-table",
  tableDatasPrimaryKey: process.env.TABLE_DATAS_PRIMARY_KEY || "devicename",
  tableDatasSortKey: process.env.TABLE_DATAS_SORT_KEY || "timestamp",
  deviceName: process.env.DEVICE_NAME || "2444-1488-24",
};

const backend = defineBackend({
  auth,
  loginSampleSfz,
  completePasswordSampleSfz,
  fetchAlarmDatasSampleSfz,
  fetchOperatingDatasSampleSfz,
  fetchPackageStatusDatasSampleSfz,
});

const userPoolId = backend.auth.resources.userPool.userPoolId;
const userPoolClientId = backend.auth.resources.userPoolClient.userPoolClientId;

const ApiStack = backend.createStack("SampleSfzApiStack");

const api = new apigateway.RestApi(ApiStack, "SampleSfzApi", {
  restApiName: "Sample SFZ API",
});

const usagePlan = api.addUsagePlan("SampleSfzUsagePlan", {
  name: `SampleSfzApiUsagePlan-${config.envName}`,
  throttle: {
    rateLimit: config.rateLimit,
    burstLimit: config.burstLimit,
  },
});

usagePlan.addApiStage({ stage: api.deploymentStage });

const loginSampleSfzFunction = backend.loginSampleSfz.resources.lambda;
const completePasswordSampleSfzFunction =
  backend.completePasswordSampleSfz.resources.lambda;
const fetchAlarmDatasSampleSfzFunction =
  backend.fetchAlarmDatasSampleSfz.resources.lambda;
const fetchOperatingDatasSampleSfzFunction =
  backend.fetchOperatingDatasSampleSfz.resources.lambda;
const fetchPackageStatusDatasSampleSfzFunction =
  backend.fetchPackageStatusDatasSampleSfz.resources.lambda;

// =============================================
//   環境変数の付与
// =============================================

// 全 Lambda 共通
const allBackendFunctions = [
  backend.loginSampleSfz,
  backend.completePasswordSampleSfz,
  backend.fetchAlarmDatasSampleSfz,
  backend.fetchOperatingDatasSampleSfz,
  backend.fetchPackageStatusDatasSampleSfz,
];

allBackendFunctions.forEach((fn) => {
  fn.addEnvironment("ENV", config.envName);
  fn.addEnvironment("REGION", config.region);
  fn.addEnvironment("DEBUG_MODE", config.debugMode.toString());
});

// Auth: Cognito 接続情報
[backend.loginSampleSfz, backend.completePasswordSampleSfz].forEach((fn) => {
  fn.addEnvironment("USER_POOL_ID", userPoolId);
  fn.addEnvironment("CLIENT_ID", userPoolClientId);
});

[
  backend.fetchOperatingDatasSampleSfz,
  backend.fetchPackageStatusDatasSampleSfz,
].forEach((fn) => {
  fn.addEnvironment("TABLE_DATAS", config.tableDatas);
  fn.addEnvironment("TABLE_DATAS_PRIMARY_KEY", config.tableDatasPrimaryKey);
  fn.addEnvironment("TABLE_DATAS_SORT_KEY", config.tableDatasSortKey);
  fn.addEnvironment("DEVICE_NAME", config.deviceName);
});

[backend.fetchAlarmDatasSampleSfz].forEach((fn) => {
  fn.addEnvironment("TABLE_ALARM", config.tableAlarm);
  fn.addEnvironment("TABLE_ALARM_PRIMARY_KEY", config.tableAlarmPrimaryKey);
  fn.addEnvironment("TABLE_ALARM_SORT_KEY", config.tableAlarmSortKey);
  fn.addEnvironment("DEVICE_NAME", config.deviceName);
});

// IAM Policies for Auth functions (Cognito access)
[backend.loginSampleSfz, backend.completePasswordSampleSfz].forEach((fn) => {
  fn.resources.lambda.addToRolePolicy(
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "cognito-idp:AdminInitiateAuth",
        "cognito-idp:AdminRespondToAuthChallenge",
        "cognito-idp:AdminGetUser",
      ],
      resources: [
        `arn:aws:cognito-idp:${config.region}:*:userpool/${userPoolId}`,
      ],
    }),
  );
});

// IAM Policies for DynamoDB access (Data tables)
[
  backend.fetchOperatingDatasSampleSfz,
  backend.fetchPackageStatusDatasSampleSfz,
].forEach((fn) => {
  fn.resources.lambda.addToRolePolicy(
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:GetItem",
        "dynamodb:BatchGetItem",
      ],
      resources: [
        `arn:aws:dynamodb:${config.region}:*:table/${config.tableDatas}`,
        `arn:aws:dynamodb:${config.region}:*:table/${config.tableDatas}/index/*`,
      ],
    }),
  );
});

// IAM Policies for DynamoDB access (Alarm table)
[backend.fetchAlarmDatasSampleSfz].forEach((fn) => {
  fn.resources.lambda.addToRolePolicy(
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:GetItem",
        "dynamodb:BatchGetItem",
      ],
      resources: [
        `arn:aws:dynamodb:${config.region}:*:table/${config.tableAlarm}`,
        `arn:aws:dynamodb:${config.region}:*:table/${config.tableAlarm}/index/*`,
      ],
    }),
  );
});

const loginSampleSfzIntegration = new apigateway.LambdaIntegration(
  loginSampleSfzFunction,
);
const completePasswordSampleSfzIntegration = new apigateway.LambdaIntegration(
  completePasswordSampleSfzFunction,
);
const fetchAlarmDatasSampleSfzIntegration = new apigateway.LambdaIntegration(
  fetchAlarmDatasSampleSfzFunction,
);
const fetchOperatingDatasSampleSfzIntegration =
  new apigateway.LambdaIntegration(fetchOperatingDatasSampleSfzFunction);
const fetchPackageStatusDatasSampleSfzIntegration =
  new apigateway.LambdaIntegration(fetchPackageStatusDatasSampleSfzFunction);

// Cognito User Pool Authorizer
const cognitoAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(
  ApiStack,
  "CognitoAuthorizer",
  {
    cognitoUserPools: [backend.auth.resources.userPool],
    authorizerName: "SampleSfzCognitoAuthorizer",
    identitySource: apigateway.IdentitySource.header("Authorization"),
  },
);

const loginSampleSfzApi = api.root.addResource("login-sample-sfz");
const completePasswordSampleSfzApi = api.root.addResource(
  "complete-password-sample-sfz",
);
const fetchAlarmDatasSampleSfzApi = api.root.addResource(
  "alarm-datas-sample-sfz",
);
const fetchOperatingDatasSampleSfzApi = api.root.addResource(
  "op-datas-sample-sfz",
);
const fetchPackageStatusDatasSampleSfzApi = api.root.addResource(
  "package-status-datas-sample-sfz",
);

loginSampleSfzApi.addMethod("POST", loginSampleSfzIntegration);

completePasswordSampleSfzApi.addMethod(
  "POST",
  completePasswordSampleSfzIntegration,
);

fetchAlarmDatasSampleSfzApi.addMethod(
  "GET",
  fetchAlarmDatasSampleSfzIntegration,
  {
    authorizationType: apigateway.AuthorizationType.COGNITO,
    authorizer: cognitoAuthorizer,
  },
);

fetchOperatingDatasSampleSfzApi.addMethod(
  "GET",
  fetchOperatingDatasSampleSfzIntegration,
  {
    authorizationType: apigateway.AuthorizationType.COGNITO,
    authorizer: cognitoAuthorizer,
  },
);

fetchPackageStatusDatasSampleSfzApi.addMethod(
  "GET",
  fetchPackageStatusDatasSampleSfzIntegration,
  {
    authorizationType: apigateway.AuthorizationType.COGNITO,
    authorizer: cognitoAuthorizer,
  },
);

const corsHeaders = ["Content-Type", "Authorization", "Cookie"];

loginSampleSfzApi.addCorsPreflight({
  allowOrigins: config.corsOrigins,
  allowMethods: ["POST"],
  allowHeaders: corsHeaders,
});

completePasswordSampleSfzApi.addCorsPreflight({
  allowOrigins: config.corsOrigins,
  allowMethods: ["POST"],
  allowHeaders: corsHeaders,
});

fetchAlarmDatasSampleSfzApi.addCorsPreflight({
  allowOrigins: config.corsOrigins,
  allowMethods: ["GET"],
  allowHeaders: corsHeaders,
});

fetchOperatingDatasSampleSfzApi.addCorsPreflight({
  allowOrigins: config.corsOrigins,
  allowMethods: ["GET"],
  allowHeaders: corsHeaders,
});

fetchPackageStatusDatasSampleSfzApi.addCorsPreflight({
  allowOrigins: config.corsOrigins,
  allowMethods: ["GET"],
  allowHeaders: corsHeaders,
});

backend.addOutput({
  custom: {
    [api.restApiName]: {
      apiName: api.restApiName,
      endpoint: api.url,
      region: ApiStack.region,
    },
  },
});
