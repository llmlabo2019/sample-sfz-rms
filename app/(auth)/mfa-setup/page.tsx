'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AppLogo from '@/images/maekawa_logo.png';
import { QRCodeCanvas } from 'qrcode.react';
import { useInfo } from '@/context/InfomationContext';
import { useMfa } from '@/context/MfaContext';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScannerOutlined';

function MfaSetup() {
  const router = useRouter();
  const { setInfo } = useInfo();
  const { nextStep } = useMfa();
  const [loading, setLoading] = useState<boolean>(false);
  const [setupUri, setSetupUri] = useState<string>('');
  const [mfaCode, setMfaCode] = useState<string>('');
  const [session, setSession] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const s = sessionStorage.getItem('cognitoSession');
    const u = sessionStorage.getItem('cognitoUsername');
    console.log('Hit in MFA SU');
    setSession(s);
    setUsername(u);
  }, []);

  useEffect(() => {
    if (nextStep) {
      const uri = `otpauth://totp/SFRMS%20WEBAPP:${username}?secret=${nextStep}&issuer=SFRMS%20WEBAPP`;
      setSetupUri(uri);
    }
  }, [nextStep, username]);

  const handleConfirmMfa = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mfaCode || !session || !username) {
      setInfo('必要な情報が不足しています');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch('/api/proxy/rawpost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          endpoint: '/mfa-setup-cpmc',
          body: { username, session, totpCode: mfaCode },
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setInfo(data.message || '登録が完了しました。ログインページへ移動します。');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        setInfo(data.message || 'MFA認証に失敗しました');
      }
    } catch (err: any) {
      setInfo(err.message || 'MFA認証中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form">
      <div className="form__items">
        <div className="form__items__item">
          <div className="form__items__item__logo">
            <Image src={AppLogo} alt="app-logo" />
          </div>
        </div>
        <div className="form__items__item">
          {setupUri && (
            <div className="form__items__item__qr">
              <p>
                Authenticator アプリケーションで
                <br />
                QRコードをスキャンしてください。
              </p>
              <QRCodeCanvas value={setupUri} className="form__items__item__qr__code" />
            </div>
          )}
        </div>
        <div className="form__items__item">
          <input type="text" className="form__items__item__input" value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} placeholder="MFAコード確認" required />
        </div>
        <div className="form__items__item">
          <button type="button" className="form__items__item__button" onClick={handleConfirmMfa} disabled={loading}>
            <QrCodeScannerIcon />
            {loading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MfaSetup;
