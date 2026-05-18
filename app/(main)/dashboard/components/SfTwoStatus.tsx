'use client';

import React, { useState, useEffect, useMemo } from 'react';
import RefreshIcon from '@mui/icons-material/RefreshOutlined';
import ChartIcon from '@mui/icons-material/InsertChartOutlined';
import ReportIcon from '@mui/icons-material/SummarizeOutlined';
import Link from 'next/link';
import Image from 'next/image';
import { getData } from '@/utils/getData';
import { useRouter } from 'next/navigation';
import { useError } from '@/context/ErrorContext';
import LoadingOverlay from '@/components/LoadingOverlay';
import sfzero from '@/images/sf-zero.png';

function SfTwoStatus() {
  const { setError } = useError();
  const router = useRouter();

  const URL = '/package-status-datas-cpmc?dataid=sf-zero-2';

  const [data, setData] = useState<any>(null);
  const [updateClicked, setUpdateClicked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkUserAndFetchData();
    setUpdateClicked(false);
  }, [updateClicked]);

  const fetchData = async (url: string) => {
    try {
      setLoading(true);
      const response = await getData(url);
      setData(response?.['sf-zero-2']);
    } catch (error) {
      console.error('Error fetching system status data:', error);
      setError('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

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

  // システム稼働状態を計算
  const systemStatus = useMemo(() => {
    if (!data) return { status: 'stop', label: '停止中' };

    const alarmKeys = ['D6207', 'D6208', 'D6209', 'D6210'];

    const hasAlarm = alarmKeys.some((key) => data[key] !== 0);
    if (hasAlarm) {
      return { status: 'alarm', label: '警報発令中' };
    }

    const unitOperation = data.unit21Operation || 0;

    if (unitOperation > 0) {
      return { status: 'run', label: '運転中' };
    }

    return { status: 'stop', label: '停止中' };
  }, [data]);

  // クーラー1稼働状態を計算
  const coolerOneStatus = useMemo(() => {
    if (!data) return { status: 'stop', label: '停止中' };

    const coolerFan301OperationOne = data.coolerFan301OperationOne || 0;

    if (coolerFan301OperationOne > 0) {
      return { status: 'run', label: '運転中' };
    }

    return { status: 'stop', label: '停止中' };
  }, [data]);

  // クーラー2稼働状態を計算
  const coolerTwoStatus = useMemo(() => {
    if (!data) return { status: 'stop', label: '停止中' };

    const coolerFan401OperationTwo = data.coolerFan401OperationTwo || 0;

    if (coolerFan401OperationTwo > 0) {
      return { status: 'run', label: '運転中' };
    }

    return { status: 'stop', label: '停止中' };
  }, [data]);

  return (
    <div className="room">
      <LoadingOverlay isLoading={loading} />
      <div className="room__upper">
        <div className="room__upper__title">
          <p>SF-ZERO No.2庫</p>
        </div>
        <div className="room__upper__actions">
          <button onClick={() => setUpdateClicked(true)} title="再読み込み">
            <RefreshIcon />
          </button>
          <Link href="/datas/sf-zero-2" title="稼働データ">
            <ChartIcon />
          </Link>
          <Link href="/alarms/sf-zero-2" title="警報履歴">
            <ReportIcon />
          </Link>
        </div>
      </div>
      <div className="room__lower">
        {/* Left: system-level status */}
        <div className="room__lower__left">
          <div className={`inditem inditem--status${systemStatus.status === 'alarm' ? ' inditem--status--alarm' : systemStatus.status === 'stop' ? ' inditem--status--stop' : ''}`}>
            <div className="inditem__title">運転ステータス</div>
            <div className="inditem__body">{systemStatus.label}</div>
          </div>
          <div className="inditem-grid">
            <div className="inditem">
              <div className="inditem__title">稼働時間</div>
              <div className="inditem__body">
                {data?.unit21OpDay ?? '--'}
                <span>min/日</span>
              </div>
            </div>
            <div className="inditem">
              <div className="inditem__title">外気温度</div>
              <div className="inditem__body">
                {data?.D6028 ?? '--'}
                <span>℃</span>
              </div>
            </div>
            <div className="inditem">
              <div className="inditem__title">庫内温度</div>
              <div className="inditem__body">
                {data?.D6229 ?? '--'}
                <span>℃</span>
              </div>
            </div>
            <div className="inditem">
              <div className="inditem__title">庫内湿度</div>
              <div className="inditem__body">
                {data?.D6242 ?? '--'}
                <span>%</span>
              </div>
            </div>
            <div className="inditem">
              <div className="inditem__title">冷凍機吸入過熱度</div>
              <div className="inditem__body">
                {data?.D6256 ?? '--'}
                <span>℃</span>
              </div>
            </div>
            <div className="inditem">
              <div className="inditem__title">冷凍機吸入温度</div>
              <div className="inditem__body">
                {data?.D6226 ?? '--'}
                <span>℃</span>
              </div>
            </div>
            <div className="inditem">
              <div className="inditem__title">冷凍機吸入圧力</div>
              <div className="inditem__body">
                {data?.D6238 ?? '--'}
                <span>MPa</span>
              </div>
            </div>
            <div className="inditem">
              <div className="inditem__title">給液温度</div>
              <div className="inditem__body">
                {data?.D6227 ?? '--'}
                <span>℃</span>
              </div>
            </div>
          </div>
        </div>

        <div className="room__lower__right">
          <div className="package">
            <div className="package__left">
              <div className={`inditem inditem--status${coolerOneStatus.status === 'stop' ? ' inditem--status--stop' : ''}`}>
                <div className="inditem__title">MC301ステータス</div>
                <div className="inditem__body">{coolerOneStatus.label}</div>
              </div>
              <div className="indiimage">
                <Image src={sfzero} alt="Super-Flesh-zero-Img" />
              </div>
            </div>
            <div className="package__right">
              <div className="inditem">
                <div className="inditem__title">クーラー吸込温度</div>
                <div className="inditem__body">
                  {data?.D6221 ?? '--'}
                  <span>℃</span>
                </div>
              </div>
              <div className="inditem">
                <div className="inditem__title">クーラー吹出温度</div>
                <div className="inditem__body">
                  {data?.D6222 ?? '--'}
                  <span>℃</span>
                </div>
              </div>
              <div className="inditem">
                <div className="inditem__title">クーラー出口冷媒温度</div>
                <div className="inditem__body">
                  {data?.D6220 ?? '--'}
                  <span>℃</span>
                </div>
              </div>
              <div className="inditem">
                <div className="inditem__title">蒸発圧力</div>
                <div className="inditem__body">
                  {data?.D6236 ?? '--'}
                  <span>MPa</span>
                </div>
              </div>
              <div className="inditem">
                <div className="inditem__title">電子膨張弁開度</div>
                <div className="inditem__body">
                  {data?.D6244 ?? '--'}
                  <span>%</span>
                </div>
              </div>
              <div className="inditem">
                <div className="inditem__title">圧力調整弁開度</div>
                <div className="inditem__body">
                  {data?.D6245 ?? '--'}
                  <span>%</span>
                </div>
              </div>
              <div className="inditem">
                <div className="inditem__title">クーラーファン電流値</div>
                <div className="inditem__body">
                  {data?.D6257 ?? '--'}
                  <span>A</span>
                </div>
              </div>
              <div className="inditem">
                <div className="inditem__title">クーラーファン周波数</div>
                <div className="inditem__body">
                  {data?.D6258 ?? '--'}
                  <span>Hz</span>
                </div>
              </div>
            </div>
          </div>

          <div className="package">
            <div className="package__left">
              <div className={`inditem inditem--status${coolerTwoStatus.status === 'stop' ? ' inditem--status--stop' : ''}`}>
                <div className="inditem__title">MC401ステータス</div>
                <div className="inditem__body">{coolerTwoStatus.label}</div>
              </div>
              <div className="indiimage">
                <Image src={sfzero} alt="Super-Flesh-zero-Img" />
              </div>
            </div>
            <div className="package__right">
              <div className="inditem">
                <div className="inditem__title">クーラー吸込温度</div>
                <div className="inditem__body">
                  {data?.D6224 ?? '--'}
                  <span>℃</span>
                </div>
              </div>
              <div className="inditem">
                <div className="inditem__title">クーラー吹出温度</div>
                <div className="inditem__body">
                  {data?.D6225 ?? '--'}
                  <span>℃</span>
                </div>
              </div>
              <div className="inditem">
                <div className="inditem__title">クーラー出口冷媒温度</div>
                <div className="inditem__body">
                  {data?.D6223 ?? '--'}
                  <span>℃</span>
                </div>
              </div>
              <div className="inditem">
                <div className="inditem__title">蒸発圧力</div>
                <div className="inditem__body">
                  {data?.D6237 ?? '--'}
                  <span>MPa</span>
                </div>
              </div>
              <div className="inditem">
                <div className="inditem__title">電子膨張弁開度</div>
                <div className="inditem__body">
                  {data?.D6246 ?? '--'}
                  <span>%</span>
                </div>
              </div>
              <div className="inditem">
                <div className="inditem__title">圧力調整弁開度</div>
                <div className="inditem__body">
                  {data?.D6247 ?? '--'}
                  <span>%</span>
                </div>
              </div>
              <div className="inditem">
                <div className="inditem__title">クーラーファン電流値</div>
                <div className="inditem__body">
                  {data?.D6259 ?? '--'}
                  <span>A</span>
                </div>
              </div>
              <div className="inditem">
                <div className="inditem__title">クーラーファン周波数</div>
                <div className="inditem__body">
                  {data?.D6260 ?? '--'}
                  <span>Hz</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SfTwoStatus;
