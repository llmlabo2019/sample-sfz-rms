'use client';

import React from 'react';
import SfOneStatus from './components/SfOneStatus';
import SfTwoStatus from './components/SfTwoStatus';
import { useTitle } from '@/context/TitleContext';

function Dashboard() {
  const { setTitleName } = useTitle();

  const handleLinkClick = (title: string) => {
    setTitleName(title);
  };

  return (
    <div className="body">
      <div className="dashboard">
        <SfOneStatus />
        <SfTwoStatus />
      </div>
    </div>
  );
}

export default Dashboard;
