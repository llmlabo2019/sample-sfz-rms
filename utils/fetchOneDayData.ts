import { getData } from './getData';

interface TimeRange {
  start: string;
  end: string;
}

interface DataItem {
  timestamp: string;
  [key: string]: any;
}

export const fetchOneDayData = async (selectedDate: Date, URL: string): Promise<DataItem[]> => {
  const reqYear = selectedDate.getFullYear().toString();
  const reqMonth = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
  const reqDate = selectedDate.getDate().toString().padStart(2, '0');

  const timeRanges: TimeRange[] = [
    { start: '00:00:00', end: '01:59:59' },
    { start: '02:00:00', end: '03:59:59' },
    { start: '04:00:00', end: '05:59:59' },
    { start: '06:00:00', end: '07:59:59' },
    { start: '08:00:00', end: '09:59:59' },
    { start: '10:00:00', end: '11:59:59' },
    { start: '12:00:00', end: '13:59:59' },
    { start: '14:00:00', end: '15:59:59' },
    { start: '16:00:00', end: '17:59:59' },
    { start: '18:00:00', end: '19:59:59' },
    { start: '20:00:00', end: '21:59:59' },
    { start: '22:00:00', end: '23:59:59' },
  ];

  const requests = timeRanges.map(({ start, end }) => {
    const startdate = `${reqYear}${reqMonth}${reqDate}T${start}`;
    const enddate = `${reqYear}${reqMonth}${reqDate}T${end}`;
    const requestUrl = `${URL}&startdate=${startdate}&enddate=${enddate}`;

    return getData(requestUrl);
  });

  try {
    const results = await Promise.allSettled(requests);

    const fulfilledResults = results.filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled').map((result) => result.value);

    // Lambda のレスポンスから配列データを抽出
    let allData: DataItem[] = [];
    for (const result of fulfilledResults) {
      if (result && typeof result === 'object') {
        // レスポンスが {dataid: [...]} 形式の場合
        const keys = Object.keys(result);
        if (keys.length > 0) {
          const dataArray = result[keys[0]];
          if (Array.isArray(dataArray)) {
            allData = allData.concat(dataArray);
          }
        }
      }
    }

    // timestamp が存在するアイテムのみをフィルタリング
    const concatData: DataItem[] = allData.filter((item) => item && item.timestamp);

    // タイムスタンプでソート
    concatData.sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;

      const dateA = new Date(a.timestamp.substring(0, 4) + '-' + a.timestamp.substring(4, 6) + '-' + a.timestamp.substring(6, 8) + 'T' + a.timestamp.substring(9, 11) + ':' + a.timestamp.substring(12, 14) + ':' + a.timestamp.substring(15, 17));
      const dateB = new Date(b.timestamp.substring(0, 4) + '-' + b.timestamp.substring(4, 6) + '-' + b.timestamp.substring(6, 8) + 'T' + b.timestamp.substring(9, 11) + ':' + b.timestamp.substring(12, 14) + ':' + b.timestamp.substring(15, 17));
      return dateA.getTime() - dateB.getTime();
    });

    return concatData;
  } catch (error) {
    console.error('Error during data fetch:', error);
    throw error;
  }
};
