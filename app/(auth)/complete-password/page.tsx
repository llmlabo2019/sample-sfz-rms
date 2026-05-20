"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AppLogo from "@/images/maekawa_logo.png";
import { useInfo } from "@/context/InfomationContext";
import LockResetIcon from "@mui/icons-material/LockResetOutlined";

function CompletePassword() {
  const router = useRouter();
  const { setInfo } = useInfo();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
      setInfo("パスワードが一致しません。");
      return;
    }

    try {
      setLoading(true);
      const session = sessionStorage.getItem("cognitoSession");

      const res = await fetch("/api/proxy/rawpost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          endpoint: "/complete-password-sample-sfz",
          body: { username, newPassword, session },
        }),
      });

      const data = await res.json();

      if (res.ok) {
        sessionStorage.removeItem("cognitoSession");
        sessionStorage.removeItem("cognitoUsername");
        sessionStorage.setItem("userid", username);
        router.push("/");
      } else {
        setLoading(false);
        setInfo("Login Error");
      }
    } catch (err: any) {
      setLoading(false);
      setInfo(err.message || "Login Error");
    }
  };

  return (
    <div className="form">
      <div className="form__header">
        <div className="form__logo">
          <Image src={AppLogo} alt="app-logo" />
        </div>
        <h1 className="form__title">新パスワード設定</h1>
        <p className="form__subtitle">
          初回ログイン時のパスワードを変更してください
        </p>
      </div>

      <div className="form__body">
        <div className="form__field">
          <label className="form__field__label">メールアドレス</label>
          <input
            type="text"
            className="form__field__input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="example@email.com"
            required
          />
        </div>

        <div className="form__field">
          <label className="form__field__label">現在のパスワード</label>
          <input
            type="password"
            className="form__field__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <div className="form__field">
          <label className="form__field__label">新しいパスワード</label>
          <input
            type="password"
            className="form__field__input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          {Object.values(validationChecks).some(Boolean) && (
            <div className="form__field__hints">
              {validationChecks.minLength && (
                <p className="form__field__hint">8文字以上で入力してください</p>
              )}
              {validationChecks.hasNumber && (
                <p className="form__field__hint">
                  数字を1文字以上含めてください
                </p>
              )}
              {validationChecks.hasSpecialChar && (
                <p className="form__field__hint">
                  特殊文字を1文字以上含めてください
                </p>
              )}
              {validationChecks.hasUppercase && (
                <p className="form__field__hint">
                  大文字を1文字以上含めてください
                </p>
              )}
              {validationChecks.hasLowercase && (
                <p className="form__field__hint">
                  小文字を1文字以上含めてください
                </p>
              )}
            </div>
          )}
        </div>

        <div className="form__field">
          <label className="form__field__label">新しいパスワード（確認）</label>
          <input
            type="password"
            className="form__field__input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="button"
          className="form__submit"
          onClick={handleConfirmPassword}
          disabled={loading}
        >
          <LockResetIcon />
          {loading ? "Processing..." : "パスワードを変更"}
        </button>
      </div>
    </div>
  );
}

export default CompletePassword;
