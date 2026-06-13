"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { bulb, globe, play, plus } from "./images";
import Image from "next/image";
import { Inter } from "next/font/google";

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

const inter = Inter({
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
        <p className={`${styles.pre} ${inter.className}`}>
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
      <div>
        <div>
          <h5>Hop in!</h5>
          <p>Pick a look and a name to start.</p>
          <div>
            <label>nickname</label>
            <input
              placeholder="Your Nickname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              maxLength={20}
            />
          </div>
          <button onClick={() => handleSubmit()}>
            <div>
              <Image src={play} alt={"play-icon"} width={16} height={16} />
              <h6>Play!</h6>
            </div>
          </button>
          <div>
            <span>OR</span>
          </div>
          <div>
            <button>
              <div>
                <Image src={plus} alt={"add-icon"} width={10} height={10} />
                <p>Create room</p>
              </div>
            </button>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              maxLength={6}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return <footer></footer>;
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
