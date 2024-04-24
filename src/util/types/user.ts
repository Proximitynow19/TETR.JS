import { LeagueInfosFullType, RoleType } from ".";

export type UserInfoType = {
  /** The user's internal ID. */
  _id: string;
  /** The user's username. */
  username: string;
  /** The user's role. */
  role: RoleType;
  /** When the user account was created. If not set, this account was created before join dates were recorded. */
  ts?: string;

  /** If this user is a bot, the bot's operator. */
  botmaster?: string;

  /** The user's badges: */
  badges: {
    /** The badge's internal ID, and the filename of the badge icon (all PNGs within `/res/badges/`) */
    id: string;
    /** The badge's label, shown when hovered. */
    label: string;
    /** The badge's timestamp, if shown. */
    ts?: string;
  }[];

  /** The user's XP in points. */
  xp: number;

  /** The amount of online games played by this user. If the user has chosen to hide this statistic, it will be -1. */
  gamesplayed: number;
  /** The amount of online games won by this user. If the user has chosen to hide this statistic, it will be -1. */
  gameswon: number;
  /** The amount of seconds this user spent playing, both on- and offline. If the user has chosen to hide this statistic, it will be -1. */
  gametime: number;

  /** The user's ISO 3166-1 country code, or null if hidden/unknown. Some vanity flags exist. */
  country?: string;
  /** Whether this user currently has a bad standing (recently banned). */
  badstanding?: boolean;

  /** Whether this user is currently supporting TETR.IO <3 */
  supporter: boolean;
  /** An indicator of their total amount supported, between 0 and 4 inclusive. */
  supporter_tier: number;
  /** Whether this user is a verified account. */
  verified: boolean;

  /** This user's current TETRA LEAGUE standing: */
  league: LeagueInfosFullType;

  /** This user's avatar ID. Get their avatar at `https://tetr.io/user-content/avatars/{ USERID }.jpg?rv={ AVATAR_REVISION }` */
  avatar_revision?: number;
  /** This user's banner ID. Get their banner at `https://tetr.io/user-content/banners/{ USERID }.jpg?rv={ BANNER_REVISION }`. Ignore this field if the user is not a supporter. */
  banner_revision?: number;
  /** This user's "About Me" section. Ignore this field if the user is not a supporter. */
  bio?: string;

  /** This user's third party connections: */
  connections: {
    /** This user's connection to Discord: */
    discord?: {
      /** This user's Discord ID. */
      id: string;
      /** This user's Discord Tag. */
      username: string;
    };
  };

  /** The amount of players who have added this user to their friends list. */
  friend_count: number;
  /** This user's distinguishment banner, if any. */
  distinguishment?: {
    /** The type of distinguishment banner. */
    type: string;
  };
};

export type UserSearchType = {
  /**The user's internal ID. */
  _id: string;
  /** The user's username. */
  username: string;
};
