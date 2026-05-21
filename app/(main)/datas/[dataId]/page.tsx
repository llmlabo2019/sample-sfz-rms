"use client";

import React, { useState, useEffect, useMemo } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { fetchOneDayData } from "@/utils/fetchOneDayData";
import { useRouter } from "next/navigation";
import { useError } from "@/context/ErrorContext";
import CustomInfo from "@/components/CustomInfo";
import { ja } from "date-fns/locale/ja";
import "react-datepicker/dist/react-datepicker.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { saveAs } from "file-saver";
import Encoding from "encoding-japanese";
import ExpandMoreIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import RefreshIcon from "@mui/icons-material/RefreshOutlined";
import { useLoading } from "@/context/LoadingContext";
import TuneIcon from "@mui/icons-material/TuneOutlined";
import TableChartIcon from "@mui/icons-material/TableChartOutlined";
import DownloadIcon from "@mui/icons-material/FileDownloadOutlined";
import ChartIcon from "@mui/icons-material/ShowChartOutlined";

interface DatasProps {
  params: {
    dataId: string;
  };
}

function Datas({ params }: DatasProps) {
  const { setError } = useError();
  const router = useRouter();
  const { setLoading } = useLoading();

  const color_class = [
    "c1",
    "c2",
    "c3",
    "c4",
    "c5",
    "c6",
    "c7",
    "c8",
    "c9",
    "c10",
    "c11",
    "c12",
    "c13",
    "c14",
    "c15",
    "c16",
    "c17",
    "c18",
    "c19",
    "c20",
    "c21",
    "c22",
    "c23",
    "c24",
    "c25",
    "c26",
    "c27",
    "c28",
    "c29",
    "c30",
    "c31",
    "c32",
    "c33",
    "c34",
    "c35",
    "c36",
    "c37",
    "c38",
    "c39",
    "c40",
  ];
  const color_codes = [
    "#c62828",
    "#ad1457",
    "#6a1b9a",
    "#4527a0",
    "#283593",
    "#1565c0",
    "#0277bd",
    "#00838f",
    "#00695c",
    "#2e7d32",
    "#558b2f",
    "#9e9d24",
    "#f9a825",
    "#ff8f00",
    "#ef6c00",
    "#d84315",
    "#5d4037",
    "#424242",
    "#37474f",
    "#1b5e20",
    "#004d40",
    "#006064",
    "#01579b",
    "#0d47a1",
    "#311b92",
    "#4a148c",
    "#880e4f",
    "#b71c1c",
    "#3e2723",
    "#263238",
    "#e65100",
    "#bf360c",
    "#33691e",
    "#827717",
    "#f57f17",
    "#ff6f00",
    "#e65100",
    "#4e342e",
    "#1a237e",
    "#006064",
  ];

  const sf_zero_one_default_graph = [
    "D6020",
    "D6021",
    "D6022",
    "D6023",
    "D6024",
    "D6025",
    "D6026",
    "D6027",
    "D6028",
    "D6029",
  ];
  const sf_zero_two_default_graph = [
    "D6220",
    "D6221",
    "D6222",
    "D6223",
    "D6224",
    "D6225",
    "D6226",
    "D6227",
    "D6028",
    "D6229",
  ];

  const sf_zero_one_all_graph = {
    D6020: "クーラー出口冷媒温度 TE-101(℃)",
    D6021: "クーラー吸込温度 TE-102(℃)",
    D6022: "クーラー吹出温度 TE-103(℃)",
    D6023: "クーラー出口冷媒温度 TE-201(℃)",
    D6024: "クーラー吸込温度 TE-202(℃)",
    D6025: "クーラー吹出温度 TE-203(℃)",
    D6026: "冷凍機吸入温度 TE-11(℃)",
    D6027: "給液温度 TE-12(℃)",
    D6028: "外気温度 TE-13(℃)",
    D6029: "庫内温度 THE-101(℃)",
    D6036: "蒸発圧力 PE-101(MPa)",
    D6037: "蒸発圧力 PE-201(MPa)",
    D6038: "冷凍機吸入圧力 PE-11(MPa)",
    D6039: "液管圧力 PE-12(MPa)",
    D6040: "MCフィルター前後差圧 PF-101(Pa)",
    D6041: "MCフィルター前後差圧 PF-201(Pa)",
    D6042: "庫内湿度 THE-101(%)",
    D6051: "蒸発温度 CF-101(℃)",
    D6052: "蒸発温度 CF-201(℃)",
    D6053: "冷凍機吸入飽和温度 R-11(℃)",
    D6054: "クーラー過熱度 CF-101(℃)",
    D6055: "クーラー過熱度 CF-201(℃)",
    D6056: "冷凍機吸入過熱度 R-11(℃)",
    D6057: "クーラーファン電流値 CF-101(A)",
    D6058: "クーラーファン周波数 CF-101(Hz)",
    D6059: "クーラーファン電流値 CF-201(A)",
    D6060: "クーラーファン周波数 CF-201(Hz)",
    D6064: "制御温度1号機(℃)",
    D6065: "制御温度2号機(℃)",
    D6066: "No1目標温度(℃)",
  };
  const sf_zero_two_all_graph = {
    D6220: "クーラー出口冷媒温度(℃)",
    D6221: "クーラー吸込温度(℃)",
    D6222: "クーラー吹出温度(℃)",
    D6223: "クーラー出口冷媒温度(℃)",
    D6224: "クーラー吸込温度(℃)",
    D6225: "クーラー吹出温度(℃)",
    D6226: "冷凍機吸入温度(℃)",
    D6227: "給液温度(℃)",
    D6028: "外気温度(℃)",
    D6229: "庫内温度(℃)",
    D6236: "蒸発圧力(MPa)",
    D6237: "蒸発圧力(MPa)",
    D6238: "冷凍機吸入圧力(MPa)",
    D6239: "液管圧力(MPa)",
    D6240: "MCフィルター前後差圧(Pa)",
    D6241: "MCフィルター前後差圧(Pa)",
    D6242: "庫内湿度(%)",
    D6251: "蒸発温度(℃)",
    D6252: "蒸発温度(℃)",
    D6253: "冷凍機吸入飽和温度(℃)",
    D6254: "クーラー過熱度(℃)",
    D6255: "クーラー過熱度(℃)",
    D6256: "冷凍機吸入過熱度(℃)",
    D6257: "クーラーファン電流値(A)",
    D6258: "クーラーファン周波数(Hz)",
    D6259: "クーラーファン電流値(A)",
    D6260: "クーラーファン周波数(Hz)",
    D6264: "制御温度(℃)",
    D6265: "制御温度(℃)",
    D6266: "目標温度(℃)",
  };

  const sf_zero_one_desired_columns = [
    "timestamp",
    "D6020",
    "D6021",
    "D6022",
    "D6023",
    "D6024",
    "D6025",
    "D6026",
    "D6027",
    "D6028",
    "D6029",
    "D6036",
    "D6037",
    "D6038",
    "D6039",
    "D6040",
    "D6041",
    "D6042",
    "D6044",
    "D6045",
    "D6046",
    "D6047",
    "D6048",
    "D6049",
    "D6050",
    "D6051",
    "D6052",
    "D6053",
    "D6054",
    "D6055",
    "D6056",
    "D6057",
    "D6058",
    "D6059",
    "D6060",
    "D6064",
    "D6065",
    "D6066",
    "D6068",
    "D6069",
    "D6070",
    "D6071",
    "D6073",
    "D6074",
    "D6075",
    "D6076",
    "D6077",
    "D6078",
    "D6079",
    "unit11Operation",
    "compressor11Operation",
    "automaticDoor110CloseSignalOne",
    "automaticDoor111CloseSignalTwo",
    "coolerFan101OperationOne",
    "coolerFan201OperationTwo",
    "sv101",
    "hsv101",
    "sv201",
    "hsv201",
    "hsv11",
    "mv101",
    "mv201",
    "exv101",
    "epr101",
    "exv201",
    "epr201",
  ];
  const sf_zero_two_desired_columns = [
    "timestamp",
    "D6220",
    "D6221",
    "D6222",
    "D6223",
    "D6224",
    "D6225",
    "D6226",
    "D6227",
    "D6028",
    "D6229",
    "D6236",
    "D6237",
    "D6238",
    "D6239",
    "D6240",
    "D6241",
    "D6242",
    "D6244",
    "D6245",
    "D6246",
    "D6247",
    "D6248",
    "D6249",
    "D6250",
    "D6251",
    "D6252",
    "D6253",
    "D6254",
    "D6255",
    "D6256",
    "D6257",
    "D6258",
    "D6259",
    "D6260",
    "D6264",
    "D6265",
    "D6266",
    "D6268",
    "D6269",
    "D6270",
    "D6271",
    "D6273",
    "D6274",
    "D6275",
    "D6276",
    "D6277",
    "D6278",
    "D6279",
    "unit21Operation",
    "compressor21Operation",
    "automaticDoor210CloseSignalOne",
    "automaticDoor211CloseSignalTwo",
    "coolerFan301OperationOne",
    "coolerFan401OperationTwo",
    "sv301",
    "hsv301",
    "sv401",
    "hsv401",
    "hsv21",
    "mv301",
    "mv401",
    "exv301",
    "epr301",
    "exv401",
    "epr401",
  ];

  const sf_zero_one_title_text =
    "時刻,クーラー出口冷媒温度 TE-101(℃),クーラー吸込温度 TE-102(℃),クーラー吹出温度 TE-103(℃),クーラー出口冷媒温度 TE-201(℃),クーラー吸込温度 TE-202(℃),クーラー吹出温度 TE-203(℃),冷凍機吸入温度 TE-11(℃),給液温度 TE-12(℃),外気温度 TE-13(℃),庫内温度 THE-101(℃),蒸発圧力 PE-101(MPa),蒸発圧力 PE-201(MPa),冷凍機吸入圧力 PE-11(MPa),液管圧力 PE-12(MPa),MCフィルター前後差圧 PF-101(Pa),MCフィルター前後差圧 PF-201(Pa),庫内湿度 THE-101(%),電子膨張弁 開度 EXV-101(%),圧力調整弁 開度 EPR-101(%),電子膨張弁 開度 EXV-201(%),圧力調整弁 開度 EPR-201(%),クーラーHG調整弁 開度 HCV-101(%),クーラーHG調整弁 開度 HCV-201(%),低圧保持HG調整弁 開度 HCV-11(%),蒸発温度 CF-101(℃),蒸発温度 CF-201(℃),冷凍機吸入飽和温度 R-11(℃),クーラー過熱度 CF-101(℃),クーラー過熱度 CF-201(℃),冷凍機吸入過熱度 R-11(℃),クーラーファン電流値 CF-101(A),クーラーファン周波数 CF-101(Hz),クーラーファン電流値 CF-201(A),クーラーファン周波数 CF-201(Hz),制御温度1号機(℃),制御温度2号機(℃),No1目標温度(℃),No1給液開始温度設定(℃),No1給液カット温度条件(℃),給液開始温度DIFF(℃),給液ｶｯﾄ 温度DIFF(℃),電子膨張弁 PID設定値 EXV-101(℃),圧力調整弁 PID設定値 EPR-101(MPa),電子膨張弁 PID設定値 EXV-201(℃),圧力調整弁 PID設定値 EPR-201(MPa),クーラーHG調整弁 PID設定値 HCV-101(℃),クーラーHG調整弁 PID設定値 HCV-201(℃),低圧保持HG調整弁 PID設定値 HCV-11(MPa),R-11 冷凍機ユニット運転(X1),R-11 冷凍機圧縮機運転(X2),自動扉1 閉信号(X20),自動扉2 閉信号(X21),クーラーファン運転中 CF-101(X306),クーラーファン運転中 CF-201(X346),給液電磁弁 SV-101(Y0),クーラーホットガス電磁弁 HSV-101(Y1),給液電磁弁 SV-201(Y2),クーラーホットガス電磁弁 HSV-201(Y3),低圧保持ホットガス電磁弁HSV-11(Y4),排水電動弁 MV-101(Y5),排水電動弁 MV-201(Y6),膨張弁制御指令 EXV-101(Y10),調整弁制御指令 EPR-101(Y11),膨張弁制御指令 EXV-201(Y12),調整弁制御指令 EPR-201(Y13)";
  const sf_zero_two_title_text =
    "時刻,クーラー出口冷媒温度(℃),クーラー吸込温度(℃),クーラー吹出温度(℃),クーラー出口冷媒温度(℃),クーラー吸込温度(℃),クーラー吹出温度(℃),冷凍機吸入温度(℃),給液温度(℃),外気温度 (℃),庫内温度 (℃),蒸発圧力(MPa),蒸発圧力 (MPa),冷凍機吸入圧力 (MPa),液管圧力 (MPa),MCフィルター前後差圧 (Pa),MCフィルター前後差圧 (Pa),庫内湿度 (%),電子膨張弁 開度 (%),圧力調整弁 開度 (%),電子膨張弁 開度 (%),圧力調整弁 開度 (%),クーラーHG調整弁 開度 (%),クーラーHG調整弁 開度 (%),低圧保持HG調整弁 開度 (%),蒸発温度 (℃),蒸発温度 (℃),冷凍機吸入飽和温度 (℃),クーラー過熱度 (℃),クーラー過熱度 (℃),冷凍機吸入過熱度 (℃),クーラーファン電流値 (A),クーラーファン周波数 (Hz),クーラーファン電流値 (A),クーラーファン周波数 (Hz),制御温度(℃),制御温度(℃),目標温度(℃),給液開始温度設定(℃),給液カット温度条件(℃),給液開始温度DIFF(℃),給液ｶｯﾄ 温度DIFF(℃),電子膨張弁 PID設定値(℃),圧力調整弁 PID設定値 (MPa),電子膨張弁 PID設定値 (℃),圧力調整弁 PID設定値 (MPa),クーラーHG調整弁 PID設定値 (℃),クーラーHG調整弁 PID設定値 (℃),低圧保持HG調整弁 PID設定値 (MPa),R-21 冷凍機ユニット運転,冷凍機圧縮機運転,扉 閉信号,扉 閉信号,クーラーファン運転中,クーラーファン運転中,給液電磁弁,クーラーホットガス電磁弁,給液電磁弁,クーラーホットガス電磁弁,低圧保持ホットガス電磁弁,排水電動弁,排水電動弁,膨張弁制御指令,調整弁制御指令,膨張弁制御指令,調整弁制御指令";

  const dataId = params.dataId;
  const URL = "/op-datas-sample-sfz?dataid=" + dataId;

  let default_graph: string[] = [];
  let desiredColumns: string[] = [];
  let allGraph: { [key: string]: string } = {};
  let title_text = "";
  let packageName = "sf-zero-1";

  if (dataId == "sf-zero-1") {
    default_graph = sf_zero_one_default_graph;
    desiredColumns = sf_zero_one_desired_columns;
    allGraph = sf_zero_one_all_graph;
    title_text = sf_zero_one_title_text;
    packageName = "SF-ZERO Sample";
  } else if (dataId == "sf-zero-2") {
    default_graph = sf_zero_two_default_graph;
    desiredColumns = sf_zero_two_desired_columns;
    allGraph = sf_zero_two_all_graph;
    title_text = sf_zero_two_title_text;
    packageName = "SF-ZERO Sample";
  } else {
    default_graph = sf_zero_one_default_graph;
    desiredColumns = sf_zero_one_desired_columns;
    allGraph = sf_zero_one_all_graph;
    title_text = sf_zero_one_title_text;
    packageName = "Default";
  }

  //Data Elements
  const [data, setData] = useState<any>(null);
  const [graphData, setGraphData] = useState<any>(null);
  const [csvData, setCsvData] = useState<any>(null);

  //Elements for Datepicker
  const Today = new Date();
  const [date, setDate] = useState<Date>(Today);
  registerLocale("ja", ja);

  //Elements for pagination
  const [dataNum, setDataNum] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = dataNum;
  const [totalPages, setTotalPages] = useState<number>(1);
  const [dataDual, setDataDual] = useState<number>(1);

  //Graph element
  const [selectedItems, setSelectedItems] = useState<any>(default_graph);
  const [showCheckBox, setShowCheckBox] = useState<boolean>(false);
  const [dataColors, setDataColors] = useState<any>({});

  //Other Elements
  const [updateClicked, setUpdateClicked] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");

  useEffect(() => {
    checkUserAndFetchData();
    setUpdateClicked(false);
  }, [date, updateClicked, dataId]);

  useEffect(() => {
    setCurrentPage(1);
    if (data) {
      const pages = Math.ceil(data.length / itemsPerPage);
      setTotalPages(pages);
    }
  }, [data, graphData, itemsPerPage]);

  useEffect(() => {
    const updatedDataColors: Record<string, string> = {};
    selectedItems.forEach((item: string, index: number) => {
      updatedDataColors[item] = color_codes[index % color_codes.length];
    });
    setDataColors(updatedDataColors);
  }, [selectedItems]);

  const memoizedDefaultGraph = useMemo(() => {
    if (dataId === "sf-zero-1") {
      return sf_zero_one_default_graph;
    } else if (dataId === "sf-zero-2") {
      return sf_zero_two_default_graph;
    } else {
      return sf_zero_one_default_graph;
    }
  }, [dataId]);

  useEffect(() => {
    setSelectedItems(memoizedDefaultGraph);
  }, [memoizedDefaultGraph]);

  const checkUserAndFetchData = async () => {
    try {
      const res = await fetch("/api/auth/protected-check", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Token expired or invalid");
      } else {
        await fetchData(date);
      }
    } catch (error) {
      setError("認証または権限エラーが発生しました");
      router.push("/login");
    }
  };

  const fetchData = async (selectedDate: Date) => {
    try {
      setLoading(true);

      let fetchedData = await fetchOneDayData(selectedDate, URL);

      sessionStorage.setItem("result", JSON.stringify(fetchedData));
      let resultData = sessionStorage.getItem("result");
      let resultDataJson = JSON.parse(resultData || "[]");
      let resultDataLen = resultDataJson.length;
      let resultDataArray: any[] = [];
      let resultCsvDataArray: any[] = [];
      let resultGraphArray: any[] = [];

      // オリジナルのタイムスタンプを保存する配列
      let originalTimestamps = resultDataJson.map(
        (dataItem: any) => dataItem.timestamp,
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
          dataItem.timestamp = dataItem.timestamp.substring(9, 17);
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
          let selectedData: Record<string, any> = {};

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

  const handleDataDualChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDataDual = Number(e.target.value);
    setDataDual(newDataDual);
    dataDualChange(newDataDual);
  };

  const dataDualChange = (newDataDual: number) => {
    let resultData = sessionStorage.getItem("result");
    let resultDataJson = JSON.parse(resultData || "[]");
    let resultDataLen = resultDataJson.length;
    let resultDataArray = [];
    for (let i = 0; i < resultDataLen; i++) {
      let dataPosition = i * newDataDual;
      if (resultDataLen - 1 < dataPosition) {
        break;
      }
      resultDataArray.push(resultDataJson[dataPosition]);
    }
    setData(resultDataArray);
  };

  const handleDataNumChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDataNum(Number(e.target.value));
  };

  const handlePageChange = (pageNum: number) => {
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
    const pageButtons: React.ReactNode[] = [];
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
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
          className={`package-pagination__page${
            currentPage === i ? " package-pagination__page--active" : ""
          }`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>,
      );
    }
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
    const resultCsvData = csvData.map((item: any) => {
      const values = Object.values(item);
      return values.slice(0, values.length).join(",");
    });

    const csvLines = [title_text, ...resultCsvData];
    const csvString = csvLines.join("\n");

    const sjisArray = Encoding.convert(Encoding.stringToCode(csvString), {
      from: "UNICODE",
      to: "SJIS",
      type: "array",
    });
    const blob = new Blob([new Uint8Array(sjisArray)], {
      type: "text/csv;charset=shift_jis",
    });
    saveAs(blob, `${packageName}_data.csv`);
  };

  const renderTableTitle = () => {
    const titleArray = title_text
      .split(",")
      .map((title) => title.trim())
      .filter(Boolean);
    return (
      <tr>
        {titleArray.map((titleName, index) => (
          <th key={index}>{titleName}</th>
        ))}
      </tr>
    );
  };

  const renderTableRows = () => {
    const paginatedData = getPaginatedData();
    if (!paginatedData || !Array.isArray(paginatedData)) {
      return (
        <tr>
          <td className="data_not_found" colSpan={3}>
            データ読み込みエラー
          </td>
        </tr>
      );
    }

    if (!paginatedData.length) {
      return (
        <tr>
          <td className="data_not_found" colSpan={3}>
            データが見つかりません
          </td>
        </tr>
      );
    }
    return paginatedData.map((item: any, index: number) => (
      <tr key={index}>
        {desiredColumns.map((columnName) => (
          <td key={columnName}>{item[columnName]}</td>
        ))}
      </tr>
    ));
  };

  //Graph

  const renderDynamicCheckboxes = () => {
    return (
      <div
        className={"analytics__inner__chart__top__dropdown__contents__checkbox"}
      >
        <div
          className={
            "analytics__inner__chart__top__dropdown__contents__checkbox__upper"
          }
        >
          <button onClick={handleSelectAll}>すべて選択</button>
          <button onClick={handleDeselectAll}>すべて選択解除</button>
        </div>
        <div
          className={
            "analytics__inner__chart__top__dropdown__contents__checkbox__lower"
          }
        >
          {Object.keys(allGraph).map((item, index) => (
            <div
              className={`analytics__inner__chart__top__dropdown__contents__checkbox__lower__item ${
                color_class[index % color_class.length]
              }`}
              key={item}
            >
              <input
                type="checkbox"
                checked={selectedItems.includes(item)}
                onChange={() => handleCheckboxChange(item)}
              />
              <p>{allGraph[item]}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(Object.keys(allGraph));
  };

  const handleDeselectAll = () => {
    setSelectedItems([]);
  };

  const customLabelFormatter = (label: string) => {
    const labelMappings: Record<string, string> = allGraph as Record<
      string,
      string
    >;
    return labelMappings[label] || label;
  };

  const handleCheckboxChange = (item: string) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(
        selectedItems.filter((selectedItem: string) => selectedItem !== item),
      );
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload) {
      return (
        <div className="custom-tooltip">
          <p>{label}</p>
          {payload.map((entry: any, index: number) => (
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
      return null;
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          width={500}
          height={600}
          data={graphData}
          margin={{
            top: 5,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" interval={100} tick={{ fontSize: 16 }} />
          <YAxis tick={{ fontSize: 16 }} />
          <Tooltip
            content={
              <CustomTooltip
                active={undefined}
                payload={undefined}
                label={undefined}
              />
            }
          />
          {selectedItems.map((item: string) => (
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

  const handleManualUpdate = () => {
    setUpdateClicked(true);
  };

  const getTitleArray = () =>
    title_text
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  const renderNewCheckboxes = () => (
    <div className="package-chart-selector__grid">
      {Object.keys(allGraph).map((item, index) => (
        <label
          key={item}
          className="package-chart-selector__item"
          style={
            {
              "--item-color": color_codes[index % color_codes.length],
            } as React.CSSProperties
          }
        >
          <input
            type="checkbox"
            checked={selectedItems.includes(item)}
            onChange={() => handleCheckboxChange(item)}
          />
          <span className="package-chart-selector__checkbox" />
          <span className="package-chart-selector__label">
            {allGraph[item]}
          </span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="datas">
      <CustomInfo
        show={showAlert}
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />
      <div className="package-main">
        {/* 情報カード */}
        <section className="package-info-section">
          <div className="package-info-card">
            <div className="package-info-card__header">
              <div className="package-info-card__badges">
                <span className="package-info-badge package-info-badge--package">
                  {packageName}
                </span>
              </div>
              <div className="package-info-card__date">
                <label className="package-info-card__date__label">表示日</label>
                <DatePicker
                  dateFormat="yyyy年MM月dd日"
                  selected={date}
                  locale="ja"
                  id="datepicker"
                  className="package-info-card__date__input"
                  onChange={(selectedDate: Date | null) =>
                    setDate(selectedDate || Today)
                  }
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
                <ChartIcon />
                運転データグラフ
              </h2>
              <div className="package-chart-card__controls">
                <button
                  className={`package-chart-card__toggle${
                    showCheckBox ? " active" : ""
                  }`}
                  onClick={handleShowCheckBox}
                >
                  <TuneIcon />
                  表示項目を選択
                  <ExpandMoreIcon className="package-chart-card__toggle__arrow" />
                </button>
              </div>
            </div>

            <div
              className={`package-chart-selector${
                showCheckBox ? " active" : ""
              }`}
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
                    すべて選択
                  </button>
                  <button
                    className="package-chart-selector__btn"
                    onClick={handleDeselectAll}
                  >
                    選択解除
                  </button>
                </div>
              </div>
              {renderNewCheckboxes()}
            </div>

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
                <TableChartIcon />
                運転データ一覧
              </h2>
            </div>

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
                  <DownloadIcon />
                  CSV出力
                </button>
                <button
                  className="package-table-btn package-table-btn--icon"
                  onClick={handleManualUpdate}
                  title="更新"
                >
                  <RefreshIcon />
                </button>
              </div>
              <div className="package-table-controls__right">
                <div className="package-pagination">
                  <button
                    className="package-pagination__btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
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
                  </button>
                </div>
              </div>
            </div>

            <div className="package-table-card__body">
              <div className="package-data-table-wrapper">
                <table className="package-data-table">
                  <thead>
                    <tr>
                      {getTitleArray().map((titleName, index) => (
                        <th
                          key={index}
                          className={`package-data-table__th${
                            index === 0 ? " package-data-table__th--sticky" : ""
                          }`}
                        >
                          {titleName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {getPaginatedData().length > 0 ? (
                      getPaginatedData().map((item: any, rowIndex: number) => (
                        <tr key={rowIndex} className="package-data-table__row">
                          {desiredColumns.map((columnName, colIndex) => (
                            <td
                              key={columnName}
                              className={`package-data-table__td${
                                colIndex === 0
                                  ? " package-data-table__td--time"
                                  : ""
                              }`}
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

            <div className="package-table-card__footer">
              <span className="package-table-info">
                {data
                  ? `${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(
                      currentPage * itemsPerPage,
                      data.length,
                    )} 件目 / 全 ${data.length.toLocaleString()} 件`
                  : "0 件"}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Datas;
