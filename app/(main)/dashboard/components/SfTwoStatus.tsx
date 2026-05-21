"use client";

import React, { useState, useEffect, useMemo } from "react";
import RefreshIcon from "@mui/icons-material/RefreshOutlined";
import ChartIcon from "@mui/icons-material/InsertChartOutlined";
import ReportIcon from "@mui/icons-material/SummarizeOutlined";
import Link from "next/link";
import Image from "next/image";
import { getData } from "@/utils/getData";
import { useRouter } from "next/navigation";
import { useError } from "@/context/ErrorContext";
import LoadingOverlay from "@/components/LoadingOverlay";
import sfzero from "@/images/sf-zero.png";

function SfTwoStatus() {
  const { setError } = useError();
  const router = useRouter();

  const URL = "/package-status-datas-sample-sfz?dataid=sf-zero-2";

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
      setData(response?.["sf-zero-2"]);
    } catch (error) {
      console.error("Error fetching system status data:", error);
      setError("データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const checkUserAndFetchData = async () => {
    try {
      const res = await fetch("/api/auth/protected-check", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Token expired or invalid");
      await fetchData(URL);
    } catch (error) {
      setError("認証または権限エラーが発生しました");
      router.push("/login");
    }
  };

  const systemStatus = useMemo(() => {
    if (!data) return { status: "stop", label: "停止中" };
    const alarmKeys = ["D6207", "D6208", "D6209", "D6210"];
    if (alarmKeys.some((key) => data[key] !== 0)) return { status: "alarm", label: "警報発令中" };
    if ((data.unit21Operation || 0) > 0) return { status: "run", label: "運転中" };
    return { status: "stop", label: "停止中" };
  }, [data]);

  const coolerOneStatus = useMemo(() => {
    if (!data) return { status: "stop", label: "停止中" };
    return (data.coolerFan301OperationOne || 0) > 0
      ? { status: "run", label: "運転中" }
      : { status: "stop", label: "停止中" };
  }, [data]);

  const coolerTwoStatus = useMemo(() => {
    if (!data) return { status: "stop", label: "停止中" };
    return (data.coolerFan401OperationTwo || 0) > 0
      ? { status: "run", label: "運転中" }
      : { status: "stop", label: "停止中" };
  }, [data]);

  return (
    <div className="room">
      <LoadingOverlay isLoading={loading} />

      {/* Floating actions */}
      <div className="room__actions">
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

      {/* System status hero */}
      <div className="room__hero">
        <div className={`status-hero status-hero--${systemStatus.status}`}>
          <span className="status-hero__dot" />
          <span className="status-hero__label">{systemStatus.label}</span>
          <span className="status-hero__name">SF-ZERO Sample</span>
        </div>

        <div className="metric-row">
          <div className="metric-card">
            <div className="metric-card__label">稼働時間</div>
            <div className="metric-card__value">{data?.unit21OpDay ?? "--"}<span>min/日</span></div>
          </div>
          <div className="metric-card">
            <div className="metric-card__label">外気温度</div>
            <div className="metric-card__value">{data?.D6028 ?? "--"}<span>℃</span></div>
          </div>
          <div className="metric-card">
            <div className="metric-card__label">庫内温度</div>
            <div className="metric-card__value">{data?.D6229 ?? "--"}<span>℃</span></div>
          </div>
          <div className="metric-card">
            <div className="metric-card__label">庫内湿度</div>
            <div className="metric-card__value">{data?.D6242 ?? "--"}<span>%</span></div>
          </div>
          <div className="metric-card">
            <div className="metric-card__label">冷凍機吸入過熱度</div>
            <div className="metric-card__value">{data?.D6256 ?? "--"}<span>℃</span></div>
          </div>
          <div className="metric-card">
            <div className="metric-card__label">冷凍機吸入温度</div>
            <div className="metric-card__value">{data?.D6226 ?? "--"}<span>℃</span></div>
          </div>
          <div className="metric-card">
            <div className="metric-card__label">冷凍機吸入圧力</div>
            <div className="metric-card__value">{data?.D6238 ?? "--"}<span>MPa</span></div>
          </div>
          <div className="metric-card">
            <div className="metric-card__label">給液温度</div>
            <div className="metric-card__value">{data?.D6227 ?? "--"}<span>℃</span></div>
          </div>
        </div>
      </div>

      {/* Cooler panels */}
      <div className="room__panels">
        {/* No.1 Cooler */}
        <div className="panel">
          <div className="panel__head">
            <div className={`status-badge status-badge--${coolerOneStatus.status}`}>
              <span className="status-badge__dot" />
              <span className="status-badge__text">No.1 — {coolerOneStatus.label}</span>
            </div>
            <div className="panel__image">
              <Image src={sfzero} alt="SF-ZERO No.1" />
            </div>
          </div>
          <div className="panel__grid">
            <div className="metric-card">
              <div className="metric-card__label">クーラー吸込温度</div>
              <div className="metric-card__value">{data?.D6221 ?? "--"}<span>℃</span></div>
            </div>
            <div className="metric-card">
              <div className="metric-card__label">クーラー吹出温度</div>
              <div className="metric-card__value">{data?.D6222 ?? "--"}<span>℃</span></div>
            </div>
            <div className="metric-card">
              <div className="metric-card__label">出口冷媒温度</div>
              <div className="metric-card__value">{data?.D6220 ?? "--"}<span>℃</span></div>
            </div>
            <div className="metric-card">
              <div className="metric-card__label">蒸発圧力</div>
              <div className="metric-card__value">{data?.D6236 ?? "--"}<span>MPa</span></div>
            </div>
            <div className="metric-card">
              <div className="metric-card__label">電子膨張弁開度</div>
              <div className="metric-card__value">{data?.D6244 ?? "--"}<span>%</span></div>
            </div>
            <div className="metric-card">
              <div className="metric-card__label">圧力調整弁開度</div>
              <div className="metric-card__value">{data?.D6245 ?? "--"}<span>%</span></div>
            </div>
            <div className="metric-card">
              <div className="metric-card__label">ファン電流値</div>
              <div className="metric-card__value">{data?.D6257 ?? "--"}<span>A</span></div>
            </div>
            <div className="metric-card">
              <div className="metric-card__label">ファン周波数</div>
              <div className="metric-card__value">{data?.D6258 ?? "--"}<span>Hz</span></div>
            </div>
          </div>
        </div>

        {/* No.2 Cooler */}
        <div className="panel">
          <div className="panel__head">
            <div className={`status-badge status-badge--${coolerTwoStatus.status}`}>
              <span className="status-badge__dot" />
              <span className="status-badge__text">No.2 — {coolerTwoStatus.label}</span>
            </div>
            <div className="panel__image">
              <Image src={sfzero} alt="SF-ZERO No.2" />
            </div>
          </div>
          <div className="panel__grid">
            <div className="metric-card">
              <div className="metric-card__label">クーラー吸込温度</div>
              <div className="metric-card__value">{data?.D6224 ?? "--"}<span>℃</span></div>
            </div>
            <div className="metric-card">
              <div className="metric-card__label">クーラー吹出温度</div>
              <div className="metric-card__value">{data?.D6225 ?? "--"}<span>℃</span></div>
            </div>
            <div className="metric-card">
              <div className="metric-card__label">出口冷媒温度</div>
              <div className="metric-card__value">{data?.D6223 ?? "--"}<span>℃</span></div>
            </div>
            <div className="metric-card">
              <div className="metric-card__label">蒸発圧力</div>
              <div className="metric-card__value">{data?.D6237 ?? "--"}<span>MPa</span></div>
            </div>
            <div className="metric-card">
              <div className="metric-card__label">電子膨張弁開度</div>
              <div className="metric-card__value">{data?.D6246 ?? "--"}<span>%</span></div>
            </div>
            <div className="metric-card">
              <div className="metric-card__label">圧力調整弁開度</div>
              <div className="metric-card__value">{data?.D6247 ?? "--"}<span>%</span></div>
            </div>
            <div className="metric-card">
              <div className="metric-card__label">ファン電流値</div>
              <div className="metric-card__value">{data?.D6259 ?? "--"}<span>A</span></div>
            </div>
            <div className="metric-card">
              <div className="metric-card__label">ファン周波数</div>
              <div className="metric-card__value">{data?.D6260 ?? "--"}<span>Hz</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SfTwoStatus;
