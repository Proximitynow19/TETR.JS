import WebSocketManager from "../WebSocketManager";

export default function (ws: WebSocketManager, { data: { reason } }: any) {
  clearInterval(ws.heartbeat);
  ws.socket?.close();

  throw new Error(reason);
}
