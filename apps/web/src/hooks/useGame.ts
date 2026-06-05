import {useCallback, useEffect, useReducer, useRef} from "react";
import {gameReducer, initialState} from "@/lib/gameReducer";
import {ClientMessage, ServerMessage} from "@sketchguess/shared-types";

export function useGame(code: string, name: string) {
    const [state, dispatch] = useReducer(gameReducer,initialState);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if(!code || !name) return;
        const url = process.env.NEXT_PUBLIC_URL ?? "ws://localhost:4000/ws";
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
            dispatch({type: "CONNECTED"});
            ws.send(JSON.stringify({type: "join_room", payload: { code, name }} satisfies  ClientMessage));
        }

        ws.onmessage = (evt) => {
            try {
                dispatch({type:"SERVER_MSG", msg: JSON.parse(evt.data as string) as ServerMessage });
            } catch (evt) {
                console.error("[ws] parse error", evt);
            }
        }
        ws.onclose = () => dispatch({type: "DISCONNECTED"});
        ws.onerror = (evt) => console.error("[ws] parse error", evt);

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({type: "leave_room", payload: {}} satisfies ClientMessage));
            }
            ws.close();
        }

    }, [code, name]);

    const send = useCallback((msg:ClientMessage)=>{
        if(wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(msg));
        }
    },[])

    return { state, send };
}