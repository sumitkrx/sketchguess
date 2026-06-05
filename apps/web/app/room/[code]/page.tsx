import { Suspense } from "react";
import RoomClient from "./RoomClient";

export default function RoomPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <p className="text-slate-400 animate-pulse">Connecting…</p>
            </div>
        }>
            <RoomClient />
        </Suspense>
    );
}