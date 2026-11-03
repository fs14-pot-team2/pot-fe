import Image from "next/image";
import styles from "./ProfileImage.module.css";

type ProfileImageProps = {
  src?: string | null;
  alt: string;
  sizes: string;
  className?: string;
};

export default function ProfileImage({ src, alt, sizes, className = "" }: ProfileImageProps) {
  const imageSrc = src || "/icons/no_img.svg";

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <Image src={imageSrc} alt={alt} fill sizes={sizes} className={styles.image} />
    </div>
  );
}
