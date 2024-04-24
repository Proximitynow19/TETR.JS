import WebSocketManager from "../ws/WebSocketManager";
import User from "../user/User";
import EventEmitter from "node:events";
import Game, { Leaderboard } from "../game/Game";
import Player from "../game/Player";

function flattenObject(obj: Record<string, any>, prefix = "") {
  return Object.keys(obj).reduce((acc: Record<string, any>, key) => {
    const pre = prefix.length ? prefix + "." : "";

    if (typeof obj[key] === "object" && obj[key] !== null) {
      Object.assign(acc, flattenObject(obj[key], pre + key));
    } else {
      acc[pre + key] = obj[key];
    }

    return acc;
  }, {});
}

/** Represents the Client's room status. */
export default class Room extends EventEmitter {
  constructor(ws: WebSocketManager) {
    super();

    this.ws = ws;
  }

  private ws: WebSocketManager;

  /** Gameplay events for this room */
  public game?: Game;
  /** The room ID. */
  public id?: string;
  /** Name this room will display in the listing as. */
  public name?: string;
  /** unknown */
  public nameSafe?: string;
  /** Visibility status of the room. */
  public type?: "public" | "private";
  /** User object of the current host. */
  public owner?: User;
  /** User object who created the room. */
  public creator?: User;
  /** unknown */
  public state?: string;
  /** unknown */
  public topic?: any;
  /** Autostart settings. */
  public auto?: {
    /** unknown */
    enabled: boolean;
    /** unknown */
    status: string;
    /** unknown */
    time: number;
    /** unknown */
    maxTime: number;
  };
  /** Information regarding gameplay settings. */
  public options?: GameOptions;
  /**
   *  Maximum players in this room. (0 = no limit.)
   *
   * @remarks
   * Does not apply retroactively.
   */
  public userLimit?: number;
  /** Countdown until the room start. (0 = to disable) */
  public autoStart?: number;
  /**
   * Whether to allow anonymous users to enter this room.
   *
   * @remarks
   * Does not apply retroactively.
   */
  public allowAnonymous?: boolean;
  /** Whether to allow unranked users to play in this room. */
  public allowUnranked?: boolean;
  /** unknown */
  public allowBots?: boolean;
  /** The maximum TETRA LEAGUE rank players may have to play in this room. */
  public userRankLimit?: string;
  /** If a rank limit is set, use the players' top ranks instead of their current ranks. */
  public useBestRankAsLimit?: boolean;
  /** unknown */
  public forceRequireXPToChat?: boolean;
  /** Background song to play. If random, not everyone will hear the same song. */
  public bgm?: string;
  /** unknown */
  public match?: {
    /** Game mode. */
    gameMode: string;
    /** unknown */
    modeName: string;
    /** Amount of rounds one must win to win the game. */
    ft: number;
    /** Amount of points one must have over the second place to secure the win. */
    wb: number;
    /** unknown */
    recordReplays: boolean;
    /** unknown */
    winningKey: string;
    /** unknown */
    keys: any;
    /** unknown */
    extra: any;
  };
  /** The present players in the room. */
  public players?: Map<string, Member>;

  /**
   * Join an existing room.
   * @param room The room ID to join
   *
   * @returns The room object of the joined room
   *
   * @example
   * ```
   * await client.room.join("FEFE");
   * ```
   */
  public async join(room: string): Promise<Room> {
    this.ws.send({
      command: "room.join",
      data: room.split("#")[room.split("#").length - 1],
    });
    return await new Promise<Room>((resolve) => {
      this.ws.once("room.update", () => {
        return resolve(this);
      });
    });
  }

  /**
   * Leave's the current room.
   */
  public async leave(): Promise<void> {
    this.ws.send({ command: "room.leave" });
    await new Promise<void>((resolve) => {
      this.ws.once("room.leave", resolve);
    });
  }

  /**
   * Creates a new room.
   * @param data The visibility status of the room
   *
   * @returns The newly created room
   *
   * @example
   * ```
   * await client.room.create("public")
   * ```
   */
  public async create(data: "public" | "private" = "private"): Promise<Room> {
    this.ws.send({ command: "room.create", data: data === "public" });
    return await new Promise<Room>((resolve) => {
      this.ws.once("room.update", () => {
        return resolve(this);
      });
    });
  }

