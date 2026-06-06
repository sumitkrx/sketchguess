import { useState, useEffect } from "react";

export function useTimer(endsAt: number | null): number {
    const [remaining, setRemaining] = useState<number>(0);

    useEffect(() => {
        if(!endsAt) { setRemaining(0); return; }
        const tick = () => setRemaining(Math.max(0,
            Math.round(endsAt - Date.now()) / 1000)
        );

        tick();
        const id = setInterval(tick,500);
        return () => clearInterval(id);
    }, [endsAt]);
    return remaining;
}