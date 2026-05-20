"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AppLogo from "@/images/maekawa_logo.png";
import { useInfo } from "@/context/InfomationContext";
import LoginIcon from "@mui/icons-material/LoginOutlined";

function LogIn() {
  const router = useRouter();
  const { setInfo } = useInfo();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch("/api/proxy/rawpost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          endpoint: "/login-sample-sfz",
          body: { username, password },
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.challenge === "NEW_PASSWORD_REQUIRED") {
          sessionStorage.setItem("cognitoSession", data.session);
          sessionStorage.setItem("cognitoUsername", data.username);
          router.push("/complete-password");
        } else {
          sessionStorage.setItem("userid", username);
          setLoading(false);
          router.push("/");
        }
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
        <h1 className="form__title">SF-ZERO RMS</h1>
        <p className="form__subtitle">Sample</p>
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
          <label className="form__field__label">パスワード</label>
          <input
            type="password"
            className="form__field__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="button"
          className="form__submit"
          onClick={handleSignIn}
          disabled={loading}
        >
          <LoginIcon />
          {loading ? "Processing..." : "ログイン"}
        </button>
      </div>
    </div>
  );
}

export default LogIn;
