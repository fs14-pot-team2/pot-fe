"use client";

import Input from "@/components/ui/Input/Input";
import Toggle from "@/components/ui/Toggle/Toggle";
import { useState } from "react";
import styles from "./AuthForm.module.css";
import Button from "@/components/ui/Button/Button";
import Link from "next/link";

type AuthMode = "login" | "signup";
type UserRole = "OWNER" | "SITTER";

type AuthFormProps = {
  mode: AuthMode;
};

const ROLE_OPTIONS = [
  { label: "팟오너", value: "OWNER" },
  { label: "팟트너", value: "SITTER" },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9]{2,7}$/;
const PASSWORD_REGEX = /^[A-Za-z0-9!@#$]{8,20}$/;

export default function AuthForm({ mode }: AuthFormProps) {
  const [role, setRole] = useState<UserRole>("OWNER");

  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRoleChange = (value: string) => {
    if (value === "OWNER" || value === "SITTER") {
      setRole(value);
    }
  };

  const emailError =
    email !== "" && !EMAIL_REGEX.test(email) ? "올바른 이메일 형식으로 입력해 주세요." : undefined;

  const nicknameError =
    mode === "signup" && nickname !== "" && !NICKNAME_REGEX.test(nickname)
      ? "닉네임은 한글, 영문, 숫자 2~7자로 입력해 주세요."
      : undefined;

  const passwordError =
    mode === "signup" && password !== "" && !PASSWORD_REGEX.test(password)
      ? "비밀번호는 영문, 숫자, !@#$만 사용하여 8~20자로 입력해 주세요."
      : undefined;

  const confirmPasswordError =
    mode === "signup" && confirmPassword !== "" && confirmPassword !== password
      ? "비밀번호가 일치하지 않습니다."
      : undefined;

  const isLoginValid = EMAIL_REGEX.test(email) && password.length > 0;

  const isSignupValid =
    EMAIL_REGEX.test(email) &&
    NICKNAME_REGEX.test(nickname) &&
    PASSWORD_REGEX.test(password) &&
    confirmPassword === password;

  const isFormValid = mode === "login" ? isLoginValid : isSignupValid;

  return (
    <form className={styles.form} aria-label={mode === "login" ? "로그인" : "회원가입"}>
      <Toggle options={ROLE_OPTIONS} value={role} onChange={handleRoleChange} variant="auth" />

      <div className={styles.fields}>
        <Input
          type="email"
          label="이메일"
          placeholder="이메일을 입력해 주세요"
          value={email}
          onChange={setEmail}
          error={emailError}
        />

        {mode === "signup" && (
          <Input
            label="닉네임"
            placeholder="닉네임을 입력해 주세요"
            value={nickname}
            onChange={setNickname}
            error={nicknameError}
          />
        )}

        <Input
          type="password"
          label="비밀번호"
          placeholder="비밀번호를 입력해 주세요"
          value={password}
          onChange={setPassword}
          error={passwordError}
        />

        {mode === "signup" && (
          <Input
            type="password"
            label="비밀번호 확인"
            placeholder="비밀번호를 다시 입력해 주세요"
            value={confirmPassword}
            onChange={setConfirmPassword}
            error={confirmPasswordError}
          />
        )}
      </div>

      <Button
        type="button"
        variant="solid"
        size="md"
        className={styles.submitButton}
        disabled={!isFormValid}
      >
        {mode === "login" ? "로그인" : "시작하기"}
      </Button>

      <div className={styles.switchRow}>
        <span>{mode === "login" ? "아직 POT 회원이 아니신가요?" : "이미 POT 회원이신가요?"}</span>

        <Link href={mode === "login" ? "/signup" : "/login"} className={styles.switchLink}>
          {mode === "login" ? "이메일로 회원가입하기" : "로그인"}
        </Link>
      </div>
    </form>
  );
}
