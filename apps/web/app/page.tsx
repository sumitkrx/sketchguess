"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { bulb, globe, play, plus } from "./images";
import Image from "next/image";
import { Nunito } from "next/font/google";

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <h1>SketchGuess</h1>
      <div className={styles.buttonsWrap}>
        <button className={styles.pillButton}>
          <Image src={bulb} alt="light-on" width={24} height={24} />
          <p>How to play</p>
        </button>
        <button className={styles.pillButton}>
          <Image src={globe} alt="globe--v1" width={24} height={24} />
          <p>EN</p>
        </button>
      </div>
    </nav>
  );
};

interface HeroSectionProps {
  name: string;
  code: string;
  setName: (name: string) => void;
  setCode: (code: string) => void;
  handleSubmit: () => void;
}

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
});

const HeroSection = ({
  name,
  code,
  setName,
  setCode,
  handleSubmit,
}: HeroSectionProps) => {
  return (
    <section className={styles.heroSection}>
      <div className={styles.valueProposition}>
        <h4 className={styles.heading}>Doodle it</h4>
        <h4 className={styles.heading}>Guess it</h4>
        <h4 className={styles.heading}>Giggle</h4>
        <p className={`${styles.pre} ${nunito.className}`}>
          {`Grab your friends, take turns drawing a secret word, 
and race to guess before the timer runs 
out.`}
        </p>
        <div className={styles.doodleContainer}>
          <div className={styles.doodleWrap}>
            <Image
              src={"/doodle.png"}
              alt={"doodle-image"}
              width={168}
              height={168}
            />
          </div>
        </div>
      </div>
      <div className={styles.ctAWrap}>
        <div className={styles.ctAForm}>
          <h5 className={`${styles.heading} ${nunito.className}`}>Hop in!</h5>
          <p className={`${styles.subheading} ${nunito.className}`}>
            Pick a look and a name to start.
          </p>
          <AvatarCreator />
          <div className={styles.inputWrap}>
            <label className={`${styles.label} ${nunito.className}`}>
              nickname
            </label>
            <input
              placeholder="Your Nickname"
              value={name}
              className={`${styles.input} ${nunito.className}`}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              maxLength={20}
            />
          </div>
          <button onClick={() => handleSubmit()} className={styles.cta}>
            <div className={styles.ctaContent}>
              <Image src={play} alt={"play-icon"} width={22} height={22} />
              <h6 className={styles.ctaTitle}>Play!</h6>
            </div>
          </button>
          <div className={styles.separatorBody}>
            <span className={styles.separatorTitle}>OR</span>
          </div>
          <div className={styles.secondaryActionWrap}>
            <button
              className={styles.createRoomWrap}
              onClick={() => handleSubmit()}
            >
              <div className={styles.createRoomContent}>
                <Image src={plus} alt={"add-icon"} width={16} height={16} />
                <p className={styles.createRoomTitle}>Create room</p>
              </div>
            </button>
            <input
              value={code}
              placeholder={"CODE"}
              className={styles.joinRoomInput}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              maxLength={6}
            />
            <button
              className={styles.joinRoomButton}
              disabled={code?.length <= 3}
              onClick={() => handleSubmit()}
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return <footer></footer>;
};

const AvatarCreator = () => {
  return <div className={styles.avatarCreatorWrap}></div>;
};

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  function handleSubmit() {
    const n = name.trim();
    if (!n) return;
    const c =
      code !== ""
        ? code.trim().toUpperCase()
        : Math.random().toString(36).slice(2, 6).toUpperCase();
    if (!c) return;

    router.push(`/room/${c}?name=${encodeURIComponent(n)}`);
  }

  return (
    <main className={styles.page}>
      <Navbar />
      <HeroSection
        name={name}
        setName={setName}
        code={code}
        setCode={setCode}
        handleSubmit={handleSubmit}
      />
      <Footer />
    </main>
  );
}
