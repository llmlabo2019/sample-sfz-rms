import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import ChartIcon from "@mui/icons-material/AreaChartOutlined";
import AlarmIcon from "@mui/icons-material/WarningAmberOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Link from "next/link";
import { useTitle } from "@/context/TitleContext";

type Props = {
  isMenuOpen: boolean;
  onCloseMenu: () => void;
  onSignOut: () => void;
};

function Menu({ isMenuOpen, onCloseMenu, onSignOut }: Props) {
  const { setTitleName } = useTitle();

  const handleSignOut = () => {
    onSignOut();
    onCloseMenu();
  };

  const handleItemClick = (titleName: string) => {
    onCloseMenu();
    setTitleName(titleName);
  };

  return (
    <>
      <div
        className={isMenuOpen ? "slider-overlay on" : "slider-overlay"}
        onClick={onCloseMenu}
      />

      <aside className={isMenuOpen ? "slider on" : "slider"}>
        <div className="slider__header">
          <h2 className="slider__header__title">メニュー</h2>
          <button className="slider__header__close" onClick={onCloseMenu}>
            <CloseIcon />
          </button>
        </div>

        <nav className="slider__nav">
          <Link
            href="/dashboard"
            className="slider__nav__item"
            onClick={() => handleItemClick("ダッシュボード")}
          >
            <DashboardIcon className="slider__nav__item__icon" />
            <span className="slider__nav__item__text">ダッシュボード</span>
            <ChevronRightIcon className="slider__nav__item__arrow" />
          </Link>

          <Link
            href="/datas/sf-zero-2"
            className="slider__nav__item"
            onClick={() => handleItemClick("システム")}
          >
            <ChartIcon className="slider__nav__item__icon" />
            <span className="slider__nav__item__text">SF-ZERO Sample 稼働データ</span>
            <ChevronRightIcon className="slider__nav__item__arrow" />
          </Link>

          <Link
            href="/alarms/sf-zero-2"
            className="slider__nav__item"
            onClick={() => handleItemClick("システム")}
          >
            <AlarmIcon className="slider__nav__item__icon" />
            <span className="slider__nav__item__text">SF-ZERO Sample 警報履歴</span>
            <ChevronRightIcon className="slider__nav__item__arrow" />
          </Link>
        </nav>

        <div className="slider__footer">
          <button className="slider__footer__logout" onClick={handleSignOut}>
            <LogoutIcon />
            ログアウト
          </button>
        </div>
      </aside>
    </>
  );
}

export default Menu;
