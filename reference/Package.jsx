import React, { useState, useEffect } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { useParams, NavLink } from "react-router-dom";
import { fetchAuthSession } from 'aws-amplify/auth';
import ja from "date-fns/locale/ja";
import "react-datepicker/dist/react-datepicker.css";
import { saveAs } from "file-saver";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import CustomAlert from "./CustomAlert";
import LoadingOverlay from "./LoadingOverlay";
import { fetchOneDayData } from "../utils/FechOneDayData";
import iconv from "iconv-lite";
import * as Encoding from "encoding-japanese";
import { useDarkMode } from "../contexts/DarkModeContext";
import { COLOR_CLASSES, getColorCodes } from "../constants/colorConstants";
import { PACKAGE_CONFIG } from "../constants/packageConfig";

iconv.encodingExists("shift_jis");

function Package({ signOut }) {
  const { isDarkMode } = useDarkMode();

  // Use imported constants
  const color_class = COLOR_CLASSES;
  const color_codes = getColorCodes(isDarkMode);

  //Get Data URL
  const { locationId, packageType, slot, id } = useParams();
  const URL =
    "/packagedata/locationid=" +
    locationId +
    "&packagetype=" +
    packageType +
    "&slot=" +
    slot;

  // Get configuration based on packageType and slot
  const config = PACKAGE_CONFIG[packageType]?.slots[slot] || {};
  const packageConfig = PACKAGE_CONFIG[packageType] || {};

  const default_graph = config.default_graph || [];
  const desiredColumns = config.desiredColumns || [];
  const allGraph = config.allGraph || {};
  const title_text = packageConfig.title || "";
  const packageName = packageConfig.name || "unimoAW";

  //Data Elements
  const [data, setData] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [csvData, setCsvData] = useState(null);

  //Elements for Datepicker
  const Today = new Date();
  const [date, setDate] = useState(Today);
  registerLocale("ja", ja);

  //Elements for pagination
  const [dataNum, setDataNum] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = parseInt(dataNum, 10);
  const [totalPages, setTotalPages] = useState(1);
  const [dataDual, setDataDual] = useState(1);

  //loading elements
  const [loading, setLoading] = useState(false);

  //Graph element
  const [selectedItems, setSelectedItems] = useState(default_graph);
  const [showCheckBox, setShowCheckBox] = useState(false);
  const [dataColors, setDataColors] = useState({});

  //Other Elements
  const [updateClicked, setUpdateClicked] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    setSelectedItems(default_graph);
    setData(null);
    setGraphData(null);
    setCsvData(null);
  }, [locationId, packageType, slot, id]);

  useEffect(() => {
    checkUserAndFetchData();
    setUpdateClicked(false);
  }, [date, updateClicked, locationId, packageType, slot, id]);

  useEffect(() => {
    setCurrentPage(1);
    if (data) {
      const pages = Math.ceil(data.length / itemsPerPage);
      setTotalPages(pages);
    }
  }, [data, graphData, itemsPerPage]);

  useEffect(() => {
    const updatedDataColors = {};
    const allGraphKeys = Object.keys(allGraph);
    selectedItems.forEach((item) => {
      const originalIndex = allGraphKeys.indexOf(item);
      updatedDataColors[item] = color_codes[originalIndex % color_codes.length];
    });
    setDataColors(updatedDataColors);
  }, [selectedItems]);

  const checkUserAndFetchData = async () => {
    try {
      const session = await fetchAuthSession();

      try {
        setLoading(true);
        await fetchData(date);
        setLoading(false);
      } catch (fetchError) {
        setAlertMessage("データ読み込みエラーが発生しました。");
        setShowAlert(true);
        setLoading(false);
      }
    } catch (error) {
      console.error("エラー");
      setAlertMessage("認証エラーが発生しました。再ログインしてください。");
      setShowAlert(true);
      signOut();
    }
  };

  const fetchData = async (selectedDate) => {
    try {
      setLoading(true);

      let fetchedData = await fetchOneDayData(selectedDate, URL, locationId);

      sessionStorage.setItem("result", JSON.stringify(fetchedData));
      let resultData = sessionStorage.getItem("result");
      let resultDataJson = JSON.parse(resultData);
      let resultDataLen = resultDataJson.length;
      let resultDataArray = [];
      let resultCsvDataArray = [];
      let resultGraphArray = [];

      // オリジナルのタイムスタンプを保存する配列
      let originalTimestamps = resultDataJson.map(
        (dataItem) => dataItem.timestamp,
      );

      // タイムスタンプを hh:mm:ss 形式に変換する処理
      for (let i = 0; i < resultDataLen; i++) {
        let dataPosition = i * dataDual;
        if (resultDataLen - 1 < dataPosition) {
          break;
        }
        let dataItem = resultDataJson[dataPosition];

        // タイムスタンプを hh:mm:ss 形式に変換
        if (dataItem && dataItem.timestamp) {
          dataItem.timestamp = dataItem.timestamp.substring(9, 19);
        }

        resultDataArray.push(dataItem);
      }

      // resultCsvDataArrayにオリジナルのタイムスタンプを使用する処理
      for (let i = 0; i < resultDataLen; i++) {
        let dataPosition = i * dataDual;
        if (resultDataLen - 1 < dataPosition) {
          break;
        }

        let dataItem = resultDataJson[dataPosition];

        if (dataItem) {
          let selectedData = {};

          desiredColumns.forEach((columnName) => {
            selectedData[columnName] = dataItem[columnName];
          });

          // タイムスタンプをオリジナルの形式で保持
          if (originalTimestamps[dataPosition]) {
            selectedData.timestamp = originalTimestamps[dataPosition];
          }

          resultCsvDataArray.push(selectedData);
        }
      }

      let resultCsvJson = JSON.parse(JSON.stringify(resultCsvDataArray));

      // グラフデータを処理
      for (let i = 1; i < resultDataLen; i++) {
        let obj = resultDataJson[i];
        let timestamp = resultDataJson[i]["timestamp"];
        let timeParts = timestamp.split(":");
        let hours = timeParts[0].padStart(2, "0");
        let minutes = timeParts[1].padStart(2, "0");
        obj.time = `${hours}:${minutes}`;
        resultGraphArray.push(resultDataJson[i]);
      }

      setData(resultDataArray);
      setGraphData(resultGraphArray);
      setCsvData(resultCsvJson);

      setLoading(false);
      setUpdateClicked(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setAlertMessage("データ読み込みエラーが発生しました。");
      setShowAlert(true);
      setUpdateClicked(false);
    }
  };

  //Pagination of table

  const handleDataDualChange = (e) => {
    const newDataDual = e.target.value;
    setDataDual(newDataDual);
    dataDualChange(newDataDual);
  };

  const dataDualChange = (newDataDual) => {
    let resultData = sessionStorage.getItem("result");
    let resultDataJson = JSON.parse(resultData);
    let resultDataLen = resultDataJson.length;
    let resultDataArray = [];
    for (let i = 0; i < resultDataLen; i++) {
      let dataPosition = i * newDataDual;
      if (resultDataLen - 1 < dataPosition) {
        break;
      }
      let dataItem = { ...resultDataJson[dataPosition] };
      // タイムスタンプを hh:mm:ss 形式に変換
      if (dataItem && dataItem.timestamp) {
        dataItem.timestamp = dataItem.timestamp.substring(9, 19);
      }
      resultDataArray.push(dataItem);
    }
    setData(resultDataArray);
  };

  const handleDataNumChange = (e) => {
    setDataNum(e.target.value);
  };

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  const getPaginatedData = () => {
    if (!data || !Array.isArray(data)) {
      return [];
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const renderPaginationButtons = () => {
    const pageButtons = [];
    const maxPageButtons = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    // 最初のページが1より大きい場合、省略記号を表示
    if (startPage > 1) {
      pageButtons.push(
        <button
          key={1}
          className="package-pagination__page"
          onClick={() => handlePageChange(1)}
        >
          1
        </button>,
      );
      if (startPage > 2) {
        pageButtons.push(
          <span key="ellipsis-start" className="package-pagination__ellipsis">
            ...
          </span>,
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <button
          key={i}
          className={`package-pagination__page ${currentPage === i ? "package-pagination__page--active" : ""}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>,
      );
    }

    // 最後のページがtotalPagesより小さい場合、省略記号を表示
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageButtons.push(
          <span key="ellipsis-end" className="package-pagination__ellipsis">
            ...
          </span>,
        );
      }
      pageButtons.push(
        <button
          key={totalPages}
          className="package-pagination__page"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>,
      );
    }

    return pageButtons;
  };

  const handleExportCSV = () => {
    const resultCsvData = csvData.map((item) => {
      const values = Object.values(item);
      return values.slice(0, values.length).join(",");
    });

    const csvString = title_text + resultCsvData.join("\n");
    const sjisArray = Encoding.convert(Encoding.stringToCode(csvString), {
      from: "UNICODE",
      to: "SJIS",
      type: "array",
    });
    const blob = new Blob([new Uint8Array(sjisArray)], {
      type: "text/csv;charset=shift_jis",
    });
    saveAs(blob, "package_data.csv");
  };

  const getTitleArray = () => {
    return title_text
      .split(",")
      .map((title) => title.trim())
      .filter(Boolean);
  };

  //Graph

  const handleSelectAll = () => {
    setSelectedItems(Object.keys(allGraph));
  };

  const handleDeselectAll = () => {
    setSelectedItems([]);
  };

  const customLabelFormatter = (label) => {
    const labelMappings = allGraph;

    return labelMappings[label] || label;
  };

  const handleCheckboxChange = (item) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(
        selectedItems.filter((selectedItem) => selectedItem !== item),
      );
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload) {
      return (
        <div className="custom-tooltip">
          <p>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {customLabelFormatter(entry.dataKey)}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleShowCheckBox = () => {
    setShowCheckBox(!showCheckBox);
  };

  const renderGraph = () => {
    if (!graphData || !Array.isArray(graphData)) {
      return [];
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          width={500}
          height={600}
          data={graphData}
          zindex={5}
          margin={{
            top: 5,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" interval={300} tick={{ fontSize: 16 }} />
          <YAxis tick={{ fontSize: 16 }} />
          <Tooltip content={<CustomTooltip />} />
          {selectedItems.map((item) => (
            <Line
              key={item}
              type="monotone"
              dataKey={item}
              stroke={dataColors[item]}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  //Manual update

  const handleManualUpdate = (e) => {
    setUpdateClicked(true);
  };

  const renderNewCheckboxes = () => {
    return (
      <div className="package-chart-selector__grid">
        {Object.keys(allGraph).map((item, index) => (
          <label
            key={item}
            className="package-chart-selector__item"
            style={{ "--item-color": color_codes[index % color_codes.length] }}
          >
            <input
              type="checkbox"
              checked={selectedItems.includes(item)}
              onChange={() => handleCheckboxChange(item)}
            />
            <span className="package-chart-selector__checkbox"></span>
            <span className="package-chart-selector__label">
              {allGraph[item]}
            </span>
          </label>
        ))}
      </div>
    );
  };

  return (
    <div className="content_body content_body--package">
      <CustomAlert
        show={showAlert}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />
      <LoadingOverlay show={loading} />

      <div className="package-main">
        {/* パンくずリスト */}
        <nav className="package-breadcrumb">
          <NavLink
            to={`/dashboard/${locationId}`}
            className="package-breadcrumb__link"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            地点詳細
          </NavLink>
          <span className="package-breadcrumb__separator">/</span>
          <span className="package-breadcrumb__current">パッケージデータ</span>
        </nav>

        {/* 情報カード */}
        <section className="package-info-section">
          <div className="package-info-card">
            <div className="package-info-card__header">
              <div className="package-info-card__badges">
                <span className="package-info-badge package-info-badge--location">
                  <span className="material-symbols-outlined">location_on</span>
                  {locationId}
                </span>
                <span className="package-info-badge package-info-badge--package">
                  <span className="material-symbols-outlined">
                    deployed_code
                  </span>
                  {packageName}
                </span>
                <span className="package-info-badge package-info-badge--id">
                  <span className="material-symbols-outlined">sell</span>
                  {id}
                </span>
              </div>
              <div className="package-info-card__date">
                <label className="package-info-card__date__label">
                  <span className="material-symbols-outlined">
                    calendar_month
                  </span>
                  表示日
                </label>
                <DatePicker
                  dateFormat="yyyy年MM月dd日"
                  selected={date}
                  locale="ja"
                  id="datepicker"
                  className="package-info-card__date__input"
                  onChange={(selectedDate) => {
                    setDate(selectedDate || Today);
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* グラフカード */}
        <section className="package-chart-section">
          <div className="package-chart-card">
            <div className="package-chart-card__header">
              <h2 className="package-chart-card__title">
                <span className="material-symbols-outlined">show_chart</span>
                運転データグラフ
              </h2>
              <div className="package-chart-card__controls">
                <button
                  className={`package-chart-card__toggle ${showCheckBox ? "active" : ""}`}
                  onClick={handleShowCheckBox}
                >
                  <span className="material-symbols-outlined">tune</span>
                  表示項目を選択
                  <span className="material-symbols-outlined package-chart-card__toggle__arrow">
                    expand_more
                  </span>
                </button>
              </div>
            </div>

            {/* グラフ項目選択パネル */}
            <div
              className={`package-chart-selector ${showCheckBox ? "active" : ""}`}
            >
              <div className="package-chart-selector__header">
                <span className="package-chart-selector__title">
                  表示する項目を選択
                </span>
                <div className="package-chart-selector__actions">
                  <button
                    className="package-chart-selector__btn"
                    onClick={handleSelectAll}
                  >
                    <span className="material-symbols-outlined">
                      select_all
                    </span>
                    すべて選択
                  </button>
                  <button
                    className="package-chart-selector__btn"
                    onClick={handleDeselectAll}
                  >
                    <span className="material-symbols-outlined">deselect</span>
                    選択解除
                  </button>
                </div>
              </div>
              {renderNewCheckboxes()}
            </div>

            {/* グラフ表示エリア */}
            <div className="package-chart-card__body">
              <div style={{ width: "100%", height: "50rem" }}>
                {renderGraph()}
              </div>
            </div>
          </div>
        </section>

        {/* テーブルカード */}
        <section className="package-table-section">
          <div className="package-table-card">
            <div className="package-table-card__header">
              <h2 className="package-table-card__title">
                <span className="material-symbols-outlined">table_chart</span>
                運転データ一覧
              </h2>
            </div>

            {/* テーブルコントロール */}
            <div className="package-table-controls">
              <div className="package-table-controls__left">
                <div className="package-table-control">
                  <label className="package-table-control__label">
                    表示件数
                  </label>
                  <select
                    className="package-table-control__select"
                    value={dataNum}
                    onChange={handleDataNumChange}
                  >
                    <option value="50">50件</option>
                    <option value="100">100件</option>
                    <option value="200">200件</option>
                  </select>
                </div>
                <div className="package-table-control">
                  <label className="package-table-control__label">
                    表示間隔
                  </label>
                  <select
                    className="package-table-control__select"
                    value={dataDual}
                    onChange={handleDataDualChange}
                  >
                    <option value="1">1分</option>
                    <option value="10">10分</option>
                    <option value="30">30分</option>
                    <option value="60">60分</option>
                  </select>
                </div>
                <button
                  className="package-table-btn package-table-btn--secondary"
                  onClick={handleExportCSV}
                >
                  <span className="material-symbols-outlined">download</span>
                  CSV出力
                </button>
                <button
                  className="package-table-btn package-table-btn--icon"
                  onClick={handleManualUpdate}
                  title="更新"
                >
                  <span className="material-symbols-outlined">refresh</span>
                </button>
              </div>
              <div className="package-table-controls__right">
                <div className="package-pagination">
                  <button
                    className="package-pagination__btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <span className="material-symbols-outlined">
                      chevron_left
                    </span>
                    前へ
                  </button>
                  <div className="package-pagination__pages">
                    {renderPaginationButtons()}
                  </div>
                  <button
                    className="package-pagination__btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    次へ
                    <span className="material-symbols-outlined">
                      chevron_right
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* データテーブル */}
            <div className="package-table-card__body">
              <div className="package-data-table-wrapper">
                <table className="package-data-table">
                  <thead>
                    <tr>
                      {getTitleArray().map((titleName, index) => (
                        <th
                          key={index}
                          className={`package-data-table__th ${index === 0 ? "package-data-table__th--sticky" : ""}`}
                        >
                          {titleName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {getPaginatedData().length > 0 ? (
                      getPaginatedData().map((item, rowIndex) => (
                        <tr key={rowIndex} className="package-data-table__row">
                          {desiredColumns.map((columnName, colIndex) => (
                            <td
                              key={columnName}
                              className={`package-data-table__td ${colIndex === 0 ? "package-data-table__td--time" : ""}`}
                            >
                              {item[columnName]}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr className="package-data-table__row">
                        <td
                          colSpan={desiredColumns.length || 1}
                          className="package-data-table__td"
                          style={{ textAlign: "center", padding: "3rem" }}
                        >
                          データが見つかりません
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* テーブルフッター */}
            <div className="package-table-card__footer">
              <span className="package-table-info">
                {data
                  ? `${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, data.length)} 件目 / 全 ${data.length.toLocaleString()} 件`
                  : "0 件"}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Package;
