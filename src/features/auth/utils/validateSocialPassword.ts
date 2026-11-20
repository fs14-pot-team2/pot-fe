const PASSWORD_REGEX = /^[A-Za-z0-9!@#$]{8,20}$/;

export function validateSocialPassword(password: string, confirmPassword: string): string | null {
  if (!PASSWORD_REGEX.test(password)) {
    return "비밀번호는 영문, 숫자, !@#$만 사용하여 8~20자로 입력해 주세요.";
  }

  if (password !== confirmPassword) {
    return "비밀번호가 일치하지 않습니다.";
  }

  return null;
}
