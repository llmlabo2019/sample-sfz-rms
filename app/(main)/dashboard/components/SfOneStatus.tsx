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

function SfOneStatus() {
  const { setError } = useError();
  const router = useRouter();

  const URL = '/package-status-datas-cpmc?dataid=sf-zero-1';

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
      setData(response?.['sf-zero-1']);
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

    const alarmKeys = ['D6007', 'D6008', 'D6009', 'D6010'];

    const hasAlarm = alarmKeys.some((key) => data[key] !== 0);
    if (hasAlarm) {
      return { status: 'alarm', label: '警報発令中' };
    }

    const unitOperation = data.unit11Operation || 0;

    if (unitOperation > 0) {
      return { status: 'run', label: '運転中' };
    }

    return { status: 'stop', label: '停止中' };
  }, [data]);

  // クーラー1稼働状態を計算
  const coolerOneStatus = useMemo(() => {
    if (!data) return { status: 'stop', label: '停止中' };

    const coolerFan101OperationOne = data.coolerFan101OperationOne || 0;

    if (coolerFan101OperationOne > 0) {
      return { status: 'run', label: '運転中' };
    }

    return { status: 'stop', label: '停止中' };
  }, [data]);

  // クーラー2稼働状態を計算
  const coolerTwoStatus = useMemo(() => {
    if (!data) return { status: 'stop', label: '停止中' };

    const coolerFan201OperationTwo = data.coolerFan201OperationTwo || 0;

    if (coolerFan201OperationTwo > 0) {
      return { status: 'run', label: '運転中' };
    }

    return { status: 'stop', label: '停止中' };
  }, [data]);

  return (
    <div className="room">
      <LoadingOverlay isLoading={loading} />
      <div className="room__upper">
        <div className="room__upper__title">
          <p>SF-ZERO No.1庫</p>
        </div>
        <div className="room__upper__actions">
          <button onClick={() => setUpdateClicked(true)} title="再読み込み">
            <RefreshIcon />
          </button>
          <Link href="/datas/sf-zero-1" title="稼働データ">
            <ChartIcon />
          </Link>
          <Link href="/alarms/sf-zero-1" title="警報履歴">
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
                {data?.unit11OpDay ?? '--'}
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
                {data?.D6029 ?? '--'}
                <span>℃</span>
              </div>
            </div>
            <div className="inditem">
              <div className="inditem__title">庫内湿度</div>
              <div className="inditem__body">
                {data?.D6042 ?? '--'}
                <span>%</span>
              </div>
            </div>
            <div className="inditem">
              <div className="inditem__title">冷凍機吸入過熱度</div>
              <div className="inditem__body">
                {data?.D6056 ?? '--'}
                <span>℃</span>
              </div>
            </div>
            <div className="inditem">
              <div className="inditem__title">冷凍機吸入温度</div>
              <div className="inditem__body">
                {data?.D6026 ?? '--'}
                <span>℃</span>
              </div>
            </div>
            <div className="inditem">
              <div className="inditem__title">冷凍機吸入圧力</div>
              <div className="inditem__body">
                {data?.D6038 ?? '--'}
                <span>MPa</span>
              </div>
            </div>
            <div className="inditem">
              <div className="inditem__title">給液温度</div>
              <div className="inditem__body">
                {data?.D6027 ?? '--'}
                <span>℃</span>
              </div>
            </div>
          </div>
        </div>

        <div className="room__lower__right">
          <div className="package">
            <div className="package__left">
              <div className={`inditem inditem--status${coolerOneStatus.status === 'stop' ? ' inditem--status--stop' : ''}`}>
                <div className="inditem__title">MC101ステータス</div>
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
                  {data?.D6021 ?? '--'}
                  <span>℃</span>
                </div>
              </div>
              <div className="inditem">
                <div className="inditem__title">クーラー吹出温度</div>
                <div className="inditem__body">
                  {data?.D6022 ?? '--'}
                  <span>℃</span>
                </div>
              </div>
              <div className="inditem">
                <div className="inditem__title">クーラー出口冷媒温度</div>
                <div className="inditem__body">
                  {data?.D6020 ?? '--'}
                  <span>℃</span>
                </div>
              </div>
              <div className="inditem">
                <div className="inditem__title">蒸発圧力</div>
                <div className="inditem__body">
                  {data?.D6036 ?? '--'}
                  <span>MPa</span>
                </div>
              </div>
              <div className="inditem">
                <div className="inditem__title">電子膨張弁開度</div>
                <div className="inditem__body">
                  {data?.D6044 ?? '--'}
                  <span>%</span>
                </div>
              </div>
              <div className="inditem">
                <div className="inditem__title">圧力調整弁開度</div>
                <div className="inditem__body">
                  {data?.D6045 ?? '--'}
                  <span>%</span>
                </div>
              </div>
              <div className="inditem">
                <div className="inditem__title">クーラーファン電流値</div>
                <div className="inditem__body">
                  {data?.D6057 ?? '--'}
                  <span>A</span>
                </div>
              </div>
              <div className="inditem">
                <div className="inditem__title">クーラーファン周波数</div>
                <div className="inditem__body">
                  {data?.D6058 ?? '--'}
                  <span>Hz</span>
                </div>
              </div>
            </div>
          </div>

          <div className="package">
            <div className="package__left">
              <div className={`inditem inditem--status${coolerTwoStatus.status === 'stop' ? ' inditem--status--stop' : ''}`}>
                <div className="inditem__title">MC201ステータス</div>
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
                  {data?.D6024 ?? '--'}
                  <span>℃</span>
                </div>
              </div>
              <div className="inditem">
                <div className="inditem__title">クーラー吹出温度</div>
                <div className="inditem__body">
                  {data?.D6025 ?? '--'}
                  <span>℃</span>
                </div>
              </div>
              <div className="inditem">
                <div className="inditem__title">クーラー出口冷媒温度</div>
                <div className="inditem__body">
                  {data?.D6023 ?? '--'}
                  <span>℃</span>
                </div>
              </div>
              <div className="inditem">
                <div className="inditem__title">蒸発圧力</div>
                <div className="inditem__body">
                  {data?.D6037 ?? '--'}
                  <span>MPa</span>
                </div>
              </div>
              <div className="inditem">
                <div className="inditem__title">電子膨張弁開度</div>
                <div className="inditem__body">
                  {data?.D6046 ?? '--'}
                  <span>%</span>
                </div>
              </div>
              <div className="inditem">
                <div className="inditem__title">圧力調整弁開度</div>
                <div className="inditem__body">
                  {data?.D6047 ?? '--'}
                  <span>%</span>
                </div>
              </div>
              <div className="inditem">
                <div className="inditem__title">クーラーファン電流値</div>
                <div className="inditem__body">
                  {data?.D6059 ?? '--'}
                  <span>A</span>
                </div>
              </div>
              <div className="inditem">
                <div className="inditem__title">クーラーファン周波数</div>
                <div className="inditem__body">
                  {data?.D6060 ?? '--'}
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

export default SfOneStatus;
