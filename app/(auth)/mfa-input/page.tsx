'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AppLogo from '@/images/maekawa_logo.png';
import { useInfo } from '@/context/InfomationContext';
import SecurityIcon from '@mui/icons-material/SecurityOutlined';

function MfaInput() {
  const router = useRouter();
  const { setInfo } = useInfo();
  const [loading, setLoading] = useState<boolean>(false);
  const [mfaCode, setMfaCode] = useState<string>('');
  const [session, setSession] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const s = sessionStorage.getItem('cognitoSession');
    const u = sessionStorage.getItem('cognitoUsername');
    setSession(s);
    setUsername(u);
  }, []);

  const handleConfirmMfa = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch('/api/proxy/rawpost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          endpoint: '/mfa-input-cpmc',
          body: { username, mfaCode, session },
        }),
      });

      if (res.ok) {
        sessionStorage.removeItem('cognitoSession');
        sessionStorage.removeItem('cognitoUsername');
        router.push('/');
      } else {
        const data = await res.json();
        setInfo(data.message || 'MFA認証に失敗しました');
      }
    } catch (err: any) {
      setLoading(false);
      setInfo(err.message || 'Login Error');
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
          <div className="form__items__item__titles">
            <p>MFAコード入力</p>
          </div>
        </div>
        <div className="form__items__item">
          <input type="text" className="form__items__item__input" value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} placeholder="MFAコード確認" required />
        </div>
        <div className="form__items__item">
          <button type="button" className="form__items__item__button" onClick={handleConfirmMfa} disabled={loading}>
            <SecurityIcon />
            {loading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MfaInput;
