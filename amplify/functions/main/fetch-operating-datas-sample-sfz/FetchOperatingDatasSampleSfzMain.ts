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
async function dynamoQuery(dataid: string, startDate: string, endDate: string): Promise<any[]> {
  console.log('dynamoQuery start(NeW System Running Data)');
  console.log(startDate);
  console.log(endDate);

  const data_map: Record<string, string[]> = {
    'sf-zero-1': ['D6020', 'D6021', 'D6022', 'D6023', 'D6024', 'D6025', 'D6026', 'D6027', 'D6028', 'D6029', 'D6036', 'D6037', 'D6038', 'D6039', 'D6040', 'D6041', 'D6042', 'D6044', 'D6045', 'D6046', 'D6047', 'D6048', 'D6049', 'D6050', 'D6051', 'D6052', 'D6053', 'D6054', 'D6055', 'D6056', 'D6057', 'D6058', 'D6059', 'D6060', 'D6064', 'D6065', 'D6066', 'D6068', 'D6069', 'D6070', 'D6071', 'D6073', 'D6074', 'D6075', 'D6076', 'D6077', 'D6078', 'D6079', 'unit11Operation', 'compressor11Operation', 'automaticDoor110CloseSignalOne', 'automaticDoor111CloseSignalTwo', 'coolerFan101OperationOne', 'coolerFan201OperationTwo', 'sv101', 'hsv101', 'sv201', 'hsv201', 'hsv11', 'mv101', 'mv201', 'exv101', 'epr101', 'exv201', 'epr201'],
    'sf-zero-2': ['D6220', 'D6221', 'D6222', 'D6223', 'D6224', 'D6225', 'D6226', 'D6227', 'D6028', 'D6229', 'D6236', 'D6237', 'D6238', 'D6239', 'D6240', 'D6241', 'D6242', 'D6244', 'D6245', 'D6246', 'D6247', 'D6248', 'D6249', 'D6250', 'D6251', 'D6252', 'D6253', 'D6254', 'D6255', 'D6256', 'D6257', 'D6258', 'D6259', 'D6260', 'D6264', 'D6265', 'D6266', 'D6268', 'D6269', 'D6270', 'D6271', 'D6273', 'D6274', 'D6275', 'D6276', 'D6277', 'D6278', 'D6279', 'unit21Operation', 'compressor21Operation', 'automaticDoor210CloseSignalOne', 'automaticDoor211CloseSignalTwo', 'coolerFan301OperationOne', 'coolerFan401OperationTwo', 'sv301', 'hsv301', 'sv401', 'hsv401', 'hsv21', 'mv301', 'mv401', 'exv301', 'epr301', 'exv401', 'epr401'],
  };

  const multiplier: Record<string, number[]> = {
    'sf-zero-1': [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.001, 0.001, 0.001, 0.001, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.01, 0.01, 0.01, 0.01, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.001, 0.1, 0.001, 0.1, 0.1, 0.001, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99],
    'sf-zero-2': [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.001, 0.001, 0.001, 0.001, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.01, 0.01, 0.01, 0.01, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.001, 0.1, 0.001, 0.1, 0.1, 0.001, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99],
  };

  const selected_data = data_map[dataid] || [];
  const selected_multiplier = multiplier[dataid] || [];

  const valList: any[] = [];
  let params;

  params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: `#pk = :pk AND #sk BETWEEN :startDate AND :endDate`,
    ExpressionAttributeNames: {
      '#pk': DDB_PRIMARY_KEY,
      '#sk': DDB_SORT_KEY,
    },
    ExpressionAttributeValues: {
      ':pk': DEVICENAME,
      ':startDate': startDate,
      ':endDate': endDate,
    },
    ScanIndexForward: false,
  };

  const command = new QueryCommand(params);
  const res = await dynamodb.send(command);

  if (res.Items) {
    for (const row of res.Items) {
      const itemDict: Record<string, any> = {
        timestamp: row.timestamp,
      };

      for (let idx = 0; idx < selected_data.length; idx++) {
        const key = selected_data[idx];
        if (key in row) {
          const multiplier_value = selected_multiplier[idx];
          if (multiplier_value !== 99) {
            itemDict[key] = Math.round(parseFloat(row[key]) * multiplier_value * 100) / 100;
          } else {
            itemDict[key] = parseFloat(row[key]);
          }
        }
      }

      valList.push(itemDict);
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

    const startDate = queryStringParameters.startdate;

    const endDate = queryStringParameters.enddate;

    if (!dataid || !startDate || !endDate) {
      throw new Error('Missing required parameters: dataid, startdate, or enddate');
    }

    const resItemDict: Record<string, any> = { [dataid]: '' };
    resItemDict[dataid] = await dynamoQuery(dataid, startDate, endDate);

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
