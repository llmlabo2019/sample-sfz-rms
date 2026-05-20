import React from "react";
import CheckIcon from "@mui/icons-material/CheckBoxOutlined";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import ChartIcon from "@mui/icons-material/AreaChartOutlined";
import AlarmIcon from "@mui/icons-material/WarningAmberOutlined";
import Link from "next/link";
import { useTitle } from "@/context/TitleContext";

type Props = {
  isMenuOpen: boolean;
  onCloseMenu: () => void;
  onSignOut: () => void;
};

function Menu({ isMenuOpen, onCloseMenu, onSignOut }: Props) {
  const { setTitleName } = useTitle();
  const handleMenuItemClick = () => {
    onCloseMenu();
  };

  const handleSignOutAndMenuClick = () => {
    onSignOut();
    onCloseMenu();
  };

  const handleMenuItemSelect = (titleName: string) => {
    onCloseMenu();
    setTitleName(titleName);
  };

  return (
    <div className={isMenuOpen ? "slider on" : "slider"}>
      <div
        className="slider__item"
        onClick={() => handleMenuItemSelect("ダッシュボード")}
      >
        <Link href="/dashboard">
          <p>
            <DashboardIcon className="slider__materialicon" />
            ダッシュボード
          </p>
        </Link>
      </div>
      <div
        className="slider__item"
        onClick={() => handleMenuItemSelect("システム")}
      >
        <Link href="/datas/sf-zero-2">
          <p>
            <ChartIcon className="slider__materialicon" />
            SF-ZERO Sample 稼働データ
          </p>
        </Link>
      </div>
      <div
        className="slider__item"
        onClick={() => handleMenuItemSelect("システム")}
      >
        <Link href="/alarms/sf-zero-2">
          <p>
            <AlarmIcon className="slider__materialicon" />
            SF-ZERO Sample 警報履歴
          </p>
        </Link>
      </div>
      <div className="slider__close" onClick={handleMenuItemClick}>
        <p>
          <CloseIcon className="slider__materialicon" />
          メニューを閉じる
        </p>
      </div>
      <div className="slider__close" onClick={handleSignOutAndMenuClick}>
        <p>
          <LogoutIcon className="slider__materialicon" />
          ログアウト
        </p>
      </div>
    </div>
  );
}

export default Menu;
