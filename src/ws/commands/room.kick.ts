import WebSocketManager from "../WebSocketManager";

export default async function ({ client: { room } }: WebSocketManager, { data }: any) {
  room.id = undefined;
  room.name = undefined;
  room.nameSafe = undefined;
  room.type = undefined;
  room.owner = undefined;
  room.creator = undefined;
  room.state = undefined;
  room.topic = undefined;
  room.auto = undefined;
  room.options = undefined;
  room.userLimit = undefined;
  room.autoStart = undefined;
  room.allowAnonymous = undefined;
  room.allowUnranked = undefined;
  room.allowBots = undefined;
  room.userRankLimit = undefined;
  room.useBestRankAsLimit = undefined;
  room.forceRequireXPToChat = undefined;
  room.bgm = undefined;
  room.match = undefined;
  room.players = undefined;

  room.emit("kick", data);
}
