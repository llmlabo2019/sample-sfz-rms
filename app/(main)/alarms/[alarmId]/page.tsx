"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useError } from "@/context/ErrorContext";
import { useLoading } from "@/context/LoadingContext";
import { getData } from "@/utils/getData";
import AlarmDescriptions from "@/components/AlarmDescriptions";
import CustomInfo from "@/components/CustomInfo";
import RefreshIcon from "@mui/icons-material/RefreshOutlined";
import WarningIcon from "@mui/icons-material/WarningAmberOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlined";
import NotificationsIcon from "@mui/icons-material/NotificationsOutlined";
import HistoryIcon from "@mui/icons-material/HistoryOutlined";
import ErrorIcon from "@mui/icons-material/ErrorOutlined";

interface AlarmsProps {
  params: {
    alarmId: string;
  };
}

function Alarms({ params }: AlarmsProps) {
  const alarmId = params.alarmId;
  const DEVICENAME = "2444-1488-24";
  const URL = "/alarm-datas-sample-sfz?locationid=" + DEVICENAME;

  const { setError } = useError();
  const router = useRouter();
  const { setLoading } = useLoading();

  const [data, setData] = useState<any>(null);
  const [updateClicked, setUpdateClicked] = useState<boolean>(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("--:--");
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const currentTime = new Date().toLocaleTimeString();
    setLastUpdateTime(currentTime);
    checkUserAndFetchData();
    setUpdateClicked(false);
  }, [updateClicked, alarmId]);

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

  const fetchData = async (url: string) => {
    try {
      setLoading(true);
      const fetchedData = await getData(url);
      setData(fetchedData[DEVICENAME]);
    } catch (error) {
      console.error(error);
      setAlertMessage("データ読み込みエラーが発生しました。");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleManualUpdate = () => {
    const currentTime = new Date().toLocaleTimeString();
    setLastUpdateTime(currentTime);
    setUpdateClicked(true);
  };

  const formatDateTime = (timestamp: string) => {
    const formattedTimestamp =
      timestamp.slice(0, 4) +
      "-" +
      timestamp.slice(4, 6) +
      "-" +
      timestamp.slice(6, 8) +
      "T" +
      timestamp.slice(9, 17);
    const date = new Date(formattedTimestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `${year}年${month}月${day}日 ${hour}:${minute}`;
  };

  const getAlarmDescription = (register: string): string | null | undefined => {
    if (alarmId === "sf-zero-1") {
      return AlarmDescriptions[0][1][
        register as keyof (typeof AlarmDescriptions)[0][1]
      ];
    } else if (alarmId === "sf-zero-2") {
      return AlarmDescriptions[0][2][
        register as keyof (typeof AlarmDescriptions)[0][2]
      ];
    }
    return null;
  };

  const packageName =
    alarmId === "sf-zero-1"
      ? "SF-ZERO No.1庫"
      : alarmId === "sf-zero-2"
      ? "SF-ZERO Sample"
      : alarmId;

  const isAlarmActive = (alarm: any) => alarm.alarmclearedtimestamp === "NA";

  const alarmCounts = useMemo(() => {
    if (!data || data.length === 0) return { active: 0, cleared: 0, total: 0 };
    const validAlarms = data.filter((alarm: any) =>
      getAlarmDescription(alarm.alarmregister),
    );
    return {
      active: validAlarms.filter((a: any) => isAlarmActive(a)).length,
      cleared: validAlarms.filter((a: any) => !isAlarmActive(a)).length,
      total: validAlarms.length,
    };
  }, [data]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((alarm: any) => {
      if (!getAlarmDescription(alarm.alarmregister)) return false;
      if (statusFilter === "active") return isAlarmActive(alarm);
      if (statusFilter === "cleared") return !isAlarmActive(alarm);
      return true;
    });
  }, [data, statusFilter]);

  return (
    <div className="alarms-page">
      <CustomInfo
        show={showAlert}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />

      <main className="alarm-main">
        {/* 情報カード */}
        <section className="alarm-info-section">
          <div className="alarm-info-card">
            <div className="alarm-info-card__header">
              <div className="alarm-info-card__badges">
                <span className="alarm-info-badge alarm-info-badge--package">
                  {packageName}
                </span>
              </div>
              <div className="alarm-info-card__update">
                <span className="alarm-info-card__update__time">
                  最終更新: {lastUpdateTime}
                </span>
                <button
                  className="alarm-info-card__update__btn"
                  onClick={handleManualUpdate}
                >
                  <RefreshIcon />
                  更新
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* サマリーカード */}
        <section className="alarm-summary-section">
          <div className="alarm-summary-cards">
            <div className="alarm-summary-card alarm-summary-card--active">
              <div className="alarm-summary-card__icon">
                <WarningIcon />
              </div>
              <div className="alarm-summary-card__content">
                <span className="alarm-summary-card__value">
                  {alarmCounts.active}
                </span>
                <span className="alarm-summary-card__label">発生中の警報</span>
              </div>
            </div>
            <div className="alarm-summary-card alarm-summary-card--cleared">
              <div className="alarm-summary-card__icon">
                <CheckCircleIcon />
              </div>
              <div className="alarm-summary-card__content">
                <span className="alarm-summary-card__value">
                  {alarmCounts.cleared}
                </span>
                <span className="alarm-summary-card__label">解除済み警報</span>
              </div>
            </div>
            <div className="alarm-summary-card alarm-summary-card--total">
              <div className="alarm-summary-card__icon">
                <NotificationsIcon />
              </div>
              <div className="alarm-summary-card__content">
                <span className="alarm-summary-card__value">
                  {alarmCounts.total}
                </span>
                <span className="alarm-summary-card__label">全警報件数</span>
              </div>
            </div>
          </div>
        </section>

        {/* 警報リスト */}
        <section className="alarm-list-section">
          <div className="alarm-list-card">
            <div className="alarm-list-card__header">
              <h2 className="alarm-list-card__title">
                <HistoryIcon />
                警報履歴
              </h2>
              <div className="alarm-list-card__filters">
                <div className="alarm-filter-group">
                  <label className="alarm-filter-group__label">
                    表示フィルター
                  </label>
                  <select
                    className="alarm-filter-group__select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">すべて</option>
                    <option value="active">発生中のみ</option>
                    <option value="cleared">解除済みのみ</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="alarm-list-card__body">
              {filteredData.length > 0 ? (
                <div className="alarm-table-wrapper">
                  <table className="alarm-table">
                    <thead>
                      <tr>
                        <th className="alarm-table__th">ステータス</th>
                        <th className="alarm-table__th alarm-table__th--left">
                          警報内容
                        </th>
                        <th className="alarm-table__th">発生日時</th>
                        <th className="alarm-table__th">警報解除日時</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((alarm: any, index: number) => {
                        const description = getAlarmDescription(
                          alarm.alarmregister,
                        );
                        const isActive = isAlarmActive(alarm);
                        return (
                          <tr
                            key={index}
                            className={`alarm-table__row alarm-table__row--${
                              isActive ? "active" : "cleared"
                            }`}
                          >
                            <td className="alarm-table__td">
                              {isActive ? (
                                <span className="alarm-status alarm-status--active">
                                  <span className="alarm-status__dot" />
                                  発生中
                                </span>
                              ) : (
                                <span className="alarm-status alarm-status--cleared">
                                  <CheckCircleIcon />
                                  解除済
                                </span>
                              )}
                            </td>
                            <td className="alarm-table__td alarm-table__td--description">
                              <span
                                className={`alarm-icon${
                                  !isActive ? " alarm-icon--cleared" : ""
                                }`}
                              >
                                {isActive ? <ErrorIcon /> : <CheckCircleIcon />}
                              </span>
                              {description}
                            </td>
                            <td className="alarm-table__td alarm-table__td--time">
                              {formatDateTime(alarm.alarmtimestamp)}
                            </td>
                            <td className="alarm-table__td alarm-table__td--time">
                              {isActive
                                ? "—"
                                : formatDateTime(alarm.alarmclearedtimestamp)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="alarm-empty-state">
                  <div className="alarm-empty-state__content">
                    <CheckCircleIcon className="alarm-empty-state__icon" />
                    <h3 className="alarm-empty-state__title">
                      警報履歴がありません
                    </h3>
                    <p className="alarm-empty-state__description">
                      現在、表示する警報履歴はありません。
                    </p>
                  </div>
                </div>
              )}
            </div>

            {filteredData.length > 0 && (
              <div className="alarm-list-card__footer">
                <span className="alarm-table-info">
                  全 {filteredData.length} 件の警報履歴
                </span>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Alarms;
