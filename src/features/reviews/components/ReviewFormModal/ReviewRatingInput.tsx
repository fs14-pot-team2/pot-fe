"use client";

import Image from "next/image";
import { useId } from "react";
import styles from "./ReviewRatingInput.module.css";

type ReviewRatingInputProps = {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
};

const RATINGS = [1, 2, 3, 4, 5];

export default function ReviewRatingInput({
  value,
  onChange,
  disabled = false,
}: ReviewRatingInputProps) {
  const groupName = useId();

  return (
    <fieldset className={styles.fieldset} disabled={disabled}>
      <legend className={styles.legend}>평점을 선택해 주세요</legend>

      <div className={styles.stars}>
        {RATINGS.map((rating) => (
          <label key={rating} className={styles.star}>
            <input
              type="radio"
              name={groupName}
              value={rating}
              checked={value === rating}
              onChange={() => onChange(rating)}
              aria-label={`${rating}점`}
              className={styles.input}
            />

            <Image
              src={rating <= value ? "/icons/ic_star.svg" : "/icons/ic_star_default.svg"}
              alt=""
              width={36}
              height={36}
              className={styles.icon}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
