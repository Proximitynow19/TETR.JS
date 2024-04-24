import User from "../user/User";
import { APIResponse } from "../util/types";
import WebSocketManager from "../ws/WebSocketManager";
import EventEmitter from "node:events";

/** Represents the Client's User. */
export default class ClientUser extends EventEmitter {
  constructor(ws: WebSocketManager, { user: me }: APIResponse, user: User) {
    super();

    this.ws = ws;

    this.user = user;
    this.email = me.email;
    this.privacy = {
      showWon: me.privacy_showwon,
      showPlayed: me.privacy_showplayed,
      showGameTime: me.privacy_showgametime,
      showCountry: me.privacy_showcountry,
      privateMode: me.privacy_privatemode,
      status: {
        shallow: me.privacy_status_shallow,
        deep: me.privacy_status_deep,
        exact: me.privacy_status_exact,
      },
      dm: me.privacy_dm,
      invite: me.privacy_invite,
    };
    this.thanked = me.thanked;
    this.banList = me.banlist;
    this.warnings = me.warnings;
    this.bannedStatus = me.bannedstatus;
    this.supporterExpires = me.supporter_expires;
    this.totalSupported = me.total_supported;
    this.zen = me.zen;
    this.totp = {
      enabled: me.totp.enabled,
      codesRemaining: me.totp.codes_remaining,
    };
  }

  private readonly ws: WebSocketManager;

  /**
   * TetraChannel information regarding the client's user.
   *
   * @readonly
   */
  public readonly user: User;
  /**
   * Registered email (if exists) for this account.
   *
   * @readonly
   */
  public readonly email: string;
  /**
   * Privacy settings for how other users may interact with this account.
   *
   * @readonly
   */
  public readonly privacy: {
    /** Publicly display games won by this account. */
    showWon: boolean;
    /** Publicly display games played by this account. */
    showPlayed: boolean;
    /** Publicly display total game time of this account. */
    showGameTime: boolean;
    /** Publicly display this account's country. */
    showCountry: boolean;
    privateMode: "private" | "public";
    /** Determine what parts of this account's status can be seen and by who. */
    status: {
      /** Determines who can see the online status of this account. */
      shallow: "nobody" | "friends" | "everyone";
      /** Determines who can what this account is doing. */
      deep: "nobody" | "friends" | "everyone";
      /** Determines who can see what room this account is in. */
      exact: "nobody" | "friends" | "everyone";
    };
    /** Determine who can send direct messages to this account. */
    dm: "nobody" | "friends" | "everyone";
    /** Determine who can send room invites to this account. */
    invite: "nobody" | "friends" | "everyone";
  };
  /**
   * unknown
   *
   * @readonly
   */
  public readonly thanked: boolean;
  /**
   * unknown
   *
   * @readonly
   */
  public readonly banList: unknown[];
  /**
   * unknown
   *
   * @readonly
   */
  public readonly warnings: unknown[];
  /**
   * unknown
   *
   * @readonly
   */
  public readonly bannedStatus: string;
  /**
   * unknown
   *
   * @readonly
   */
  public readonly supporterExpires: number;
  /**
   * unknown
   *
   * @readonly
   */
  public readonly totalSupported: number;
  /**
   * Current zen mode progress.
   *
   * @readonly
   */
  public readonly zen: {
    /** unknown */
    map: string;
    /** Current zen level. */
    level: number;
    /** Current progress through zen level */
    progress: number;
    /** Total score achieved in zen. */
    score: number;
  };
  /**
   * unknown
   *
   * @readonly
   */
  public readonly totp: {
    /** unknown */
    enabled: boolean;
    /** unknown */
    codesRemaining: number;
  };

  /**
   * Set display presence to other users.
   * @param presence The presence data to set
   *
   * @example
   * ```
   * client.me.presence({status: "online", detail: "zen"});
   * ```
   *
   * @remarks
   * Subject to privacy settings.
   */
  public presence(presence: {
    status: "online" | "away" | "busy" | "offline";
    detail: string;
  }): void {
    this.ws.send({ command: "social.presence", data: presence });
  }
}

export default interface Client extends EventEmitter {
  /** Emitted when a user sends a direct message to the client. */
  on(eventName: "dm", listener: (message: { content: string; author: User }) => void): this;

  /** Emitted when a user sends an invite to the client.*/
  on(eventName: "invite", listener: (invite: { room: string; author: User }) => void): this;

  /** Emitted when the server sends an update on how many users online. */
  on(eventName: "online", listener: (online: number) => void): this;
}
