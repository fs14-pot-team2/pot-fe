const PASSWORD_REGEX = /^[A-Za-z0-9!@#$]{8,20}$/;

type SocialPasswordValidation = {
  passwordError?: string;
  confirmPasswordError?: string;
  isValid: boolean;
};

export function validateSocialPassword(
  password: string,
  confirmPassword: string,
): SocialPasswordValidation {
  const isPasswordValid = PASSWORD_REGEX.test(password);
  const isPasswordMatched = confirmPassword !== "" && password === confirmPassword;

  return {
    passwordError:
      password !== "" && !isPasswordValid
        ? "비밀번호는 영문, 숫자, !@#$만 사용하여 8~20자로 입력해 주세요."
        : undefined,
    confirmPasswordError:
      confirmPassword !== "" && !isPasswordMatched ? "비밀번호가 일치하지 않습니다." : undefined,
    isValid: isPasswordValid && isPasswordMatched,
  };
}
