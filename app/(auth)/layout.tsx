"use client";

import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { InfomationProvider, useInfo } from "@/context/InfomationContext";
import CustomInfo from "@/components/CustomInfo";
import { configureAmplify } from "@/utils/amplify-config";

configureAmplify();

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InfomationProvider>
      <CustomAlertWrapper />
      <div className="login">
        <div className="login__wind login__wind--1"></div>
        <div className="login__wind login__wind--2"></div>
        <div className="login__wind login__wind--3"></div>
        <div className="login__wind login__wind--4"></div>
        <div className="login__wind login__wind--5"></div>
        <div className="login__wind login__wind--6"></div>
        <div className="login__wind login__wind--7"></div>
        <div className="login__container">{children}</div>
      </div>
    </InfomationProvider>
  );
}

function CustomAlertWrapper() {
  const { message, show, clearInfo } = useInfo();
  return <CustomInfo show={show} message={message} onClose={clearInfo} />;
}
