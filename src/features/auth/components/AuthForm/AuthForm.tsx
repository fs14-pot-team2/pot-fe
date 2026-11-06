"use client";

import Button from "@/components/ui/Button/Button";
import Input from "@/components/ui/Input/Input";
import { useToast } from "@/components/ui/Toast/ToastProvider";
import Toggle from "@/components/ui/Toggle/Toggle";
import type { AuthMode, AuthResponse, UserRole } from "@/features/auth/types/auth";
import { useAuth } from "@/lib/auth/AuthProvider";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useController, useForm } from "react-hook-form";
import { useLoginMutation, useSignupMutation } from "../../hooks/useAuthMutations";
import styles from "./AuthForm.module.css";

type AuthFormValues = {
  role: UserRole;
  email: string;
  nickname: string;
  password: string;
  confirmPassword: string;
};

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
  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { isValid, errors },
  } = useForm<AuthFormValues>({
    mode: "onChange",
    defaultValues: {
      role: "OWNER",
      email: "",
      nickname: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { field: roleField } = useController({
    name: "role",
    control,
  });

  const {
    field: emailField,
    fieldState: { error: emailFieldError },
  } = useController({
    name: "email",
    control,
    rules: {
      validate: (value) => EMAIL_REGEX.test(value) || "올바른 이메일 형식으로 입력해 주세요.",
    },
  });

  const {
    field: nicknameField,
    fieldState: { error: nicknameFieldError },
  } = useController({
    name: "nickname",
    control,
    rules: {
      validate: (value) =>
        mode !== "signup" ||
        NICKNAME_REGEX.test(value) ||
        "닉네임은 한글, 영문, 숫자 2~7자로 입력해 주세요.",
    },
  });

  const {
    field: passwordField,
    fieldState: { error: passwordFieldError },
  } = useController({
    name: "password",
    control,
    rules: {
      deps: ["confirmPassword"],
      validate: (value) =>
        mode === "login"
          ? value.length > 0
          : PASSWORD_REGEX.test(value) ||
            "비밀번호는 영문, 숫자, !@#$만 사용하여 8~20자로 입력해 주세요.",
    },
  });

  const {
    field: confirmPasswordField,
    fieldState: { error: confirmPasswordFieldError },
  } = useController({
    name: "confirmPassword",
    control,
    rules: {
      validate: (value, values) =>
        mode !== "signup" ||
        (value !== "" && value === values.password) ||
        "비밀번호가 일치하지 않습니다.",
    },
  });

  const email = emailField.value;
  const nickname = nicknameField.value;
  const password = passwordField.value;
  const confirmPassword = confirmPasswordField.value;

  const handleRoleChange = (value: string) => {
    if (value === "OWNER" || value === "SITTER") {
      roleField.onChange(value);
      clearErrors("root");
    }
  };

  const emailError = email !== "" ? emailFieldError?.message : undefined;

  const nicknameError =
    mode === "signup" && nickname !== "" ? nicknameFieldError?.message : undefined;

  const passwordError =
    mode === "signup" && password !== "" ? passwordFieldError?.message : undefined;

  const confirmPasswordError =
    mode === "signup" && confirmPassword !== "" ? confirmPasswordFieldError?.message : undefined;

  const loginError = mode === "login" ? errors.root?.message : undefined;

  const loginMutation = useLoginMutation();
  const signupMutation = useSignupMutation();

  const { setSession } = useAuth();

  const router = useRouter();

  const handleAuthSuccess = (session: AuthResponse) => {
    setSession(session);

    if (session.user.role === "OWNER") {
      router.replace("/sitters");
      return;
    }

    if (mode === "signup") {
      router.replace("/sitter/profile/setup");
      return;
    }

    router.replace("/sitter/requests");
  };

  const isSubmitting = loginMutation.isPending || signupMutation.isPending;

  const { showToast } = useToast();

  const handleAuthError = (error: unknown) => {
    const code = axios.isAxiosError<{ code?: string }>(error)
      ? error.response?.data?.code
      : undefined;

    if (code === "EMAIL_ALREADY_EXISTS") {
      setError("email", {
        type: "server",
        message: "이미 사용 중인 이메일입니다.",
      });
      return;
    }

    if (code === "NICKNAME_ALREADY_EXISTS") {
      setError("nickname", {
        type: "server",
        message: "이미 사용 중인 닉네임입니다.",
      });
      return;
    }

    if (code === "INVALID_CREDENTIALS") {
      setError("root", {
        type: "server",
        message: "이메일 또는 비밀번호를 확인해 주세요.",
      });
      return;
    }

    showToast({
      message: "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    });
  };

  const onSubmit = (values: AuthFormValues) => {
    if (mode === "login") {
      loginMutation.mutate(
        {
          role: values.role,
          email: values.email,
          password: values.password,
        },
        { onSuccess: handleAuthSuccess, onError: handleAuthError },
      );
      return;
    }
    signupMutation.mutate(
      {
        role: values.role,
        email: values.email,
        nickname: values.nickname,
        password: values.password,
      },
      { onSuccess: handleAuthSuccess, onError: handleAuthError },
    );
  };

  return (
    <form
      className={styles.form}
      aria-label={mode === "login" ? "로그인" : "회원가입"}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Toggle
        options={ROLE_OPTIONS}
        value={roleField.value}
        onChange={handleRoleChange}
        variant="auth"
      />

      <div className={styles.fields}>
        <Input
          type="email"
          label="이메일"
          placeholder="이메일을 입력해 주세요"
          value={email}
          onChange={(value) => {
            emailField.onChange(value);
            clearErrors("root");
          }}
          error={emailError}
        />

        {mode === "signup" && (
          <Input
            label="닉네임"
            placeholder="닉네임을 입력해 주세요"
            value={nickname}
            onChange={nicknameField.onChange}
            error={nicknameError}
          />
        )}

        <Input
          type="password"
          label="비밀번호"
          placeholder="비밀번호를 입력해 주세요"
          value={password}
          onChange={(value) => {
            passwordField.onChange(value);
            clearErrors("root");
          }}
          error={passwordError}
        />

        {mode === "signup" && (
          <Input
            type="password"
            label="비밀번호 확인"
            placeholder="비밀번호를 다시 입력해 주세요"
            value={confirmPassword}
            onChange={confirmPasswordField.onChange}
            error={confirmPasswordError}
          />
        )}
      </div>

      {loginError && (
        <p className={styles.formError} role="alert">
          {loginError}
        </p>
      )}

      <Button
        type="submit"
        variant="solid"
        size="md"
        className={styles.submitButton}
        disabled={!isValid || isSubmitting}
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
