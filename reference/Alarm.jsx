import React, { useState, useEffect, useMemo } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { fetchAuthSession } from 'aws-amplify/auth';
import CustomAlert from './CustomAlert';
import LoadingOverlay from './LoadingOverlay';
import { getData } from '../utils/GetData';
import AlarmDescriptions from './AlarmDescriptions';

function Alarm({signOut}) {

    const { locationId, packageType, slot, id } = useParams();
    const URL = '/alarmdata/locationid=' + locationId;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [updateClicked, setUpdateClicked] = useState(false);
    const [lastUpdateTime, setLastUpdateTime] = useState("--:--");
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        setData(null);
    }, [locationId, packageType, slot, id]);

    useEffect(() => {
        const currentTime = new Date().toLocaleTimeString();
        setLastUpdateTime(currentTime);
        checkUserAndFetchData();
        setUpdateClicked(false);
    }, [updateClicked, locationId, packageType, slot, id]);

    const checkUserAndFetchData = async () => {
        try {

            const session = await fetchAuthSession();

            try {
                setLoading(true);
                await fetchData(URL);
                setLoading(false);
            } catch {
                setAlertMessage('データ読み込みエラーが発生しました。');
                setShowAlert(true);
                setLoading(false);
            }

        } catch (error) {
            console.error("エラー");
            setAlertMessage('認証エラーが発生しました。再ログインしてください。');
            setShowAlert(true);
            signOut();
        }
    };

    const fetchData = async (URL) => {
        try {
            setLoading(true);
            let fetchedData = await getData(URL);
            setData(fetchedData[locationId]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleManualUpdate = () => {
        const currentTime = new Date().toLocaleTimeString();
        setLastUpdateTime(currentTime);
        setUpdateClicked(true);
    };

    const formatDateTime = (timestamp) => {
        const formattedTimestamp = timestamp.slice(0, 4) + '-' + timestamp.slice(4, 6) + '-' + timestamp.slice(6, 8) + 'T' + timestamp.slice(9, 17);
        const date = new Date(formattedTimestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        return `${year}年${month}月${day}日${hour}時${minute}分`;
    };


    const getAlarmDescription = (register,type) => {
        if(packageType != '99'){
            return AlarmDescriptions[packageType][slot][register];
        }else if(packageType == '99' & type == 'System'){
            return AlarmDescriptions[99][99][register];
        }else if(packageType=='99' & type == 'Cooler'){
            return AlarmDescriptions[99][98][register];
        }else{
            return null;
        }
    };

    const getPackageTypeLabel = (type) => {
        switch(type) {
            case '0':
                return 'unimoAW';
            case '1':
                return 'unimoWW';
            case '2':
                return 'unimoAWW';
            case '3':
                return 'エコシロッコ';
            case '4':
                return 'HG unimoAW';
            case '99':
                return 'システム盤'
            default:
                return type;
        }
    };

    const isAlarmActive = (alarm) => alarm.alarmclearedtimestamp === 'NA';

    const alarmCounts = useMemo(() => {
        if (!data || data.length === 0) {
            return { active: 0, cleared: 0, total: 0 };
        }
        const validAlarms = data.filter(alarm => getAlarmDescription(alarm.alarmregister, alarm.alarmtype));
        const activeCount = validAlarms.filter(alarm => isAlarmActive(alarm)).length;
        const clearedCount = validAlarms.filter(alarm => !isAlarmActive(alarm)).length;
        return {
            active: activeCount,
            cleared: clearedCount,
            total: validAlarms.length
        };
    }, [data]);

    const filteredData = useMemo(() => {
        if (!data) return [];
        return data.filter(alarm => {
            const description = getAlarmDescription(alarm.alarmregister, alarm.alarmtype);
            if (!description) return false;

            if (statusFilter === 'all') return true;
            if (statusFilter === 'active') return isAlarmActive(alarm);
            if (statusFilter === 'cleared') return !isAlarmActive(alarm);
            return true;
        });
    }, [data, statusFilter]);

    return(
        <div className="content_body content_body--alarm">
            <CustomAlert show={showAlert} message={alertMessage} onClose={() => setShowAlert(false)} />
            <LoadingOverlay show={loading} />
            <main className="alarm-main">
                <nav className="alarm-breadcrumb">
                    <NavLink to={`/dashboard/${locationId}`} className="alarm-breadcrumb__link">
                        <span className="material-symbols-outlined">arrow_back</span>
                        地点詳細
                    </NavLink>
                    <span className="alarm-breadcrumb__separator">/</span>
                    <span className="alarm-breadcrumb__current">警報履歴</span>
                </nav>

                <section className="alarm-info-section">
                    <div className="alarm-info-card">
                        <div className="alarm-info-card__header">
                            <div className="alarm-info-card__badges">
                                <span className="alarm-info-badge alarm-info-badge--location">
                                    <span className="material-symbols-outlined">location_on</span>
                                    {locationId}
                                </span>
                                <span className="alarm-info-badge alarm-info-badge--package">
                                    <span className="material-symbols-outlined">deployed_code</span>
                                    {getPackageTypeLabel(packageType)}
                                </span>
                                {id !== '99' && (
                                    <span className="alarm-info-badge alarm-info-badge--id">
                                        <span className="material-symbols-outlined">sell</span>
                                        {id}
                                    </span>
                                )}
                            </div>
                            <div className="alarm-info-card__update">
                                <span className="alarm-info-card__update__time">
                                    <span className="material-symbols-outlined">schedule</span>
                                    最終更新: {lastUpdateTime}
                                </span>
                                <button className="alarm-info-card__update__btn" onClick={handleManualUpdate}>
                                    <span className="material-symbols-outlined">refresh</span>
                                    更新
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="alarm-summary-section">
                    <div className="alarm-summary-cards">
                        <div className="alarm-summary-card alarm-summary-card--active">
                            <div className="alarm-summary-card__icon">
                                <span className="material-symbols-outlined">warning</span>
                            </div>
                            <div className="alarm-summary-card__content">
                                <span className="alarm-summary-card__value">{alarmCounts.active}</span>
                                <span className="alarm-summary-card__label">発生中の警報</span>
                            </div>
                        </div>
                        <div className="alarm-summary-card alarm-summary-card--cleared">
                            <div className="alarm-summary-card__icon">
                                <span className="material-symbols-outlined">check_circle</span>
                            </div>
                            <div className="alarm-summary-card__content">
                                <span className="alarm-summary-card__value">{alarmCounts.cleared}</span>
                                <span className="alarm-summary-card__label">解除済み警報</span>
                            </div>
                        </div>
                        <div className="alarm-summary-card alarm-summary-card--total">
                            <div className="alarm-summary-card__icon">
                                <span className="material-symbols-outlined">notifications</span>
                            </div>
                            <div className="alarm-summary-card__content">
                                <span className="alarm-summary-card__value">{alarmCounts.total}</span>
                                <span className="alarm-summary-card__label">全警報件数</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="alarm-list-section">
                    <div className="alarm-list-card">
                        <div className="alarm-list-card__header">
                            <h2 className="alarm-list-card__title">
                                <span className="material-symbols-outlined">history</span>
                                警報履歴
                            </h2>
                            <div className="alarm-list-card__filters">
                                <div className="alarm-filter-group">
                                    <label className="alarm-filter-group__label">表示フィルター</label>
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
                                                <th className="alarm-table__th">警報内容</th>
                                                <th className="alarm-table__th">設備タグ</th>
                                                <th className="alarm-table__th">発生日時</th>
                                                <th className="alarm-table__th">警報解除日時</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredData.map((alarm, index) => {
                                                const description = getAlarmDescription(alarm.alarmregister, alarm.alarmtype);
                                                const isActive = isAlarmActive(alarm);
                                                return (
                                                    <tr key={index} className={`alarm-table__row ${isActive ? 'alarm-table__row--active' : 'alarm-table__row--cleared'}`}>
                                                        <td className="alarm-table__td">
                                                            {isActive ? (
                                                                <span className="alarm-status alarm-status--active">
                                                                    <span className="alarm-status__dot"></span>
                                                                    発生中
                                                                </span>
                                                            ) : (
                                                                <span className="alarm-status alarm-status--cleared">
                                                                    <span className="material-symbols-outlined">check</span>
                                                                    解除済
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="alarm-table__td alarm-table__td--description">
                                                            <span className={`alarm-icon ${!isActive ? 'alarm-icon--cleared' : ''}`}>
                                                                <span className="material-symbols-outlined">
                                                                    {isActive ? 'error' : 'check_circle'}
                                                                </span>
                                                            </span>
                                                            {description}
                                                        </td>
                                                        <td className="alarm-table__td">{alarm.tagname}</td>
                                                        <td className="alarm-table__td alarm-table__td--time">{formatDateTime(alarm.alarmtimestamp)}</td>
                                                        <td className="alarm-table__td alarm-table__td--time">
                                                            {isActive ? '-' : formatDateTime(alarm.alarmclearedtimestamp)}
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
                                        <span className="material-symbols-outlined alarm-empty-state__icon">check_circle</span>
                                        <h3 className="alarm-empty-state__title">警報履歴がありません</h3>
                                        <p className="alarm-empty-state__description">現在、表示する警報履歴はありません。</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {filteredData.length > 0 && (
                            <div className="alarm-list-card__footer">
                                <span className="alarm-table-info">全 {filteredData.length} 件の警報履歴</span>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    )
}

export default Alarm;