  /**
   * Send a message in the room chat.
   * @param data The content of the message to send
   * @param announce Whether to announce the message
   *
   * @example
   * ```
   * client.room.chat("Hello World!");
   * ```
   */
  public chat(data: string, announce: boolean = false): void {
    this.ws.send({
      command: "room.chat.send",
      data: { content: data, pinned: announce },
    });
  }

  /**
   * Switch a player's bracket in the room. Defaults to the client's player.
   * @param data The new bracket to switch to
   * @param player The target player
   *
   * @example
   * ```
   * // Change the client's player bracket
   * client.room.bracketSwitch("player");
   * ```
   *
   * @example
   * ```
   * // Change the player's bracket on command
   * client.room.on("chat", (message) => {
   *  if (message.content === "!s")
   *    return client.room.bracketSwitch("spectator", message.player);
   * })
   * ```
   */
  public bracketSwitch(data: "spectator" | "player", player?: Member): void {
    if (player)
      return this.ws.send({
        command: "room.bracket.move",
        data: { uid: player.user.id, bracket: data },
      });

    this.ws.send({ command: "room.bracket.switch", data });
  }

  /**
   * Transfer the host privileges to a present player.
   * @param player The player to receive host
   *
   * @example
   * ```
   * // Receive host on bracket switch
   * client.room.on("bracket", (player) => {
   *  if (player.user.id !== client.me.user.id)
   *    client.room.ownerTransfer(player);
   * })
   * ```
   */
  public ownerTransfer(player: Member): void {
    this.ws.send({ command: "room.owner.transfer", data: player.user.id });
  }

  public start(): void {
    this.ws.send({ command: "room.start" });
  }

  public setConfig(config: { index: string; value: any }[] | Record<string, any>) {
    if (!Array.isArray(config)) {
      this.ws.send({
        command: "room.setconfig",
        data: Object.entries(flattenObject(config)).map(([index, value]) => ({
          index,
          value: typeof value == "boolean" ? value : String(value),
        })),
      });
    } else {
      this.ws.send({
        command: "room.setconfig",
        data: config,
      });
    }
  }
}

export default interface Room extends EventEmitter {
  /**  Emitted when a player joins the room. */
  on(eventName: "join", listener: (player: Member) => void): this;

  /** Emitted when the the client gets kicked or banned from the room. */
  on(eventName: "kick", listener: (type: string) => void): this;

  /** Emitted when a player sends a message. */
  on(eventName: "chat", listener: (message: { content: string; author: Member }) => void): this;

  /** Emitted when a player leaves the room. */
  on(eventName: "leave", listener: (player: User) => void): this;

  /** Emitted when a player switches brackets. */
  on(eventName: "bracket", listener: (player: Member) => void): this;

  /** Emitted when the game starts. */
  on(eventName: "start", listener: (game: Game) => void): this;

  /** Emitted when the game ends. */
  on(eventName: "end", listener: (leaderboard: Leaderboard[], victor: Player) => void): this;
}

export type Member = {
  /** The User object tied to this member. */
  user: User;
  /** The current bracket this member is in. */
  bracket: "spectator" | "player";
};

