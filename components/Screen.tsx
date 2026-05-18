'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import MycomLogo from '@/images/maekawa_logo.png';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import ChartIcon from '@mui/icons-material/AreaChartOutlined';
import AlarmIcon from '@mui/icons-material/WarningAmberOutlined';

import { usePathname } from 'next/navigation';

type Props = {
  children: React.ReactNode;
  onToggleMenu: () => void;
  titleName?: string;
};

function Screen({ children, onToggleMenu, titleName }: Props) {
  let hoverTimer: any;
  const pathname = usePathname();
  const [isFlagOpen, setIsFlagOpen] = useState(false);

  const [pageName, setPageName] = useState('Index');
  const [pageIcon, setPageIcon] = useState<React.ComponentType | null>(null);

  const pathConfig: Record<string, { name: string; icon: React.ComponentType; title?: string }> = {
    '/dashboard': { name: 'ダッシュボード', icon: DashboardIcon },
    '/datas/sf-zero-1': { name: '稼働データ', icon: ChartIcon, title: 'SF-ZERO No.1庫' },
    '/datas/sf-zero-2': { name: '稼働データ', icon: ChartIcon, title: 'SF-ZERO No.2庫' },
    '/alarms/sf-zero-1': { name: '警報履歴', icon: AlarmIcon, title: 'SF-ZERO No.1庫' },
    '/alarms/sf-zero-2': { name: '警報履歴', icon: AlarmIcon, title: 'SF-ZERO No.2庫' },
    '/datas': { name: '稼働データ', icon: ChartIcon },
    '/alarms': { name: '警報履歴', icon: AlarmIcon },
  };

  const [displayTitle, setDisplayTitle] = useState<string | undefined>(titleName);

  useEffect(() => {
    const matchedKey = Object.keys(pathConfig).find((key) => pathname.startsWith(key));

    if (matchedKey) {
      setPageName(pathConfig[matchedKey].name);
      setPageIcon(() => pathConfig[matchedKey].icon);

      // URLから取得したタイトルを優先、なければpropsのtitleNameを使用
      const urlBasedTitle = pathConfig[matchedKey].title;
      setDisplayTitle(urlBasedTitle || titleName);
      return;
    }

    setPageName('No Name');
    setPageIcon(null);
    setDisplayTitle(titleName);
  }, [pathname, titleName]);

  const handleMouseOver = () => {
    setIsFlagOpen(true);
    clearTimeout(hoverTimer);
  };

  const handleMouseOut = () => {
    hoverTimer = setTimeout(() => {
      setIsFlagOpen(false);
    }, 3000);
  };

  return (
    <>
      <div className="header">
        <div className="header__upper">
          <div className="header__upper__nav">
            <div
              className="header__upper__nav__body"
              onClick={() => {
                onToggleMenu();
              }}
              onMouseOver={handleMouseOver}
              onMouseOut={handleMouseOut}
            >
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className={isFlagOpen ? 'header__upper__nav__name on' : 'header__upper__nav__name'}>
              <p>Menu</p>
            </div>
          </div>
          <div className="header__upper__img">
            <Image src={MycomLogo} alt="mycom-logo" />
          </div>
        </div>
        <div className="header__lower">
          <div className="header__lower__breadcrumb">
            {pageIcon && React.createElement(pageIcon, { className: 'header__lower__breadcrumb__icon' } as any)}
            <p>{pathname !== '/dashboard' && displayTitle ? `${displayTitle} > ${pageName}` : pageName}</p>
          </div>
        </div>
      </div>
      <div className="content">
        <div className="content__inner"></div>
        {children}
      </div>
    </>
  );
}

export default Screen;
