import { Leaderboard } from "../../game/Game";
import Player from "../../game/Player";
import WebSocketManager from "../WebSocketManager";

export default async function (ws: WebSocketManager, { data }: any) {
  if (!ws.client.room?.game) return;
  let leaderboard: Leaderboard[] = [];
  let victor!: Player;

  (data.leaderboard as any[]).forEach((x) => {
    let player = [...(ws.client.room.game?.players as Map<string, Player>).values()].find(
      (k) => k.user.id === x.id
    ) as Player;
    if (x.success) victor = player;
    leaderboard.push({
      player,
      success: x.success,
      wins: x.wins,
      active: x.active,
      inputs: x.inputs,
      naturalorder: x.naturalorder,
      piecesplaced: x.piecesplaced,
    });
  });

  ws.client.room.game.ended = true;
  ws.client.room.game.endData = data;
  ws.client.room.game.replaySaved = new Promise((resolve) => {
    setTimeout(() => {
      if (data.currentboard.length == 1) return void resolve();
      ws.client.room.game?.replayData.push({
        board: data.currentboard,
        replays: (data.currentboard as any[]).map((x) => {
          let player = [...(ws.client.room.game?.players as Map<string, Player>).values()].find(
            (k) => k.user.id === x.id
          ) as Player;
          if (player.replayFrames.length == 0) return {};
          return { frames: player.replayFrames.at(-1).frame, events: player.replayFrames };
        }),
      });
      ws.client.room.game?.players.forEach((v, k) => {
        v.replayFrames = [];
        ws.client.room.game?.players.set(k, v);
      });
      resolve();
    }, 100);
  });
  ws.client.room.game.me?.end();

  ws.client.room.game.emit("score", leaderboard, victor);

  ws.client.room.emit("end", leaderboard, victor);
}