export type GameOptions = {
  /** Protocol version. */
  version: number;
  /** unknown */
  seedRandom: boolean;
  /** The RNG seed of the game. */
  seed: number;
  /** Starting gravity (how fast blocks drop). Higher is faster. */
  g: number;
  /** Amount of extra lives one has. */
  stock: number;
  /** Whether the game has a countdown. */
  countdown: boolean;
  /** The number from which to countdown. */
  countdownCount: number;
  /** The time in millisecond between each count. */
  countdownInterval: number;
  /** The time in milliseconds before the countdown begins. */
  precountdown: number;
  /** unknown */
  prestart: number;
  /** unknown */
  mission: string;
  /** unknown */
  missionType: string;
  /** unknown */
  zoomInto: string;
  /** unknown */
  slotCounter1: string;
  /** unknown */
  slotCounter2: string;
  /** unknown */
  slotCounter3: string;
  /** unknown */
  slotCounter4: string;
  /** unknown */
  slotCounter5: string;
  /** unknown */
  slotBar1: string;
  /** Whether to display fire. */
  displayFire: boolean;
  /** unknown */
  displayUsername: boolean;
  /** unknown */
  hasGarbage: boolean;
  /** unknown */
  bgmNoReset: boolean;
  /** Whether to keep the BGM playing between games. */
  neverStopBgm: boolean;
  /** Whether to show the NEXT queue. */
  displayNext: boolean;
  /** Whether to use the HOLD queue. */
  displayHold: boolean;
  /** unknown */
  infiniteHold: boolean;
  /** Amount of time in frames until the gravity starts to increase. */
  gMargin: number;
  /** The amount of gravity increase per second. */
  gIncrease: number;
  /** Starting garbage multiplier. 1 means normal amount of garbage, 2 means double. */
  garbageMultiplier: number;
  /** Amount of time in frames until the garbage multiplier starts to increase. */
  garbageMargin: number;
  /** The amount of garbage multiplier increase per second. */
  garbageIncrease: number;
  /** Amount of garbage that may enter the screen at once. */
  garbageCap: number;
  /** The amount of garbage cap increase per second. */
  garbageCapIncrease: number;
  /** Maximum amount the garbage cap may reach. */
  garbageCapMax: number;
  /** unknown */
  garbageAbsoluteCap: boolean;
  /** unknown */
  garbageHoleSize: number;
  /** unknown */
  garbagePhase: number;
  /** unknown */
  garbageQueue: boolean;
  /** unknown */
  garbageAre: number;
  /** unknown */
  garbageEntry: string;
  /** unknown */
  garbageBlocking: string;
  /** unknown */
  garbageTargetBonus: string;
  /** Presets to apply to */
  presets: string;
  /** The type of system used to generate random pieces. */
  bagType: string;
  /** The type of pieces allowed to do spins. */
  spinBonuses: string;
  /** What combo table to use. */
  comboTable: string;
  /** The type of kicks that pieces can do. */
  kickSet: string;
  /** Amount of pieces shown in the NEXT queue, if said queue is enabled. */
  nextCount: number;
  /** Whether to allow use of the Hard Drop button. */
  allowHardDrop: boolean;
  /** Whether to show the shadow piece. */
  displayShadow: boolean;
  /** If not using master levels, the amount of frames until a piece locks down. */
  lockTime: number;
  /** The time it takes in frames for garbage to travel. */
  garbageSpeed: number;
  /** unknown */
  forfeitTime: number;
  /** Amount of time in frames in between a piece being placed and the next one spawning. */
  are: number;
  /** Amount of time in frames in between a piece being placed and the next one spawning, if a line was cleared. */
  lineClearAre: boolean;
  /** Whether to enable infinite movement (disables lockResets). */
  infiniteMovement: boolean;
  /** How many times to enable resetting the lock delay (by rotating or moving a piece). */
  lockResets: number;
  /** Whether to allow the 180 rotation key to be used. */
  allow180: boolean;
  /** unknown */
  objective: any;
  /** Whether to enforce the handling settings below. */
  roomHandling: boolean;
  /**
   * Auto Repeat Rate.
   *
   * @remarks
   * Enforced if "enforce below handling settings" is enabled.
   * */
  roomHandlingArr: number;
  /**
   * Delayed Auto Shift.
   *
   * @remarks
   * Enforced if "enforce below handling settings" is enabled.
   * */
  roomHandlingDas: number;
  /**
   * Soft Drop Factor. Use 41 for MAX.
   *
   * @remarks
   * Enforced if "enforce below handling settings" is enabled.
   * */
  roomHandlignSdf: number;
  /** Whether to allow users to click boards to manually target them. */
  manualAllowed: boolean;
  /** Whether to make long Back-to-Back chains become more powerful. */
  b2bChaining: boolean;
  /** Whether to reward clearing the entire board. */
  allClears: boolean;
  /** Whether to allow out-of-bound placements when they clear a line. */
  clutch: boolean;
  noLockout: boolean;
  /** If disabled, attacks can be canceled while in transit or during latency. Experimental, may be removed or become standard. */
  passthrough: string;
  /** Whether undoing is enabled. */
  canUndo: boolean;
  /** Whether retrying is enabled. */
  canRetry: boolean;
  /** unknown */
  retryIsClear: boolean;
  /** unknown */
  noExtraWidth: boolean;
  /** unknown */
  stride: boolean;
  /** The width of the playing field. */
  boardWidth: number;
  /** The height of the playing field. */
  boardHeight: number;
  /** unknown */
  newPayback: boolean;
};
