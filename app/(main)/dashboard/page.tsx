"use client";

import React from "react";
import SfTwoStatus from "./components/SfTwoStatus";
import { useTitle } from "@/context/TitleContext";

function Dashboard() {
  const { setTitleName } = useTitle();

  const handleLinkClick = (title: string) => {
    setTitleName(title);
  };

  return (
    <div className="body">
      <div className="dashboard">
        <SfTwoStatus />
      </div>
    </div>
  );
}

export default Dashboard;
