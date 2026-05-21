"use client";

import { InfomationProvider, useInfo } from "@/context/InfomationContext";
import CustomInfo from "@/components/CustomInfo";
import { configureAmplify } from "@/utils/amplify-config";
import Image from "next/image";
import LoginBg from "@/images/login_bg.png";

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
        <div className="login__bg">
          <Image
            src={LoginBg}
            alt=""
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority
          />
        </div>
        <div className="login__container">{children}</div>
      </div>
    </InfomationProvider>
  );
}

function CustomAlertWrapper() {
  const { message, show, clearInfo } = useInfo();
  return <CustomInfo show={show} message={message} onClose={clearInfo} />;
}
