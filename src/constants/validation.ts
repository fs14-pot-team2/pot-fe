export const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9]{2,7}$/;
export const PASSWORD_REGEX = /^[A-Za-z0-9!@#$]{8,20}$/;

export const NICKNAME_FORMAT_MESSAGE = "닉네임은 한글, 영문, 숫자 2~7자로 입력해 주세요.";

export const PASSWORD_FORMAT_MESSAGE =
  "비밀번호는 영문, 숫자, !@#$만 사용하여 8~20자로 입력해 주세요.";

export const PASSWORD_CONFIRM_MESSAGE = "새 비밀번호와 일치하지 않습니다.";
