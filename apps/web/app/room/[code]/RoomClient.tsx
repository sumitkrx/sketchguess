"use client";
import dynamic from "next/dynamic";
import React from "react";
import styles from "./roomclient.module.css";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useGame } from "@/hooks/useGame";
import DrawingTools from "@/components/game/DrawingTools";
import ChatPanel from "@/components/game/ChatPanel";
import PlayerList from "@/components/game/PlayerList";
import GameHeader from "@/components/game/GameHeader";
import WordPicker from "@/components/game/WordPicker";
import type { ClientMessage, Player } from "@sketchguess/shared-types";
import Image from "next/image";
import { leave, send as SendIcon, copy } from "../../images";

const LobbyNavbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navbar_title_wrap}>
        <h3 className={styles.navbar_title}>SketchGuess</h3>
      </div>
      <div>
        <div></div>
        <button className={styles.cta}>
          <div className={styles.navbar_cta_wrap}>
            <Image src={leave} alt={"leave-icon"} width={16} height={16} />
            <p className={styles.cta_title}>Leave</p>
          </div>
        </button>
      </div>
    </nav>
  );
};

const DrawingCanvas = dynamic(() => import("@/components/game/DrawingCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[4/3] bg-white rounded-xl animate-pulse" />
  ),
});

export default function RoomClient() {
  const router = useRouter();
  const params = useParams();
  const search = useSearchParams();

  const code = (params.code as string).toUpperCase();
  const name = search.get("name") ?? "";

  useEffect(() => {
    if (!name) router.replace("/");
  }, [name, router]);

  const { state, send } = useGame(code, name);
  const { room, myId, connected } = state;

  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(6);
  const [clearKey, setClearKey] = useState(0);
  const [message, setMessage] = useState("");
  const me = room
    ? (room.players?.find((p) => p.id === myId) as Player)
    : ({} as Player);
  const ready = 4;
  const waiting = 1;

  function handleMessageInput(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setMessage(value);
  }

  // reset canvas when a new round starts
  useEffect(() => {
    setClearKey((k) => k + 1);
  }, [room?.roundNumber]);

  function handleClear() {
    setClearKey((k) => k + 1);
    send({ type: "clear_canvas", payload: {} } satisfies ClientMessage);
  }

  // ── loading ──────────────────────────────────────────────────────────────
  if (!connected || !room) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400 animate-pulse">
          {connected ? "Joining room…" : "Connecting to server…"}
        </p>
      </div>
    );
  }

  // ── lobby ─────────────────────────────────────────────────────────────────
  if (room.phase === "lobby") {
    const isHost = room.hostId === myId;
    return (
      <main className={styles.page}>
        <LobbyNavbar />
        <section className={styles.lobby_body}>
          <div className={styles.left}>
            <div className={styles.header}>
              <div>
                <div>
                  <p>private room</p>
                  <h4>{`${me.name}'s Doodle Den`}</h4>
                </div>
                <div>
                  <p>room code</p>
                  <div>
                    <h5>{code}</h5>
                    <button>
                      <Image
                        src={copy}
                        alt={"copy-icon"}
                        width={16}
                        height={16}
                      />
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <div>{`${window.location}`}</div>
                <button>
                  <Image src={copy} alt={"copy-icon"} width={16} height={16} />
                  <p>Copy invite</p>
                </button>
              </div>
            </div>
            <section className={styles.lobby}>
              <div>
                <h3>Players</h3>
                <p>
                  {`${ready} ready `}
                  <span>&#xb7;</span>
                  {` waiting on ${waiting}`}
                </p>
              </div>
              <div></div>
            </section>
            <div className={styles.footer}>
              <input
                className={styles.messageInput}
                value={message}
                onChange={handleMessageInput}
                maxLength={80}
              />
              <button
                className={styles.sendCTA}
                disabled={message?.trim() === ""}
              >
                <Image
                  src={SendIcon}
                  alt={"send-icon"}
                  width={24}
                  height={24}
                />
              </button>
            </div>
          </div>
          <div className={styles.right}></div>
        </section>
        <div>
          <div>
            <p>Room code</p>
            <div>{code}</div>
            <p>Share with friends</p>
          </div>
          <ul>
            {room.players.map((p) => (
              <li key={p.id}>
                <span>{p.id === room.hostId ? "👑" : "🎮"}</span>
                <span>{p.name}</span>
                {p.id === myId && <span>you</span>}
              </li>
            ))}
          </ul>
          {isHost ? (
            <button
              onClick={() =>
                send({
                  type: "start_game",
                  payload: {},
                } satisfies ClientMessage)
              }
              disabled={room.players.length < 2}
            >
              {room.players.length < 2
                ? "Waiting for players…"
                : "Start Game 🚀"}
            </button>
          ) : (
            <p>
              Waiting for{" "}
              <span>
                {room.players.find((p) => p.id === room.hostId)?.name ?? "host"}
              </span>{" "}
              to start…
            </p>
          )}
        </div>
      </main>
    );
  }

  // ── game ended ────────────────────────────────────────────────────────────
  if (room.phase === "ended") {
    const sorted = [...room.players].sort((a, b) => b.score - a.score);
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-sm border border-slate-700 text-center">
          <div className="text-5xl mb-3">🏆</div>
          <h2 className="text-2xl font-bold text-white mb-6">Game Over!</h2>
          <ul className="space-y-2 mb-6">
            {sorted.map((p, i) => (
              <li
                key={p.id}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-700"
              >
                <span className="text-xl">{["🥇", "🥈", "🥉"][i] ?? "🎮"}</span>
                <span className="text-white font-medium flex-1">{p.name}</span>
                <span className="font-mono text-slate-300">{p.score} pts</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => router.replace("/")}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors"
          >
            Play again
          </button>
        </div>
      </main>
    );
  }

  // ── main game view ────────────────────────────────────────────────────────
  const isDrawer = room.currentDrawerId === myId;

  return (
    <div className="h-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* word picker overlay */}
      {room.phase === "word_pick" && isDrawer && state.wordOptions && (
        <WordPicker
          words={state.wordOptions}
          onPick={(w) =>
            send({
              type: "pick_word",
              payload: { word: w },
            } satisfies ClientMessage)
          }
        />
      )}

      {/* header */}
      <GameHeader
        room={room}
        myId={myId}
        wordToDraw={state.wordToDraw}
        wordHint={state.wordHint}
        lastWord={state.lastWord}
      />

      {/* main */}
      <div className="flex flex-1 min-h-0 gap-2 p-2">
        {/* canvas column */}
        <div className="flex flex-col flex-1 min-w-0 gap-2">
          <DrawingCanvas
            strokes={state.strokes}
            isDrawer={isDrawer}
            myId={myId ?? ""}
            color={color}
            brushSize={brushSize}
            clearKey={clearKey}
            onStroke={(s) =>
              send({ type: "stroke", payload: s } satisfies ClientMessage)
            }
          />
          {isDrawer && (
            <DrawingTools
              color={color}
              brushSize={brushSize}
              onColor={setColor}
              onSize={setBrushSize}
              onClear={handleClear}
            />
          )}
        </div>

        {/* sidebar */}
        <div className="flex flex-col w-64 shrink-0 gap-2 min-h-0">
          <PlayerList
            players={room.players}
            currentDrawerId={room.currentDrawerId}
            myId={myId}
          />
          <ChatPanel
            messages={state.messages}
            onSend={(t) =>
              send({
                type: "chat",
                payload: { text: t },
              } satisfies ClientMessage)
            }
          />
        </div>
      </div>
    </div>
  );
}
