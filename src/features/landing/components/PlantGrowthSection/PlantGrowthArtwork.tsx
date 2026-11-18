import type { SVGProps } from "react";

type PlantGrowthArtworkProps = Pick<SVGProps<SVGSVGElement>, "className">;

// 꽃 한 송이가 피는 벡터 SVG를 React 요소로 옮긴 컴포넌트입니다.
// 나중에 GSAP에서 .stem-draw, .leaf-art, .flower-petal 등을 직접 움직입니다.
export default function PlantGrowthArtwork({ className }: PlantGrowthArtworkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      id="growth-plant"
      viewBox="0 0 1254 1254"
      role="img"
      aria-label="베이지색 화분의 식물이 자라고 맨 위에서 연분홍 꽃 한 송이가 피어나는 그림"
      className={className}
    >
      <defs>
        <linearGradient id="plant-pot-clay" x1="0%" y1="10%" x2="94%" y2="95%">
          <stop offset="0%" stopColor="#f8e4cb" />
          <stop offset="26%" stopColor="#f5dec1" />
          <stop offset="60%" stopColor="#e7c9aa" />
          <stop offset="100%" stopColor="#caa582" />
        </linearGradient>
        <linearGradient id="plant-pot-lip" x1="0%" y1="20%" x2="100%" y2="95%">
          <stop offset="0%" stopColor="#ffe9d1" />
          <stop offset="45%" stopColor="#f5dbb9" />
          <stop offset="100%" stopColor="#dfba94" />
        </linearGradient>
        <linearGradient id="plant-soil" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#88694d" />
          <stop offset="100%" stopColor="#624731" />
        </linearGradient>
        <linearGradient id="plant-stems" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8eae52" />
          <stop offset="55%" stopColor="#739b41" />
          <stop offset="100%" stopColor="#547c37" />
        </linearGradient>
        <linearGradient id="plant-leaf-a" x1="0%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#c0d982" />
          <stop offset="42%" stopColor="#a0bf64" />
          <stop offset="100%" stopColor="#6f993b" />
        </linearGradient>
        <linearGradient id="plant-leaf-b" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#bbd37a" />
          <stop offset="45%" stopColor="#93b856" />
          <stop offset="100%" stopColor="#5f8d36" />
        </linearGradient>
        <radialGradient id="plant-leaf-sheen" cx="25%" cy="18%" r="95%">
          <stop offset="0%" stopColor="#f4f8d4" stopOpacity="0.28" />
          <stop offset="60%" stopColor="#f7fae5" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#f7fae5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="plant-pot-glaze" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff6e5" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#a67b55" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="bloom-petal-light" x1="12%" y1="0%" x2="87%" y2="100%">
          <stop offset="0%" stopColor="#fff8f1" />
          <stop offset="40%" stopColor="#f7ded5" />
          <stop offset="100%" stopColor="#eab6ad" />
        </linearGradient>
        <linearGradient id="bloom-petal-warm" x1="12%" y1="0%" x2="87%" y2="100%">
          <stop offset="0%" stopColor="#ffece5" />
          <stop offset="48%" stopColor="#f6c9bf" />
          <stop offset="100%" stopColor="#df9e9b" />
        </linearGradient>
        <linearGradient id="bloom-petal-soft" x1="12%" y1="0%" x2="87%" y2="100%">
          <stop offset="0%" stopColor="#fffbef" />
          <stop offset="50%" stopColor="#fae1d4" />
          <stop offset="100%" stopColor="#ebb9b0" />
        </linearGradient>
        <linearGradient id="bloom-center-gold" x1="12%" y1="0%" x2="87%" y2="100%">
          <stop offset="0%" stopColor="#ffeb99" />
          <stop offset="60%" stopColor="#f5cb6b" />
          <stop offset="100%" stopColor="#d49a49" />
        </linearGradient>
      </defs>
      <g id="growth-pot">
        <path
          d="M414 814 C418 915 439 1038 485 1096 C505 1122 526 1128 562 1129 L684 1129 C721 1128 751 1119 772 1091 C814 1035 830 908 830 813 Z"
          fill="url(#plant-pot-clay)"
        />
        <path
          d="M435 847 C449 952 475 1058 506 1095 C526 1117 561 1123 619 1124 C692 1123 731 1118 752 1087 C688 1128 544 1115 435 847 Z"
          fill="#fff8ea"
          opacity=".10"
        />
        <path
          d="M794 891 C777 996 757 1063 728 1095 C754 1080 777 1024 794 891 Z"
          fill="#a87e5d"
          opacity=".09"
        />
        <path
          d="M450 893 C452 936 465 1003 482 1030"
          fill="none"
          stroke="#fff6e7"
          strokeWidth="17"
          strokeLinecap="round"
          opacity=".73"
        />
        <ellipse cx="620" cy="801" rx="218" ry="47" fill="url(#plant-pot-lip)" />
        <ellipse cx="620" cy="804" rx="186" ry="34" fill="#bc9270" opacity=".50" />
        <ellipse cx="620" cy="801" rx="183" ry="30" fill="url(#plant-soil)" />
        <path
          d="M402 801 C412 832 498 850 621 850 C738 850 827 828 838 801 L838 826 C828 853 744 876 621 878 C492 875 407 853 402 825 Z"
          fill="url(#plant-pot-lip)"
        />
        <path
          d="M419 826 C457 854 531 861 621 862 C711 862 778 849 820 827"
          fill="none"
          stroke="#d5ad8a"
          strokeWidth="3"
          opacity=".17"
        />
      </g>
      <g
        id="growth-stems"
        fill="none"
        stroke="url(#plant-stems)"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          id="stem-lower-left"
          className="stem-draw"
          data-start="0.06"
          d="M608 799 C576 754 537 719 499 702"
          strokeWidth="7"
        />
        <path
          id="stem-lower-inner-left"
          className="stem-draw"
          data-start="0.13"
          d="M614 800 C598 743 586 716 579 699"
          strokeWidth="7"
        />
        <path
          id="stem-center"
          className="stem-draw"
          data-start="0.23"
          d="M624 800 C619 720 622 654 623 609"
          strokeWidth="7"
        />
        <path
          id="stem-lower-inner-right"
          className="stem-draw"
          data-start="0.32"
          d="M632 799 C648 744 667 717 673 699"
          strokeWidth="7"
        />
        <path
          id="stem-lower-right"
          className="stem-draw"
          data-start="0.40"
          d="M636 799 C670 748 707 719 745 702"
          strokeWidth="7"
        />
        <path
          id="stem-middle-left"
          className="stem-draw"
          data-start="0.49"
          d="M611 799 C580 709 522 633 492 596"
          strokeWidth="8"
        />
        <path
          id="stem-middle-right"
          className="stem-draw"
          data-start="0.57"
          d="M637 798 C680 704 721 629 751 595"
          strokeWidth="8"
        />
        <path
          id="stem-upper-left"
          className="stem-draw"
          data-start="0.66"
          d="M617 799 C602 700 570 559 553 509"
          strokeWidth="8"
        />
        <path
          id="stem-upper-right"
          className="stem-draw"
          data-start="0.75"
          d="M633 799 C650 692 674 559 694 507"
          strokeWidth="8"
        />
        <path
          id="stem-top"
          className="stem-draw"
          data-start="0.84"
          d="M622 798 C618 700 614 558 614 441 C614 403 616 375 614 340"
          strokeWidth="8"
        />
      </g>
      <g id="growth-leaves">
        <g id="leaf-position-lower-left" transform="translate(499 702) rotate(-57.36)">
          <g id="leaf-lower-left" className="leaf-art" data-start="0.06">
            <path
              d="M0 0 C-8.25 -12.68 -36.3 -17.97 -36.96 -51.79 C-38.28 -79.27 -19.8 -99.35 0 -105.69 C19.8 -99.35 38.28 -79.27 36.96 -51.79 C36.3 -17.97 8.25 -12.68 0 0 Z"
              fill="url(#plant-leaf-b)"
            />
            <path
              d="M0 0 C-8.25 -12.68 -36.3 -17.97 -36.96 -51.79 C-38.28 -79.27 -19.8 -99.35 0 -105.69 C19.8 -99.35 38.28 -79.27 36.96 -51.79 C36.3 -17.97 8.25 -12.68 0 0 Z"
              fill="url(#plant-leaf-sheen)"
            />
            <path
              d="M0 -4 C -2 -29.59 2 -65.53 0 -96.18"
              fill="none"
              stroke="#edf3c9"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity=".78"
            />
            <path
              d="M0 -35.93 Q -8.58 -37.63 -16.5 -44.39 M0 -35.93 Q 8.58 -37.63 16.5 -44.39"
              fill="none"
              stroke="#edf3cc"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.43"
            />
            <path
              d="M0 -54.96 Q -11.5 -56.65 -22.11 -63.41 M0 -54.96 Q 11.5 -56.65 22.11 -63.41"
              fill="none"
              stroke="#edf3cc"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.43"
            />
            <path
              d="M0 -75.04 Q -9.09 -76.73 -17.49 -83.49 M0 -75.04 Q 9.09 -76.73 17.49 -83.49"
              fill="none"
              stroke="#edf3cc"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.34"
            />
          </g>
        </g>
        <g id="leaf-position-lower-inner-left" transform="translate(579 699) rotate(-40.75)">
          <g id="leaf-lower-inner-left" className="leaf-art" data-start="0.13">
            <path
              d="M0 0 C-8 -10.3 -35.2 -14.59 -35.84 -42.04 C-37.12 -64.35 -19.2 -80.65 0 -85.8 C19.2 -80.65 37.12 -64.35 35.84 -42.04 C35.2 -14.59 8 -10.3 0 0 Z"
              fill="url(#plant-leaf-a)"
            />
            <path
              d="M0 0 C-8 -10.3 -35.2 -14.59 -35.84 -42.04 C-37.12 -64.35 -19.2 -80.65 0 -85.8 C19.2 -80.65 37.12 -64.35 35.84 -42.04 C35.2 -14.59 8 -10.3 0 0 Z"
              fill="url(#plant-leaf-sheen)"
            />
            <path
              d="M0 -4 C -2 -24.02 2 -53.19 0 -78.07"
              fill="none"
              stroke="#edf3c9"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity=".78"
            />
            <path
              d="M0 -29.17 Q -8.32 -30.54 -16 -36.03 M0 -29.17 Q 8.32 -30.54 16 -36.03"
              fill="none"
              stroke="#edf3cc"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.43"
            />
            <path
              d="M0 -44.61 Q -11.15 -45.99 -21.44 -51.48 M0 -44.61 Q 11.15 -45.99 21.44 -51.48"
              fill="none"
              stroke="#edf3cc"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.43"
            />
            <path
              d="M0 -60.92 Q -8.82 -62.29 -16.96 -67.78 M0 -60.92 Q 8.82 -62.29 16.96 -67.78"
              fill="none"
              stroke="#edf3cc"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.34"
            />
          </g>
        </g>
        <g id="leaf-position-center" transform="translate(623 609) rotate(0.97)">
          <g id="leaf-center" className="leaf-art" data-start="0.23">
            <path
              d="M0 0 C-12.5 -14.16 -55 -20.06 -56 -57.83 C-58 -88.51 -30 -110.94 0 -118.02 C30 -110.94 58 -88.51 56 -57.83 C55 -20.06 12.5 -14.16 0 0 Z"
              fill="url(#plant-leaf-b)"
            />
            <path
              d="M0 0 C-12.5 -14.16 -55 -20.06 -56 -57.83 C-58 -88.51 -30 -110.94 0 -118.02 C30 -110.94 58 -88.51 56 -57.83 C55 -20.06 12.5 -14.16 0 0 Z"
              fill="url(#plant-leaf-sheen)"
            />
            <path
              d="M0 -4 C -2 -33.04 2 -73.17 0 -107.4"
              fill="none"
              stroke="#edf3c9"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity=".78"
            />
            <path
              d="M0 -40.13 Q -13 -42.01 -25 -49.57 M0 -40.13 Q 13 -42.01 25 -49.57"
              fill="none"
              stroke="#edf3cc"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.43"
            />
            <path
              d="M0 -61.37 Q -17.42 -63.26 -33.5 -70.81 M0 -61.37 Q 17.42 -63.26 33.5 -70.81"
              fill="none"
              stroke="#edf3cc"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.43"
            />
            <path
              d="M0 -83.79 Q -13.78 -85.68 -26.5 -93.23 M0 -83.79 Q 13.78 -85.68 26.5 -93.23"
              fill="none"
              stroke="#edf3cc"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.34"
            />
          </g>
        </g>
        <g id="leaf-position-lower-inner-right" transform="translate(673 699) rotate(40.82)">
          <g id="leaf-lower-inner-right" className="leaf-art" data-start="0.32">
            <path
              d="M0 0 C-8 -10.46 -35.2 -14.83 -35.84 -42.73 C-37.12 -65.4 -19.2 -81.97 0 -87.21 C19.2 -81.97 37.12 -65.4 35.84 -42.73 C35.2 -14.83 8 -10.46 0 0 Z"
              fill="url(#plant-leaf-a)"
            />
            <path
              d="M0 0 C-8 -10.46 -35.2 -14.83 -35.84 -42.73 C-37.12 -65.4 -19.2 -81.97 0 -87.21 C19.2 -81.97 37.12 -65.4 35.84 -42.73 C35.2 -14.83 8 -10.46 0 0 Z"
              fill="url(#plant-leaf-sheen)"
            />
            <path
              d="M0 -4 C -2 -24.42 2 -54.07 0 -79.36"
              fill="none"
              stroke="#edf3c9"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity=".78"
            />
            <path
              d="M0 -29.65 Q -8.32 -31.05 -16 -36.63 M0 -29.65 Q 8.32 -31.05 16 -36.63"
              fill="none"
              stroke="#edf3cc"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.43"
            />
            <path
              d="M0 -45.35 Q -11.15 -46.74 -21.44 -52.32 M0 -45.35 Q 11.15 -46.74 21.44 -52.32"
              fill="none"
              stroke="#edf3cc"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.43"
            />
            <path
              d="M0 -61.92 Q -8.82 -63.31 -16.96 -68.89 M0 -61.92 Q 8.82 -63.31 16.96 -68.89"
              fill="none"
              stroke="#edf3cc"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.34"
            />
          </g>
        </g>
        <g id="leaf-position-lower-right" transform="translate(745 702) rotate(57.4)">
          <g id="leaf-lower-right" className="leaf-art" data-start="0.40">
            <path
              d="M0 0 C-8.25 -12.25 -36.3 -17.35 -36.96 -50.02 C-38.28 -76.56 -19.8 -95.96 0 -102.08 C19.8 -95.96 38.28 -76.56 36.96 -50.02 C36.3 -17.35 8.25 -12.25 0 0 Z"
              fill="url(#plant-leaf-b)"
            />
            <path
              d="M0 0 C-8.25 -12.25 -36.3 -17.35 -36.96 -50.02 C-38.28 -76.56 -19.8 -95.96 0 -102.08 C19.8 -95.96 38.28 -76.56 36.96 -50.02 C36.3 -17.35 8.25 -12.25 0 0 Z"
              fill="url(#plant-leaf-sheen)"
            />
            <path
              d="M0 -4 C -2 -28.58 2 -63.29 0 -92.9"
              fill="none"
              stroke="#edf3c9"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity=".78"
            />
            <path
              d="M0 -34.71 Q -8.58 -36.34 -16.5 -42.87 M0 -34.71 Q 8.58 -36.34 16.5 -42.87"
              fill="none"
              stroke="#edf3cc"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.43"
            />
            <path
              d="M0 -53.08 Q -11.5 -54.72 -22.11 -61.25 M0 -53.08 Q 11.5 -54.72 22.11 -61.25"
              fill="none"
              stroke="#edf3cc"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.43"
            />
            <path
              d="M0 -72.48 Q -9.09 -74.11 -17.49 -80.65 M0 -72.48 Q 9.09 -74.11 17.49 -80.65"
              fill="none"
              stroke="#edf3cc"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.34"
            />
          </g>
        </g>
        <g id="leaf-position-middle-left" transform="translate(492 596) rotate(-52.39)">
          <g id="leaf-middle-left" className="leaf-art" data-start="0.49">
            <path
              d="M0 0 C-14.25 -18.48 -62.7 -26.18 -63.84 -75.47 C-66.12 -115.51 -34.2 -144.77 0 -154.01 C34.2 -144.77 66.12 -115.51 63.84 -75.47 C62.7 -26.18 14.25 -18.48 0 0 Z"
              fill="url(#plant-leaf-a)"
            />
            <path
              d="M0 0 C-14.25 -18.48 -62.7 -26.18 -63.84 -75.47 C-66.12 -115.51 -34.2 -144.77 0 -154.01 C34.2 -144.77 66.12 -115.51 63.84 -75.47 C62.7 -26.18 14.25 -18.48 0 0 Z"
              fill="url(#plant-leaf-sheen)"
            />
            <path
              d="M0 -4 C -2 -43.12 2 -95.49 0 -140.15"
              fill="none"
              stroke="#edf3c9"
              strokeWidth="3.8"
              strokeLinecap="round"
              opacity=".78"
            />
            <path
              d="M0 -52.36 Q -14.82 -54.83 -28.5 -64.69 M0 -52.36 Q 14.82 -54.83 28.5 -64.69"
              fill="none"
              stroke="#edf3cc"
              strokeWidth="2.0"
              strokeLinecap="round"
              opacity="0.43"
            />
            <path
              d="M0 -80.09 Q -19.86 -82.55 -38.19 -92.41 M0 -80.09 Q 19.86 -82.55 38.19 -92.41"
              fill="none"
              stroke="#edf3cc"
              strokeWidth="2.0"
              strokeLinecap="round"
              opacity="0.43"
            />
            <path
              d="M0 -109.35 Q -15.71 -111.81 -30.21 -121.67 M0 -109.35 Q 15.71 -111.81 30.21 -121.67"
              fill="none"
              stroke="#edf3cc"
              strokeWidth="2.0"
              strokeLinecap="round"
              opacity="0.34"
            />
          </g>
        </g>
        <g id="leaf-position-middle-right" transform="translate(751 595) rotate(53.79)">
          <g id="leaf-middle-right" className="leaf-art" data-start="0.57">
            <path
              d="M0 0 C-14.25 -18.89 -62.7 -26.76 -63.84 -77.13 C-66.12 -118.06 -34.2 -147.97 0 -157.41 C34.2 -147.97 66.12 -118.06 63.84 -77.13 C62.7 -26.76 14.25 -18.89 0 0 Z"
              fill="url(#plant-leaf-a)"
            />
            <path
              d="M0 0 C-14.25 -18.89 -62.7 -26.76 -63.84 -77.13 C-66.12 -118.06 -34.2 -147.97 0 -157.41 C34.2 -147.97 66.12 -118.06 63.84 -77.13 C62.7 -26.76 14.25 -18.89 0 0 Z"
              fill="url(#plant-leaf-sheen)"
            />
            <path
              d="M0 -4 C -2 -44.07 2 -97.59 0 -143.24"
              fill="none"
              stroke="#edf3c9"
              strokeWidth="3.8"
              strokeLinecap="round"
              opacity=".78"
            />
            <path
              d="M0 -53.52 Q -14.82 -56.04 -28.5 -66.11 M0 -53.52 Q 14.82 -56.04 28.5 -66.11"
              fill="none"
              stroke="#edf3cc"
              strokeWidth="2.0"
              strokeLinecap="round"
              opacity="0.43"
            />
            <path
              d="M0 -81.85 Q -19.86 -84.37 -38.19 -94.45 M0 -81.85 Q 19.86 -84.37 38.19 -94.45"
              fill="none"
              stroke="#edf3cc"
              strokeWidth="2.0"
              strokeLinecap="round"
              opacity="0.43"
            />
            <path
              d="M0 -111.76 Q -15.71 -114.28 -30.21 -124.35 M0 -111.76 Q 15.71 -114.28 30.21 -124.35"
              fill="none"
              stroke="#edf3cc"
              strokeWidth="2.0"
              strokeLinecap="round"
              opacity="0.34"
            />
          </g>
        </g>
        <g id="leaf-position-upper-left" transform="translate(553 509) rotate(-41.89)">
          <g id="leaf-upper-left" className="leaf-art" data-start="0.66">
            <path
              d="M0 0 C-15.25 -20.31 -67.1 -28.77 -68.32 -82.93 C-70.76 -126.94 -36.6 -159.09 0 -169.25 C36.6 -159.09 70.76 -126.94 68.32 -82.93 C67.1 -28.77 15.25 -20.31 0 0 Z"
              fill="url(#plant-leaf-b)"
            />
            <path
              d="M0 0 C-15.25 -20.31 -67.1 -28.77 -68.32 -82.93 C-70.76 -126.94 -36.6 -159.09 0 -169.25 C36.6 -159.09 70.76 -126.94 68.32 -82.93 C67.1 -28.77 15.25 -20.31 0 0 Z"
              fill="url(#plant-leaf-sheen)"
            />
            <path
              d="M0 -4 C -2 -47.39 2 -104.93 0 -154.02"
              fill="none"
              stroke="#edf3c9"
              strokeWidth="3.8"
              strokeLinecap="round"
              opacity=".78"
            />
            <path
              d="M0 -57.54 Q -15.86 -60.25 -30.5 -71.08 M0 -57.54 Q 15.86 -60.25 30.5 -71.08"
              fill="none"
              stroke="#edf3cc"
              strokeWidth="2.0"
              strokeLinecap="round"
              opacity="0.43"
            />
            <path
              d="M0 -88.01 Q -21.25 -90.72 -40.87 -101.55 M0 -88.01 Q 21.25 -90.72 40.87 -101.55"
              fill="none"
              stroke="#edf3cc"
              strokeWidth="2.0"
              strokeLinecap="round"
              opacity="0.43"
            />
            <path
              d="M0 -120.17 Q -16.81 -122.87 -32.33 -133.71 M0 -120.17 Q 16.81 -122.87 32.33 -133.71"
              fill="none"
              stroke="#edf3cc"
              strokeWidth="2.0"
              strokeLinecap="round"
              opacity="0.34"
            />
          </g>
        </g>
        <g id="leaf-position-upper-right" transform="translate(694 507) rotate(44.51)">
          <g id="leaf-upper-right" className="leaf-art" data-start="0.75">
            <path
              d="M0 0 C-15.25 -19.86 -67.1 -28.13 -68.32 -81.08 C-70.76 -124.1 -36.6 -155.54 0 -165.47 C36.6 -155.54 70.76 -124.1 68.32 -81.08 C67.1 -28.13 15.25 -19.86 0 0 Z"
              fill="url(#plant-leaf-b)"
            />
            <path
              d="M0 0 C-15.25 -19.86 -67.1 -28.13 -68.32 -81.08 C-70.76 -124.1 -36.6 -155.54 0 -165.47 C36.6 -155.54 70.76 -124.1 68.32 -81.08 C67.1 -28.13 15.25 -19.86 0 0 Z"
              fill="url(#plant-leaf-sheen)"
            />
            <path
              d="M0 -4 C -2 -46.33 2 -102.59 0 -150.58"
              fill="none"
              stroke="#edf3c9"
              strokeWidth="3.8"
              strokeLinecap="round"
              opacity=".78"
            />
            <path
              d="M0 -56.26 Q -15.86 -58.91 -30.5 -69.5 M0 -56.26 Q 15.86 -58.91 30.5 -69.5"
              fill="none"
              stroke="#edf3cc"
              strokeWidth="2.0"
              strokeLinecap="round"
              opacity="0.43"
            />
            <path
              d="M0 -86.04 Q -21.25 -88.69 -40.87 -99.28 M0 -86.04 Q 21.25 -88.69 40.87 -99.28"
              fill="none"
              stroke="#edf3cc"
              strokeWidth="2.0"
              strokeLinecap="round"
              opacity="0.43"
            />
            <path
              d="M0 -117.48 Q -16.81 -120.13 -32.33 -130.72 M0 -117.48 Q 16.81 -120.13 32.33 -130.72"
              fill="none"
              stroke="#edf3cc"
              strokeWidth="2.0"
              strokeLinecap="round"
              opacity="0.34"
            />
          </g>
        </g>
      </g>
      <g id="growth-flowers" data-start="0.91">
        <g id="flower-top" transform="translate(614 333)" className="flower-head" data-start="0.93">
          <g id="flower-top-bud" className="flower-bud">
            <path
              d="M-15 9 C-17 -9 -12 -25 -1 -31 C10 -25 17 -9 15 9 C5 14 -6 14 -15 9 Z"
              fill="#f4c7bd"
              stroke="#e7a99f"
              strokeWidth="1.8"
            />
            <path d="M0 14 Q-13 6 -16 -2 Q-5 1 0 9 Q5 1 16 -2 Q13 6 0 14 Z" fill="#6d994d" />
          </g>
          <g id="flower-top-petals" className="flower-petals">
            <g transform="rotate(-4) scale(1.0 1.03)">
              <g id="flower-petal-1" className="flower-petal" data-index="0">
                <path
                  d="M0 9 C-17 5 -36 -10 -43 -30 C-52 -50 -45 -69 -27 -79 C-14 -87 12 -89 27 -79 C44 -68 51 -51 43 -30 C36 -10 17 5 0 9 Z"
                  fill="url(#bloom-petal-light)"
                  stroke="#e2aca4"
                  strokeWidth="1.2"
                  strokeOpacity=".5"
                />
                <path
                  d="M0 3 C-1 -18 -1 -43 0 -71"
                  fill="none"
                  stroke="#fffbf2"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeOpacity=".32"
                />
                <path
                  d="M-14 -67 Q-23 -58 -25 -44"
                  fill="none"
                  stroke="#fffefa"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeOpacity=".2"
                />
              </g>
            </g>
            <g transform="rotate(68) scale(0.95 1.0)">
              <g id="flower-petal-2" className="flower-petal" data-index="1">
                <path
                  d="M0 9 C-17 5 -36 -10 -43 -30 C-52 -50 -45 -69 -27 -79 C-14 -87 12 -89 27 -79 C44 -68 51 -51 43 -30 C36 -10 17 5 0 9 Z"
                  fill="url(#bloom-petal-warm)"
                  stroke="#e2aca4"
                  strokeWidth="1.2"
                  strokeOpacity=".5"
                />
                <path
                  d="M0 3 C-1 -18 -1 -43 0 -71"
                  fill="none"
                  stroke="#fffbf2"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeOpacity=".32"
                />
                <path
                  d="M-14 -67 Q-23 -58 -25 -44"
                  fill="none"
                  stroke="#fffefa"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeOpacity=".2"
                />
              </g>
            </g>
            <g transform="rotate(141) scale(0.98 0.97)">
              <g id="flower-petal-3" className="flower-petal" data-index="2">
                <path
                  d="M0 9 C-17 5 -36 -10 -43 -30 C-52 -50 -45 -69 -27 -79 C-14 -87 12 -89 27 -79 C44 -68 51 -51 43 -30 C36 -10 17 5 0 9 Z"
                  fill="url(#bloom-petal-soft)"
                  stroke="#e2aca4"
                  strokeWidth="1.2"
                  strokeOpacity=".5"
                />
                <path
                  d="M0 3 C-1 -18 -1 -43 0 -71"
                  fill="none"
                  stroke="#fffbf2"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeOpacity=".32"
                />
                <path
                  d="M-14 -67 Q-23 -58 -25 -44"
                  fill="none"
                  stroke="#fffefa"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeOpacity=".2"
                />
              </g>
            </g>
            <g transform="rotate(211) scale(1.04 0.95)">
              <g id="flower-petal-4" className="flower-petal" data-index="3">
                <path
                  d="M0 9 C-17 5 -36 -10 -43 -30 C-52 -50 -45 -69 -27 -79 C-14 -87 12 -89 27 -79 C44 -68 51 -51 43 -30 C36 -10 17 5 0 9 Z"
                  fill="url(#bloom-petal-warm)"
                  stroke="#e2aca4"
                  strokeWidth="1.2"
                  strokeOpacity=".5"
                />
                <path
                  d="M0 3 C-1 -18 -1 -43 0 -71"
                  fill="none"
                  stroke="#fffbf2"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeOpacity=".32"
                />
                <path
                  d="M-14 -67 Q-23 -58 -25 -44"
                  fill="none"
                  stroke="#fffefa"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeOpacity=".2"
                />
              </g>
            </g>
            <g transform="rotate(284) scale(0.97 1.04)">
              <g id="flower-petal-5" className="flower-petal" data-index="4">
                <path
                  d="M0 9 C-17 5 -36 -10 -43 -30 C-52 -50 -45 -69 -27 -79 C-14 -87 12 -89 27 -79 C44 -68 51 -51 43 -30 C36 -10 17 5 0 9 Z"
                  fill="url(#bloom-petal-soft)"
                  stroke="#e2aca4"
                  strokeWidth="1.2"
                  strokeOpacity=".5"
                />
                <path
                  d="M0 3 C-1 -18 -1 -43 0 -71"
                  fill="none"
                  stroke="#fffbf2"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeOpacity=".32"
                />
                <path
                  d="M-14 -67 Q-23 -58 -25 -44"
                  fill="none"
                  stroke="#fffefa"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeOpacity=".2"
                />
              </g>
            </g>
          </g>
          <g id="flower-top-center" className="flower-center">
            <circle
              cx="0"
              cy="0"
              r="22"
              fill="url(#bloom-center-gold)"
              stroke="#e7b35f"
              strokeWidth="2.1"
            />
            <circle cx="-5" cy="-6" r="9" fill="#fff1b7" opacity=".35" />
            <circle cx="-9" cy="-10" r="1.65" fill="#c3893d" opacity=".63" />
            <circle cx="3" cy="-12" r="1.5" fill="#c3893d" opacity=".63" />
            <circle cx="12" cy="-4" r="1.3" fill="#c3893d" opacity=".63" />
            <circle cx="10" cy="10" r="1.6" fill="#c3893d" opacity=".63" />
            <circle cx="-1" cy="12" r="1.7" fill="#c3893d" opacity=".63" />
            <circle cx="-13" cy="5" r="1.4" fill="#c3893d" opacity=".63" />
            <circle cx="-4" cy="1" r="1.2" fill="#c3893d" opacity=".63" />
            <circle cx="5" cy="2" r="1.2" fill="#c3893d" opacity=".63" />
          </g>
        </g>
      </g>
      <g id="growth-pot-front">
        <path
          d="M563 806 C580 791 603 789 623 791 C644 791 666 798 681 809 C639 811 597 811 563 806 Z"
          fill="#74553e"
          opacity=".72"
        />
        <path
          d="M591 798 C609 793 632 792 650 799"
          fill="none"
          stroke="#957451"
          strokeWidth="3"
          strokeLinecap="round"
          opacity=".45"
        />
      </g>

      <g
        id="growth-droplets"
        fill="#9bb8ac"
        transform="translate(0 -40) scale(1.9)"
        aria-hidden="true"
      >
        <path
          className="droplet"
          d="M 192 240 Q 173 262 173 278 A 19 19 0 0 0 211 278 Q 211 262 192 240Z"
          opacity="0"
        />
        <path
          className="droplet"
          d="M 235 203 Q 223 218 223 229 A 12 12 0 1 0 247 229 Q 247 218 235 203Z"
          opacity="0"
        />
        <path
          className="droplet"
          d="M 153 300 Q 143 310 143 324 A 11 11 0 1 0 165 324 Q 165 313 153 300Z"
          opacity="0"
        />
      </g>
    </svg>
  );
}
