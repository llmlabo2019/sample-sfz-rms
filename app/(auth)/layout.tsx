'use client';

import Image from 'next/image';
import MycomLogo from '@/images/maekawa_logo_Login.png';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';
import { MfaProvider } from '@/context/MfaContext';
import { InfomationProvider, useInfo } from '@/context/InfomationContext';
import CustomInfo from '@/components/CustomInfo';

Amplify.configure(outputs);

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <InfomationProvider>
      <CustomAlertWrapper />
      <div className="login">
        <div className="login__header">
          <div className="login__header__inner">
            <div className="login__header__inner__left">
              <Image src={MycomLogo} alt="mycom-logo" />
            </div>
            <div className="login__header__inner__right"></div>
          </div>
        </div>
        <div className="login__container">
          <MfaProvider>{children}</MfaProvider>
        </div>
      </div>
    </InfomationProvider>
  );
}

function CustomAlertWrapper() {
  const { message, show, clearInfo } = useInfo();
  return <CustomInfo show={show} message={message} onClose={clearInfo} />;
}
