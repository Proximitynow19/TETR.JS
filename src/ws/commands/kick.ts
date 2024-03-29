import WebSocketManager from "../WebSocketManager";

export default function (ws: WebSocketManager, { data: { reason } }: any) {
  ws.mayReconnect = false;
  clearInterval(ws.heartbeat);
  ws.socket?.close();
  ws.client.emit("kick", reason);
}
