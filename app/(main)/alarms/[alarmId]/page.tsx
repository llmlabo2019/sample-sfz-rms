'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useError } from '@/context/ErrorContext';
import { useLoading } from '@/context/LoadingContext';
import { getData } from '@/utils/getData';
import AlarmDescriptions from '@/components/AlarmDescriptions';
import CustomInfo from '@/components/CustomInfo';
import RefreshIcon from '@mui/icons-material/RefreshOutlined';

interface DatasProps {
  params: {
    alarmId: string;
  };
}

function Alarms({ params }: DatasProps) {
  const alarmId = params.alarmId;
  const DEVICENAME = '2444-1488-24';
  const URL = '/alarm-datas-cpmc?locationid=' + DEVICENAME;

  const { setError } = useError();
  const router = useRouter();
  const { setLoading } = useLoading();

  const [data, setData] = useState<any>(null);
  const [updateClicked, setUpdateClicked] = useState<boolean>(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('--:--');
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');

  useEffect(() => {
    const currentTime = new Date().toLocaleTimeString();
    setLastUpdateTime(currentTime);
    checkUserAndFetchData();
    setUpdateClicked(false);
  }, [updateClicked, alarmId]);

  const checkUserAndFetchData = async () => {
    try {
      const res = await fetch('/api/auth/protected-check', {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Token expired or invalid');
      } else {
        await fetchData(URL);
      }
    } catch (error) {
      setError('認証または権限エラーが発生しました');
      router.push('/login');
    }
  };

  const fetchData = async (URL: string) => {
    try {
      setLoading(true);
      let fetchedData = await getData(URL);
      setData(fetchedData[DEVICENAME]);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleManualUpdate = () => {
    const currentTime = new Date().toLocaleTimeString();
    setLastUpdateTime(currentTime);
    setUpdateClicked(true);
  };

  const formatDateTime = (timestamp: string) => {
    const formattedTimestamp = timestamp.slice(0, 4) + '-' + timestamp.slice(4, 6) + '-' + timestamp.slice(6, 8) + 'T' + timestamp.slice(9, 17);
    const date = new Date(formattedTimestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}年${month}月${day}日${hour}時${minute}分`;
  };

  const getAlarmDescription = (register: string): string | null | undefined => {
    if (alarmId == 'sf-zero-1') {
      return AlarmDescriptions[0][1][register as keyof (typeof AlarmDescriptions)[0][1]];
    } else if (alarmId == 'sf-zero-2') {
      return AlarmDescriptions[0][2][register as keyof (typeof AlarmDescriptions)[0][2]];
    } else {
      return null;
    }
  };

  const getPackageTypeLabel = (type: string) => {
    switch (type) {
      case 'SF-zero-1':
        return 'SF-ZERO No.1庫';
      case 'SF-zero-2':
        return 'SF-ZERO No.2庫';
      default:
        return type;
    }
  };

  return (
    <div className="datas">
      <CustomInfo show={showAlert} message={alertMessage} onClose={() => setShowAlert(false)} />
      <div className="alarmhistory">
        <div className="alarmhistory__wrapper">
          <div className="update__wrapper">
            <p>最終更新 : {lastUpdateTime}</p>
            <div className="update__wrapper__button" onClick={handleManualUpdate}>
              <span>
                <RefreshIcon style={{ fontSize: '3rem' }} />
              </span>
            </div>
          </div>
          <div className="alarmhistory__wrapper__contents">
            <div className="alarmhistory__wrapper__contents__content">
              <div className="alarmhistory__wrapper__contents__content__topmenu">
                <div className="alarmhistory__wrapper__contents__content__topmenu__title">
                  <div className="analytics__inner__head__left__status"></div>
                </div>
              </div>
              <div className="alarms">
                <div className="alarms__body">
                  <table>
                    <tbody id="alarm_list">
                      <tr>
                        <th>警報内容</th>
                        <th>設備タグ</th>
                        <th>発生日時</th>
                        <th>警報解除日時</th>
                      </tr>
                      {data && data.length > 0 ? (
                        data.map((alarm: any, index: number) => {
                          const description = getAlarmDescription(alarm.alarmregister);
                          if (!description) return null;
                          return (
                            <tr key={index}>
                              <td>{description}</td>
                              <td>{alarm.tagname}</td>
                              <td>{formatDateTime(alarm.alarmtimestamp)}</td>
                              <td>{alarm.alarmclearedtimestamp !== 'NA' ? formatDateTime(alarm.alarmclearedtimestamp) : ''}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={3}>データが見つかりません。</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Alarms;
