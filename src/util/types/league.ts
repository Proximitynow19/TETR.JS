export type MiddleRanks =
  | "D+"
  | "C-"
  | "C"
  | "C+"
  | "B-"
  | "B"
  | "B+"
  | "A-"
  | "A"
  | "A+"
  | "S-"
  | "S"
  | "S+"
  | "SS"
  | "U";
export type AllRanks = MiddleRanks | "D" | "X" | "Z";

export type LeagueInfosType = {
  /** The amount of TETRA LEAGUE games played by this user. */
  gamesplayed: number;
  /** The amount of TETRA LEAGUE games won by this user. */
  gameswon: number;

  /** This user's TR (Tetra Rating), or -1 if less than 10 games were played. */
  rating: number;
  /** This user's letter rank. Z is unranked. */
  rank: AllRanks;
  /** This user's highest achieved rank this season. */
  bestrank: MiddleRanks | "D" | "X";

  /** This user's Glicko-2 rating. */
  glicko?: number;
  /** This user's Glicko-2 Rating Deviation. If over 100, this user is unranked. */
  rd?: number;

  /** This user's average APM (attack per minute) over the last 10 games. */
  apm?: number;
  /** This user's average PPS (pieces per second) over the last 10 games. */
  pps?: number;
  /** This user's average VS (versus score) over the last 10 games. */
  vs?: number;
  /** Whether this user's RD is rising (has not played in the last week). */
  decaying: boolean;
};

export type LeagueInfosFullType = LeagueInfosType & {
  /** This user's position in global leaderboards, or -1 if not applicable. */
  standing: number;
  /** This user's position in local leaderboards, or -1 if not applicable. */
  standing_local: number;

  /** The next rank this user can achieve, if they win more games, or null if unranked (or the best rank). */
  next_rank?: MiddleRanks | null;
  /** The previous rank this user can achieve, if they lose more games, or null if unranked (or the worst rank). */
  prev_rank?: MiddleRanks | null;

  /** The position of the best player in the user's current rank, surpass them to go up a rank. -1 if unranked (or the best rank). */
  next_at: number;
  /** The position of the worst player in the user's current rank, dip below them to go down a rank. -1 if unranked (or the worst rank). */
  prev_at: number;

  /** This user's percentile position (0 is best, 1 is worst). */
  percentile: number;

  /** This user's percentile rank, or Z if not applicable. */
  percentile_rank: AllRanks;
};
