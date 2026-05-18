import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// Environment variables
const TABLE_NAME = process.env.TABLE_DATAS || 'df-sf-zero-rms-data-table';
const DDB_PRIMARY_KEY = process.env.TABLE_DATAS_PRIMARY_KEY || 'devicename';
const DDB_SORT_KEY = process.env.TABLE_DATAS_SORT_KEY || 'timestamp';
const DEVICENAME = process.env.DEVICE_NAME || '2444-1488-24';
const REGION = process.env.REGION || 'ap-northeast-1';

const client = new DynamoDBClient({ region: REGION });
const dynamodb = DynamoDBDocumentClient.from(client);

// ------------------------------------------------------------------------
async function dynamoQuery(dataid: string): Promise<any> {
  console.log('dynamoQuery start(Package Status Latest Data)');

  // Select package status fields per dataid
  const data_map: Record<string, string[]> = {
    'sf-zero-1': ['D6020', 'D6021', 'D6022', 'D6023', 'D6024', 'D6025', 'D6026', 'D6027', 'D6028', 'D6029', 'D6036', 'D6037', 'D6038', 'D6042', 'D6044', 'D6045', 'D6046', 'D6047', 'D6056', 'D6057', 'D6058', 'D6059', 'D6060', 'unit11Operation', 'coolerFan101OperationOne', 'coolerFan201OperationTwo', 'D6007', 'D6008', 'D6009', 'D6010', 'unit11OpDay'],
    'sf-zero-2': ['D6028', 'D6220', 'D6221', 'D6222', 'D6223', 'D6224', 'D6225', 'D6226', 'D6227', 'D6229', 'D6236', 'D6237', 'D6238', 'D6242', 'D6244', 'D6245', 'D6246', 'D6247', 'D6256', 'D6257', 'D6258', 'D6259', 'D6260', 'unit21Operation', 'coolerFan301OperationOne', 'coolerFan401OperationTwo', 'D6207', 'D6208', 'D6209', 'D6210', 'unit21OpDay'],
  };

  // Map multipliers for selected fields per dataid
  const multiplier_map: Record<string, Record<string, number>> = {
    'sf-zero-1': {
      D6020: 0.1,
      D6021: 0.1,
      D6022: 0.1,
      D6023: 0.1,
      D6024: 0.1,
      D6025: 0.1,
      D6026: 0.1,
      D6027: 0.1,
      D6028: 0.1,
      D6029: 0.1,
      D6036: 0.001,
      D6037: 0.001,
      D6038: 0.001,
      D6042: 0.1,
      D6044: 0.1,
      D6045: 0.1,
      D6046: 0.1,
      D6047: 0.1,
      D6056: 0.1,
      D6057: 0.01,
      D6058: 0.01,
      D6059: 0.01,
      D6060: 0.01,
      unit11Operation: 99,
      coolerFan101OperationOne: 99,
      coolerFan201OperationTwo: 99,
      D6007: 99,
      D6008: 99,
      D6009: 99,
      D6010: 99,
      unit11OpDay: 99,
    },
    'sf-zero-2': {
      D6028: 0.1,
      D6220: 0.1,
      D6221: 0.1,
      D6222: 0.1,
      D6223: 0.1,
      D6224: 0.1,
      D6225: 0.1,
      D6226: 0.1,
      D6227: 0.1,
      D6229: 0.1,
      D6236: 0.001,
      D6237: 0.001,
      D6238: 0.001,
      D6242: 0.1,
      D6244: 0.1,
      D6245: 0.1,
      D6246: 0.1,
      D6247: 0.1,
      D6256: 0.1,
      D6257: 0.01,
      D6258: 0.01,
      D6259: 0.01,
      D6260: 0.01,
      unit21Operation: 99,
      coolerFan301OperationOne: 99,
      coolerFan401OperationTwo: 99,
      D6207: 99,
      D6208: 99,
      D6209: 99,
      D6210: 99,
      unit21OpDay: 99,
    },
  };

  const selected_data = data_map[dataid] || [];
  const multiplierMap = multiplier_map[dataid] || {};

  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: `#pk = :pk`,
    ExpressionAttributeNames: {
      '#pk': DDB_PRIMARY_KEY,
    },
    ExpressionAttributeValues: {
      ':pk': DEVICENAME,
    },
    ScanIndexForward: false,
    Limit: 1,
  };

  const command = new QueryCommand(params);
  const res = await dynamodb.send(command);

  if (res.Items && res.Items.length > 0) {
    const row = res.Items[0];
    const itemDict: Record<string, any> = {
      timestamp: row.timestamp,
    };

    for (const key of selected_data) {
      if (key in row) {
        const multiplier_value = multiplierMap[key] || 1;
        if (multiplier_value !== 99) {
          itemDict[key] = Math.round(parseFloat(row[key]) * multiplier_value * 100) / 100;
        } else {
          itemDict[key] = parseFloat(row[key]);
        }
      }
    }

    return itemDict;
  }

  return null;
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

    // get Parameters
    let queryStringParameters = event.queryStringParameters;

    if (!queryStringParameters) {
      // Try parsing pathParameters for GET requests
      const pathParameters = event.pathParameters;
      if (pathParameters && 'proxy' in pathParameters) {
        const queryString = pathParameters.proxy;
        const parsed = new URLSearchParams(queryString!);
        queryStringParameters = {};
        parsed.forEach((value, key) => {
          queryStringParameters![key] = value;
        });
      }
    }

    if (!queryStringParameters) {
      throw new Error('No query string parameters provided');
    }

    // dataid
    const dataid = queryStringParameters.dataid;

    if (!dataid) {
      throw new Error('Missing required parameters: dataid, startdate, or enddate');
    }

    const resItemDict: Record<string, any> = { [dataid]: '' };

    resItemDict[dataid] = await dynamoQuery(dataid);

    if (!resItemDict[dataid] || resItemDict[dataid].length === 0) {
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
    HttpRes.body = 'Internal Server Error';
  }

  console.log(`response:${JSON.stringify(HttpRes)}`);
  return HttpRes;
};
