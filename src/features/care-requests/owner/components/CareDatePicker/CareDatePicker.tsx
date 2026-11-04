"use client";

import { DayPicker } from "@daypicker/react";
import { ko } from "@daypicker/react/locale";
import "@daypicker/react/style.css";

import Modal from "@/components/ui/Modal/Modal";

import styles from "./CareDatePicker.module.css";

interface CareDatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
  title: string;
  value: string | null;
  minDate: Date;
}

// Date 객체를 YYYY-MM-DD 문자열로 변환
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// YYYY-MM-DD 문자열을 Date 객체로 변환
export function parseDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

// 한국 시간 기준 오늘 날짜
export function getTodayKST(): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const getPart = (type: string) => Number(parts.find((part) => part.type === type)?.value);

  return new Date(getPart("year"), getPart("month") - 1, getPart("day"));
}

export default function CareDatePicker({
  isOpen,
  onClose,
  onSelect,
  title,
  value,
  minDate,
}: CareDatePickerProps) {
  const selectedDate = value ? parseDate(value) : undefined;

  const handleSelect = (date: Date | undefined) => {
    // 날짜 선택 취소 또는 잘못된 값 방지
    if (!date || Number.isNaN(date.getTime())) return;

    if (formatDate(date) < formatDate(minDate)) {
      return;
    }

    onSelect(formatDate(date));
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className={styles.modal}>
      <div className={styles.calendar}>
        <DayPicker
          mode="single"
          locale={ko}
          weekStartsOn={0}
          navLayout="around"
          captionLayout="label"
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={{
            before: minDate,
          }}
          startMonth={minDate}
          defaultMonth={selectedDate ?? minDate}
          showOutsideDays
        />
      </div>

      <p className={styles.description}>
        {title === "돌봄 시작일 선택"
          ? "오늘 이후의 날짜부터 선택할 수 있어요."
          : "돌봄 시작일과 같거나 이후의 날짜를 선택해 주세요."}
      </p>
    </Modal>
  );
}
