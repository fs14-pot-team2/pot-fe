import Image from "next/image";
import Link from "next/link";
import PageContainer from "../Page/PageContainer";
import CareTypesLink from "./CareTypesLink";
import styles from "./Footer.module.css";

type FooterProps = {
  className?: string;
};

const TEAM_GROUPS = [
  {
    role: "FRONTEND",
    members: [
      { name: "심주원", github: "joowon-shim" },
      { name: "양준원", github: "yangjoonwon" },
      { name: "윤여진", github: "yyjinjin" },
    ],
  },
  {
    role: "BACKEND",
    members: [
      { name: "이상경", github: "chomchomii" },
      { name: "한유진", github: "whitez1p" },
    ],
  },
];

export default function Footer({ className }: FooterProps) {
  return (
    <footer className={[styles.footer, className].filter(Boolean).join(" ")}>
      <PageContainer>
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link href="/" aria-label="POT 홈으로 이동">
              <Image src="/images/logo_pc.svg" alt="POT" width={112} height={70} />
            </Link>

            <p className={styles.slogan}>
              식물과 사람을 잇는
              <br />
              믿을 수 있는 방문 돌봄 서비스
            </p>
          </div>

          <nav className={styles.service} aria-label="하단 서비스 메뉴">
            <h2 className={styles.heading}>서비스</h2>

            <ul className={styles.links}>
              <li>
                <Link href="/">서비스 소개</Link>
              </li>
              <li>
                <CareTypesLink />
              </li>
              <li>
                <Link href="/#story">이용 방법</Link>
              </li>
              <li>
                <Link href="/sitters">팟트너 찾기</Link>
              </li>
            </ul>
          </nav>

          <section className={styles.about}>
            <h2 className={styles.heading}>ABOUT US</h2>
            <p className={styles.teamName}>Team POT · Plant On Trust</p>

            <div className={styles.teamGroups}>
              {TEAM_GROUPS.map((group) => (
                <div key={group.role}>
                  <h3 className={styles.role}>{group.role}</h3>

                  <ul className={styles.links}>
                    {group.members.map((member) => (
                      <li key={member.github}>
                        <a
                          className={styles.githubLink}
                          href={`https://github.com/${member.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {member.name}
                          <Image src="/icons/ic_github.svg" alt="" width={16} height={16} />
                          <span aria-hidden="true">↗</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <a
              className={styles.repository}
              href="https://github.com/fs14-pot-team2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image src="/icons/ic_github.svg" alt="" width={24} height={24} />
              Project GitHub
              <span aria-hidden="true">↗</span>
            </a>
          </section>
        </div>

        <div className={styles.bottom}>
          <p className={styles.notice}>
            POT은 반려식물 돌봄이 필요한 사람과 돌봄을 제공하는 사람을 연결하는 플랫폼입니다. 개별
            돌봄 서비스의 계약 및 이행은 팟오너와 팟트너 간의 합의를 통해 이루어집니다.
          </p>

          <div className={styles.copyright}>
            <p>© 2026 POT (Plant On Trust). All rights reserved.</p>
            <p>Made with care for plants.</p>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
