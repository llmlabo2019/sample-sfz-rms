'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AppLogo from '@/images/maekawa_logo.png';
import { useInfo } from '@/context/InfomationContext';
import { useMfa } from '@/context/MfaContext';
import LockResetIcon from '@mui/icons-material/LockResetOutlined';

function CompletePassword() {
  const router = useRouter();
  const { setInfo } = useInfo();
  const { setNextStep } = useMfa();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [validationChecks, setValidationChecks] = useState({
    minLength: true,
    hasNumber: true,
    hasSpecialChar: true,
    hasUppercase: true,
    hasLowercase: true,
  });

  useEffect(() => {
    const minLength = newPassword.length >= 8;
    const hasNumber = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);

    setValidationChecks({
      minLength: !minLength,
      hasNumber: !hasNumber,
      hasSpecialChar: !hasSpecialChar,
      hasUppercase: !hasUppercase,
      hasLowercase: !hasLowercase,
    });
  }, [newPassword]);

  const handleConfirmPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setInfo('パスワードが一致しません。');
      return;
    }

    try {
      setLoading(true);
      const session = sessionStorage.getItem('cognitoSession');

      const res = await fetch('/api/proxy/rawpost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          endpoint: '/complete-password-cpmc',
          body: { username, newPassword, session },
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.challenge === 'MFA_SETUP') {
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
            <p>新パスワード設定フォーム</p>
          </div>
        </div>
        <div className="form__items__item">
          <input type="text" className="form__items__item__input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Email" required />
        </div>
        <div className="form__items__item">
          <input type="password" className="form__items__item__input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        </div>
        <div className="form__items__item">
          <input type="password" className="form__items__item__input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="NewPassword" required />
          <div className="form__items__item__validation">
            {validationChecks.minLength && <p>※8文字以上</p>}
            {validationChecks.hasNumber && <p>※少なくとも 1 つの数字を含む</p>}
            {validationChecks.hasSpecialChar && <p>※少なくとも 1 つの特殊文字を含む</p>}
            {validationChecks.hasUppercase && <p>※少なくとも 1 つの大文字を含む</p>}
            {validationChecks.hasLowercase && <p>※少なくとも 1 つの小文字を含む</p>}
          </div>
        </div>
        <div className="form__items__item">
          <input type="password" className="form__items__item__input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="ConfirmPassword" required />
        </div>
        <div className="form__items__item">
          <button type="button" className="form__items__item__button" onClick={handleConfirmPassword} disabled={loading}>
            <LockResetIcon />
            {loading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompletePassword;
