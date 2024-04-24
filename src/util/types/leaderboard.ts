import { LeagueInfosType, RoleType } from ".";

export type BaseLeaderboardUserInfoType = {
  /** The user's internal ID. */
  _id: string;
  /** The user's username. */
  username: string;
  /** The user's role */
  role: RoleType;
  /** The user's XP in points. */
  xp: number;
  /** The user's ISO 3166-1 country code, or null if hidden/unknown. Some vanity flags exist. */
  country?: string;
  /** Whether this user is currently supporting TETR.IO <3 */
  supporter: boolean;
  /** Whether this user is a verified account. */
  verified: boolean;
};

export type LeagueLeaderboardUserInfoType = BaseLeaderboardUserInfoType & {
  /** This user's current TETRA LEAGUE standing: */
  league: LeagueInfosType;
};

export type XPLeaderboardUserInfoType = BaseLeaderboardUserInfoType & {
  /** When the user account was created. If not set, this account was created before join dates were recorded. */
  ts?: string;
  /** The amount of online games played by this user. If the user has chosen to hide this statistic, it will be -1. */
  gamesplayed: number;
  /** The amount of online games won by this user. If the user has chosen to hide this statistic, it will be -1. */
  gameswon: number;
  /** The amount of seconds this user spent playing, both on- and offline. If the user has chosen to hide this statistic, it will be -1. */
  gametime: number;
};
