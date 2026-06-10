"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<"join" | "create">("create");

  function handleSubmit() {
    const n = name.trim();
    if (!n) return;
    const c =
      mode === "create"
        ? Math.random().toString(36).slice(2, 6).toUpperCase()
        : code.trim().toUpperCase();
    if (!c) return;
    router.push(`/room/${c}?name=${encodeURIComponent(n)}`);
  }

  return (
    <main className={styles.page}>
      <nav className={styles.navbar}>
        <h1>SketchGuess</h1>
        <div className={styles.buttonsWrap}>
          <button className={styles.pillButton}>
            <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAC8klEQVR4nO2ZTYiNURjHf9fIYExK3eZmozSZyCyYGAsihWysRmNFNjZW9mQwm/FRJLGxlJooKawQyrcxDA0WGiZDvmJYTKhXZ/q/dZpm7nvfO+/zzmvcX516O/ec53+e832eCxVK5gbwgElAoPTPE1QcyRiTxpFbwE0ywi7gIpBPUTMPnAd2Jmn0gqZHD1CHPXXScprnku6d0PBzoDBGuRzQBOwHrgMvgJ9KvcrbBywtolWQRthxeYteCgW6R3GgFXjpLe6o5MpuVl2fJ16HmY1+QU7c9fLqgfteA/uAY8B6oAGoUXLfG/Rbn1fe2Zrv2bsHPC4y6iasAj6qQf3ADqCqhHpTNBqvVfcLsJYJwgn/UkM6gZll2KjRYg5kaw0pU69edA04OMo8j4Ore1i2Po+YZqbkvDXROU4nfJvhyNxJyGYkrRJ8U+Z0KjbN3sp2C8bkvC12m4H97bLdaz0qTd4W63aepKnSSDuNJRhyQCJHDTWOS6PNUGP4ihHoYLNiozSuGmrwSiJu+7WiQRrunlYWs0ZcHcLk3hMhg8qrxY5aaQzGaFdJjviPoiHlVRs6Ui2NoRjtik14r7J8kxSk8cFQY/jUdSIrjS+iAXDbUIMTEtlrqLFHGk7LjE3eo8eKHmk4LdOFGK6TZsObwyfjDWWY3d72lzM6cNtIgRnefWhrgna3eC9NdxNOhRaJ/gAWJWBvAfBdNp1DqXLSu0rMGYed2cAz2TrNBFCtCEig/0DKWZzTgGuy8UjTNhXcqftQByM64cNIyNmYi9+VPaO67mU4V/ldwFPLcJAfoOvyGr0Q+FrGbtOmOt+ARi+/2zJAFxUyXQ38VkhncQn2GlX+D7AuzZDplRKC2B0q4zaBKE6prAsDRQWxL5Mg7cCliN6ZFyPuGyZXZyzy0nTP69SJ60hmCSqOZIzAa2CzvpdFlMskgdfAFfpeHlEuk7yPMa3ekWGOxHDkEBlmupwZKOLAgA5C8xdgUkzVQdqv1K68Cv8FfwG4ZkBrIJzHhwAAAABJRU5ErkJggg=="
              alt="light-on"
            />
            <p>How to play</p>
          </button>
          <button className={styles.pillButton}>
            <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFM0lEQVR4nO2a2W9VVRTGf61BRaW0Di++iLTw5IDDg1ERp2g0mjhQVBK1ElBwqmjC4JM4NTxo9B+oGJ8cMCZiEHGWiAoiDikyqC8OlRrEgoJYe8xKvk1WNueec+695xZq+JKT9J717XXOOntYa3+7cBiFMV7XqEE7MAdYBnwK7ACS6Nohm3Fmq80hgTZgPvBFyksXvTYAD8jXiOMEYCkw6F7I/h5yv18ELnS/pwIvud9DUfs/gJ6RCqgJmAUMuBd4E7gZWKzffwG3uTaBF3A7sEf3rM0twCrH2w506VkNwfHAa+6BHwIXyHYx8A8wDEyP2sWBGDrFtTbTdM967yPHf7URvTMZ+N4NIfuqAWOATbI9ktI2LRDDo7q/ST4CrDd2ybYN6CgriLOAX+V4fYrjB2X7FjiyikCMu1k28+ExCfhcNnv2lDJ6IgTxLnBcZB+rMW32qyr4qBSI4Wo3L8yXxzjgfRdMzT3T5oZTH3BMCudO2b/M8JMVCGqbKK/EONYN261AK1WiKZrYYejcEzn7RLZ5dQQyT/a17t543Q9DL1zLq13NZrmJvRD4zjnbp+VyseO01BFIi5vcC4A3gL2unfXEQy7n+IUmN9kNRF/6CC2rqxSI/0q7df9ZYC5wJXAuMFG9F3ituneOOHcBTwMrXSCJS5artUzbs9FoCPOl0LK8VA0+AJor5JMuN8nLvAZUr52Y8txml2esAshEm+vCkOzSYON0p3jnAddoWPTqS67XQvG7e8mdumfL6tsqHBcB1wHnO05TxnOnunIms1dCTliTE/Ak8X4kH3lzJOBn8fIq4o/F684ihSr2hhxnneK9XmIgK8SbXvDZ1uupaBfhT+DoHGc94i4pMZDHxHsihzdWhalxJ6QR5shoXyYPy8WdUWIgVkEb7+UC3JXiWpo4AM/LeF8BR6F0uKTEQC51pVAeusV9Ls34mYxWkufhG3FPKzGQM8T7qgD38pRqYD/CHvvUKlaYk0sMxHwl8p2HMJ9/S0s2w8qofm9QCX/LUVrZXmsg5mtYvvPqqTF613/jpN3SgCw9Ute4/2UgzTUOraNKHFrmK1HlS61Da7RN9omVJjtSAIsuv1+Le3qJgZxZYLcZcJm4VncdgGWjMCH2phlny2g7tDy8Iu5Nh2KJ0u6KxljRiPGkuKZNHcyi8ZRKpA0i3FiwlF5RYiA2Eqop49dlkeaLZHVXFjrE+6nEQH4Rz1akLKwV7/4sUpu2kYm02CJbXdumXi9V5QVNVtug/eA4lba6tj2+VtvlwMkqTy5yvFyNq8eJ1Gniw0nau3hFvqxru4QNEzhiNGsLXmQe7e+VoJCYBIMkGdtEvROdgSSScmwVeUoBWol9thJrJTnoCslBz0hK2h353Ae8FclB98rWX43i2KVGgxLHtrqH7NUkX+ACqVegG1SJtEjnLaEESiQOLnTqzq1UgSadT8SS6dzopRslmbYCd+uZ/h2K5JjUIbbNidgmKFcSsTfWEcjGHBG7T/Yt9ZwOd7hjhffikrnBxwotrhTqL+MEeIocJUqYJs6liXqb6zjosfzlMdlpbP0qKEtBhxtmu7QYpB29LakikFCS9EV7oDucqL2lEWfxrU7PSrSmh6Q5zR2GdhYIZIY7DLUkF3TdNdHEbth/TDTpfCLMm0Tr/UzgYf3eE/VYHEhXdDw9U8J34PVXu8TWgzZVAKGcSfT3UPRF438YCOV/pX8YeLyW47WyAuqWoFxrWbJOPg5KAGmYoI1OrxJlWi02oMTXK27F/cShiJacEuYwcPgPknvUyL7T8dYAAAAASUVORK5CYII="
              alt="globe--v1"
            />
            <p>EN</p>
          </button>
        </div>
      </nav>
      <div>
        <div>
          <p>Draw it. Guess it. Win it.</p>
        </div>

        <div>
          {(["create", "join"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}>
              {m === "create" ? "Create room" : "Join room"}
            </button>
          ))}
        </div>

        <div>
          <input
            placeholder="Your nickname"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            maxLength={20}
          />
          {mode === "join" && (
            <input
              placeholder="Room code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              maxLength={6}
            />
          )}
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || (mode === "join" && !code.trim())}
          >
            {mode === "create" ? "Create & Join →" : "Join Room →"}
          </button>
        </div>
      </div>
    </main>
  );
}
