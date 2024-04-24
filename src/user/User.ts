import { APIResponse } from "../util/types";
import WebSocketManager from "../ws/WebSocketManager";

/** Represents a TetraChannel User. */
export default class User {
  constructor(ws: WebSocketManager, { user }: APIResponse) {
    this.ws = ws;

    this.id = user._id;
    this.username = user.username;
    this.role = user.role;
    if (user.ts) this.ts = new Date(user.ts);
    this.botMaster = user.botmaster;
    this.badges = user.badges.map((badge: { id: string; label: string; ts?: string }) => {
      if (badge.ts) return { ...badge, ts: new Date(badge.ts) };
      return badge;
    });
    this.xp = user.xp;
    this.gamesPlayed = user.gamesplayed;
    this.gamesWon = user.gameswon;
    this.gameTime = user.gametime;
    this.country = user.country;
    this.badStanding = user.badstanding;
    this.supporter = user.supporter;
    this.supporterTier = user.supporter_tier;
    this.verified = user.verified;
    this.league = {
      gamesPlayed: user.league.gamesplayed,
      gamesWon: user.league.gameswon,
      rating: user.league.rating,
      rank: user.league.rank,
      bestRank: user.league.bestrank,
      standing: user.league.standing,
      standingLocal: user.league.standing_local,
      nextRank: user.league.next_rank,
      prevRank: user.league.prev_rank,
      nextAt: user.league.next_at,
      prevAt: user.league.prev_at,
      percentile: user.league.percentile,
      percentileRank: user.league.percentile_rank,
      glicko: user.league.glicko,
      rd: user.league.rd,
      apm: user.league.apm,
      pps: user.league.pps,
      vs: user.league.vs,
      decaying: user.league.decaying,
    };
    this.avatarRevision = user.avatar_revision;
    this.bannerRevision = user.banner_revision;
    this.bio = user.bio;
    this.connections = user.connections;
    this.friendCount = user.friend_count;
    this.distinguishment = user.distinguishment;
  }

  private readonly ws: WebSocketManager;

