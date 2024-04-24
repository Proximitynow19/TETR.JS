import WebSocketManager from "../WebSocketManager";

export default async function (ws: WebSocketManager, { data: { endpoint } }: any) {
  clearInterval(ws.heartbeat);
  ws.mayReconnect = false;
  ws.socket?.close();
  await ws.connect(true, endpoint);
  ws.mayReconnect = true;
}
