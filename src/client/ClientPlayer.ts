import EventEmitter from "node:events";
import Player from "../game/Player";
import WebSocketManager from "../ws/WebSocketManager";

const full = {
  successful: false,
  // not needed for init
  gameoverreason: null,
  replay: {},
  source: {},
  stats: {
    lines: 0,
    level_lines: 0,
    level_lines_needed: 1,
    inputs: 0,
    holds: 0,
    time: {
      start: 0,
      zero: true,
      locked: false,
      prev: 0,
      frameoffset: 0,
    },
    score: 0,
    zenlevel: 1,
    zenprogress: 0,
    level: 1,
    combo: 0,
    currentcombopower: 0,
    topcombo: 0,
    btb: 0,
    topbtb: 0,
    currentbtbchainpower: 0,
    tspins: 0,
    piecesplaced: 0,
    clears: {
      singles: 0,
      doubles: 0,
      triples: 0,
      quads: 0,
      pentas: 0,
      realtspins: 0,
      minitspins: 0,
      minitspinsingles: 0,
      tspinsingles: 0,
      minitspindoubles: 0,
      tspindoubles: 0,
      tspintriples: 0,
      tspinquads: 0,
      tspinpentas: 0,
      allclear: 0,
    },
    garbage: {
      sent: 0,
      received: 0,
      attack: 0,
      cleared: 0,
    },
    kills: 0,
    finesse: {
      combo: 0,
      faults: 0,
      perfectpieces: 0,
    },
  },
  diyusi: 0,
  enemies: [],
  targets: [],
  // not needed for init
  fire: 0,
  game: {
    hold: {
      piece: null,
      locked: false,
    },
    controlling: {
      ldas: 0,
      ldasiter: 0,
      lshift: false,
      rdas: 0,
      rdasiter: 0,
      rshift: false,
      lastshift: 0,
      softdrop: false,
    },
    playing: true,
  },
  killer: {
    gameid: null,
    name: null,
    type: "sizzle",
  },
  aggregatestats: {
    apm: 0,
    pps: 0,
    vsscore: 0,
  },
};

export default class ClientPlayer extends EventEmitter {
  constructor(ws: WebSocketManager, me: Player) {
    super();

    this.frames = [
      {
        type: "full",
        data: {
          ...full,
          options: me.player_.options,
          stats: { ...full.stats, seed: me.options.seed },
          game: {
            ...full.game,
            bag: me.nextPieces,
            board: new Array(
              me.options.boardHeight + me.player_.options.boardbuffer
            ).fill(new Array(me.options.boardWidth).fill(null)),
            g: me.options.g,
            handling: me.player_.options.handling,
          },
        },
      },
      { type: "start", data: {} },
      // {
      //   type: "ige",
      //   data: {
      //     data: {
      //       frame: this.frame,
      //       targets: ws.client.room.game
      //         ? [...ws.client.room.game.players.entries()]
      //             .filter((entry) => entry[1].id !== me.id)
      //             .map((entry) => entry[1])
      //         : [],
      //       type: "target",
      //     },
      //     frame: this.frame,
      //     id: 0,
      //     type: "ige",
      //   },
      // },
      // {
      //   type: "ige",
      //   data: {
      //     data: { frame: this.frame, type: "allow_targeting", value: false },
      //     frame: this.frame,
      //     id: 1,
      //     type: "ige",
      //   },
      // },
    ];

    me.resetPieces();

    // let z = this.frames[0].data;

    // console.log(z.stats.seed);
    // console.log(z.game.bag);
    // console.log(z.game.board);
    // console.log(z.game.g);
    // console.log(z.game.handling);

    this.ws = ws;
    this.player = me;
  }

  private ws: WebSocketManager;
  private frames: { type: string; data: any }[];
  private replayTimeout?: NodeJS.Timeout;
  private firstFrame = 0;

  public player: Player;

  public get subframe(): number {
    return (((Date.now() - this.firstFrame) / 1000) * 60) % 1;
  }

  public get frame(): number {
    return Math.floor(((Date.now() - this.firstFrame) / 1000) * 60);
  }

  public start() {
    this.firstFrame = Date.now();
    this.replay();
    this.emit("start", this);
    setInterval(() => {
      if (this.frames.length > 0) this.replay();
    }, 1000 / 60);
  }

  private replay() {
    clearTimeout(this.replayTimeout);

    this.ws.send({
      command: "replay",
      data: {
        frames: this.frames.splice(0).map((frame) => {
          return { ...frame, frame: this.frame };
        }),
        gameid: this.player?.id,
        provisioned: this.frame,
      },
    });

    this.replayTimeout = setTimeout(() => {
      this.replay();
    }, 500);
  }

  public async hardDrop() {
    this.frames.push({
      type: "keydown",
      data: { key: "hardDrop", subframe: this.subframe },
    });
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        this.frames.push({
          type: "keyup",
          data: { key: "hardDrop", subframe: this.subframe },
        });

        resolve();
      });
    });
  }

  public async softDrop() {
    this.frames.push({
      type: "keydown",
      data: { key: "softDrop", subframe: this.subframe },
    });
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        this.frames.push({
          type: "keyup",
          data: { key: "softDrop", subframe: this.subframe },
        });

        resolve();
      });
    });
  }

  // unreliable between frames arr activates
  public async moveLeft(arr = false) {
    this.frames.push({
      type: "keydown",
      data: { key: "moveLeft", subframe: this.subframe },
    });
    await new Promise<void>((resolve) => {
      setTimeout(
        () => {
          this.frames.push({
            type: "keyup",
            data: { key: "moveLeft", subframe: this.subframe },
          });

          resolve();
        },
        arr ? (this.player.player_.options.handling.das / 60) * 1000 : 0
      );
    });
  }

  // unreliable between frames arr activates
  public async moveRight(arr = false) {
    this.frames.push({
      type: "keydown",
      data: { key: "moveRight", subframe: this.subframe },
    });
    await new Promise<void>((resolve) => {
      setTimeout(
        () => {
          this.frames.push({
            type: "keyup",
            data: { key: "moveRight", subframe: this.subframe },
          });

          resolve();
        },
        arr ? (this.player.player_.options.handling.das / 60) * 1000 : 0
      );
    });
  }

  public async rotateCW() {
    this.frames.push({
      type: "keydown",
      data: { key: "rotateCW", subframe: this.subframe },
    });
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        this.frames.push({
          type: "keyup",
          data: { key: "rotateCW", subframe: this.subframe },
        });

        resolve();
      });
    });
  }

  public async rotateCCW() {
    this.frames.push({
      type: "keydown",
      data: { key: "rotateCCW", subframe: this.subframe },
    });
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        this.frames.push({
          type: "keyup",
          data: { key: "rotateCCW", subframe: this.subframe },
        });

        resolve();
      });
    });
  }

  public async rotate180() {
    this.frames.push({
      type: "keydown",
      data: { key: "rotate180", subframe: this.subframe },
    });
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        this.frames.push({
          type: "keyup",
          data: { key: "rotate180", subframe: this.subframe },
        });

        resolve();
      });
    });
  }

  public async hold() {
    this.frames.push({
      type: "keydown",
      data: { key: "hold", subframe: this.subframe },
    });
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        this.frames.push({
          type: "keyup",
          data: { key: "hold", subframe: this.subframe },
        });

        resolve();
      });
    });
  }
}

export default interface ClientPlayer extends EventEmitter {
  on(eventName: "start", listener: (me: ClientPlayer) => void): this;
}
