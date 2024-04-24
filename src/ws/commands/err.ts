import WebSocketManager from "../WebSocketManager";

export default function (ws: WebSocketManager, { data }: any) {
  ws.client.emit("err", data);
}
