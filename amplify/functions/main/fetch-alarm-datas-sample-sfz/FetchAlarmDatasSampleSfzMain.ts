import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// Environment variables
const TABLE_NAME = process.env.TABLE_ALARM || 'df-sf-zero-rms-alarm-table';
const DDB_PRIMARY_KEY = process.env.TABLE_ALARM_PRIMARY_KEY || 'devicename';
const DDB_SORT_KEY = process.env.TABLE_ALARM_SORT_KEY || 'alarmtimestamp';
const DEVICENAME = process.env.DEVICE_NAME || '2444-1488-24';
const REGION = process.env.REGION || 'ap-northeast-1';

const client = new DynamoDBClient({ region: REGION });
const dynamodb = DynamoDBDocumentClient.from(client);

// ------------------------------------------------------------------------
async function dynamoQuery(locationId: string): Promise<any[]> {
  console.log('dynamoQuery start(New System Running Data)');

  const valList: any[] = [];

  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: `#pk = :pk`,
    ExpressionAttributeNames: {
      '#pk': DDB_PRIMARY_KEY,
    },
    ExpressionAttributeValues: {
      ':pk': locationId,
    },
    ScanIndexForward: false,
  };

  const command = new QueryCommand(params);
  const res = await dynamodb.send(command);

  if (res.Items) {
    for (const row of res.Items) {
      valList.push(row);
    }
  }

  return valList;
}

// ------------------------------------------------------------------------
// call by Lambda here.
//  Event structure : API-Gateway Lambda proxy post
// ------------------------------------------------------------------------
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Lambda Proxy response back template
  const HttpRes: APIGatewayProxyResult = {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: '',
    isBase64Encoded: false,
  };

  try {
    console.log('lambda_handler start');
    console.log(JSON.stringify(event));

    // locationid
    const locationid = DEVICENAME;

    if (!locationid) {
      throw new Error('Missing required parameters: locationid');
    }

    const resItemDict: Record<string, any> = { [locationid]: '' };
    resItemDict[locationid] = await dynamoQuery(locationid);

    if (!resItemDict[locationid] || resItemDict[locationid].length === 0) {
      HttpRes.statusCode = 204;
    } else {
      HttpRes.body = JSON.stringify(resItemDict);
    }
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    HttpRes.statusCode = 500;
    HttpRes.body = 'Lambda error. check lambda log';
  }

  console.log(`response:${JSON.stringify(HttpRes)}`);
  return HttpRes;
};
