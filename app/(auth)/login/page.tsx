'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AppLogo from '@/images/maekawa_logo.png';
import { useMfa } from '@/context/MfaContext';
import { useInfo } from '@/context/InfomationContext';
import LoginIcon from '@mui/icons-material/LoginOutlined';

function LogIn() {
  const router = useRouter();
  const { setNextStep } = useMfa();
  const { setInfo } = useInfo();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch('/api/proxy/rawpost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          endpoint: '/login-cpmc',
          body: { username, password },
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.challenge === 'NEW_PASSWORD_REQUIRED') {
          sessionStorage.setItem('cognitoSession', data.session);
          sessionStorage.setItem('cognitoUsername', data.username);
          router.push('/complete-password');
        } else if (data.challenge === 'MFA_SETUP') {
          sessionStorage.setItem('cognitoSession', data.session);
          sessionStorage.setItem('cognitoUsername', data.username);
          setNextStep(data.secretCode);
          router.push('/mfa-setup');
          setLoading(false);
        } else if (data.challenge === 'SOFTWARE_TOKEN_MFA') {
          sessionStorage.setItem('cognitoSession', data.session);
          sessionStorage.setItem('cognitoUsername', data.username);
          router.push('/mfa-input');
          setLoading(false);
        } else {
          setLoading(false);
          setInfo('Login Error');
        }
      } else {
        setLoading(false);
        setInfo('Login Error');
      }
    } catch (err: any) {
      setLoading(false);
      setInfo(err.message || 'Login Error');
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
            <p>MYCOM SF-ZERO</p>
            <p>遠隔監視システム</p>
          </div>
        </div>
        <div className="form__items__item">
          <input type="text" className="form__items__item__input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Email" required />
        </div>
        <div className="form__items__item">
          <input type="password" className="form__items__item__input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        </div>
        <div className="form__items__item">
          <button type="button" className="form__items__item__button" onClick={handleSignIn} disabled={loading}>
            <LoginIcon />
            {loading ? 'Processing...' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogIn;