  /**
   *  The user's internal ID.
   *
   * @readonly
   */
  public readonly id: string;
  /**
   * The user's username.
   *
   * @readonly
   */
  public readonly username: string;
  /**
   * The user's role.
   *
   * @readonly
   */
  public readonly role: "anon" | "user" | "bot" | "halfmod" | "mod" | "admin" | "sysop";
  /**
   * When the user account was created. If not set, this account was created before join dates were recorded.
   *
   * @readonly
   */
  public readonly ts?: Date;
  /**
   * If this user is a bot, the bot's operator.
   *
   * @readonly
   */
  public readonly botMaster?: string;
  /**
   * The user's badges.
   *
   * @readonly
   */
  public readonly badges: {
    /**
     * The badge's internal ID, and the filename of the badge icon.
     *
     * @remarks
     * All PNGs within `/res/badges/`.
     */
    id: string;
    /** The badge's label, shown when hovered. */
    label: string;
    /** The badge's timestamp, if shown. */
    ts?: Date;
  }[];
  /**
   * The user's XP in points.
   *
   * @readonly
   */
  public readonly xp: number;
  /**
   * The amount of online games played by this user. If the user has chosen to hide this statistic, it will be -1.
   *
   * @readonly
   */
  public readonly gamesPlayed: number;
  /**
   * The amount of online games won by this user. If the user has chosen to hide this statistic, it wl be -1.
   *
   * @readonly
   */
  public readonly gamesWon: number;
  /**
   * The amount of seconds this user spent playing, both on- and offline. If the user has chosen to hide this statistic, it will be -1.
   *
   * @readonly
   */
  public readonly gameTime: number;
  /**
   * The user's ISO 3166-1 country code, or null if hidden/unknown. Some vanity flags exist.
   *
   * @readonly
   */
  public readonly country?: string;
  /**
   * Whether this user current has a bad standing (recently banned).
   *
   * @readonly
   */
  public readonly badStanding?: boolean;
  /**
   * Whether this user is currently supporting TETR.IO <3
   *
   * @readonly
   */
  public readonly supporter: boolean;
  /**
   * An indicator of their total amount supported, between 0 and 4 inclusive.
   *
   * @readonly
   */
  public readonly supporterTier: number;
  /**
   * Whether this user is a verified account.
   *
   * @readonly
   */
  public readonly verified: boolean;
  /**
   * This user's current TETRA LEAGUE standing.
   *
   * @readonly
   */
  public readonly league: {
    /** The amount of TETRA LEAGUE games played by this user. */
    gamesPlayed: number;
    /** The amount of TETRA LEAGUE games won by this user. */
    gamesWon: number;
    /** This user's TR (Tetra Rating), or -1 if less than 10 games were played. */
    rating: number;
    /** This user's letter rank. Z is unranked. */
    rank: string;
    /** This user's highest achieved rank this season. */
    bestRank: string;
    /** This user's position in global leaderboards, or -1 if not applicable. */
    standing: number;
    /** This user's position in local leaderboards, or -1 if not applicable. */
    standingLocal: number;
    /** The next rank this user can achieve, if they win more games, or null if unranked (or the best rank). */
    nextRank?: string;
    /** The previous rank this user can achieve, if they lose more games, or null if unranked (or the worst rank). */
    prevRank?: string;
    /** The position of the best player in the user's current rank, surpass them to go up a rank. -1 if unranked (or the best rank). */
    nextAt: number;
    /** The position of the worst player in the user's current rank, dip below them to go down a rank. -1 if unranked (or the worst rank). */
    prevAt: number;
    /** This user's percentile position (0 is best, 1 is worst). */
    percentile: number;
    /** This user's percentile rank, or Z if not applicable. */
    percentileRank: string;
    /** This user's Glicko-2 rating. */
    glicko?: number;
    /** This user's Glicko-2 Rating Deviation. If over 100, this user is unranked. */
    rd?: number;
    /** This user's average APM (attack per minute) over the last 10 games. */
    apm?: number;
    /** This user's average PPS (piece per second) over the last 10 games. */
    pps?: number;
    /** This user's average VS (versus score) over the last 10 games. */
    vs?: number;
    /** Whether this user's RD is rising (has not played in the last week). */
    decaying: boolean;
  };
  /**
   * This user's avatar ID.
   *
   * @readonly
   */
  public readonly avatarRevision?: number;
  /**
   * A link to the user's avatar if they have one.
   *
   * @readonly
   */
  public get avatarURL(): string | undefined {
    if (this.avatarRevision)
      return `https://tetr.io/user-content/avatars/${this.id}.jpg?rv=${this.avatarRevision}`;

    return;
  }
  /**
   * This user's banner ID.
   *
   * @readonly
   */
  public readonly bannerRevision?: number;
  /**
   * A link to the user's banner if they have one.
   *
   * @readonly
   */
  public get bannerURL(): string | undefined {
    if (this.bannerRevision)
      return `https://tetr.io/user-content/banners/${this.id}.jpg?rv=${this.bannerRevision}`;

    return;
  }
  /**
   * This user's "About Me" section.
   *
   * @readonly
   */
  public readonly bio?: string;
  /**
   * This user's third party connections.
   *
   * @readonly
   */
  public readonly connections: {
    /** This user's connection to Discord. */
    discord?: {
      /** This user's Discord ID. */
      id: string;
      /** This user's Discord Tag. */
      username: string;
    };
  };
  /**
   * The amount of players who have added this user to their friends list.
   *
   * @readonly
   */
  public readonly friendCount: number;
  /**
   *  This user's distinguishment banner, if any.
   *
   * @readonly
   */
  public readonly distinguishment?: {
    /** The type of distinguishment banner. */
    type: string;
  };

  /**
   * Send a direct message to this user.
   * @param msg The content of the message to send
   *
   * @example
   * ```
   * indonesia.send("Hello World!");
   * ```
   */
  public dm(msg: string): void {
    this.ws.send({
      command: "social.dm",
      data: { recipient: this.id, msg },
    });
  }

  /**
   * Send an invite to the this user of the client's current room.
   */
  public invite(): void {
    this.ws.send({ command: "social.invite", data: this.id });
  }
}
