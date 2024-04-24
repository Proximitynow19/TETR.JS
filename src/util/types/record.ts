import { AllRanks } from ".";

export type RecordType = {
  /** The Record's ID. This is **NOT** the replay ID. */
  _id: string;
  /** The Stream this Record belongs to. */
  stream: streamID;
  /** The ID of the associated replay. */
  replayid: string;

  /** The user who set this Record: */
  user: {
    /**The user's internal ID. */
    _id: string;
    /** The user's username. */
    username: string;
  };

  /** The time this record was set. */
  ts: string;
  /** If true, this is a multiplayer replay. */
  ismulti?: boolean;
  /** The state this replay finished with. */
  endcontext: Record<any, any>[] | Record<any, any>;
};

export type UserRecordsType = {
  /** The requested user's ranked records: */
  records: {
    /** The user's 40 LINES record: */
    "40l": {
      /** The user's 40 LINES record data, or null if never played. */
      record: RecordType | null;
      /** The user's rank in global leaderboards, or null if not in global leaderboards. */
      rank: number | null;
    };

    /** The user's BLITZ record: */
    blitz: {
      /** The user's BLITZ record data, or null if never played. */
      record: RecordType | null;
      /** The user's rank in global BLITZ leaderboards, or null if not in global leaderboards. */
      rank: number | null;
    };
  };
  /** The user's ZEN record: */
  zen: {
    /** The user's level in ZEN mode. */
    level: number;
    /** The user's score in ZEN mode. */
    score: number;
  };
};

/** Stream IDs may be broken up into two or three parts, delimited by underscores. Read more [here](https://tetr.io/about/api/#streamid). */
export type streamID = `${"40l" | "blitz" | "any"}_${"global" | "userbest" | "userrecent"}${
  | `_${"userbest" | "userrecent" | string}`
  | ""}`;

/** News Records */

export type LatestNewsType = {
  /** The item's internal ID. */
  _id: string;
  /** The item's stream. */
  stream: string;
  /** The item's type. */
  type: string;
  /** The item's records. */
  data: NewsRecordsType;
  /** The item's creation date. */
  ts: string;
};

export type NewsRecordsType =
  | leaderboardNews
  | personalbestNews
  | badgeNews
  | rankupNews
  | supporterNews
  | supporter_giftNews;

/** When a user's new personal best enters a global leaderboard. Seen in the global stream only. */
type leaderboardNews = {
  /** The username of the person who got the leaderboard spot. */
  username: string;
  /** The game mode played. */
  gametype: string;
  /** The global rank achieved. */
  rank: number;
  /** The result (score or time) achieved. */
  result: number;
  /** The replay's shortID. */
  replayid: string;
};

/** When a user gets a personal best. Seen in user streams only. */
type personalbestNews = {
  /** The username of the person. */
  username: string;
  /** The game mode played. */
  gametype: string;
  /** The result (score or time) achieved. */
  result: number;
  /** The replay's shortID. */
  replayid: string;
};

/** When a user gets a badge. Seen in user streams only. */
type badgeNews = {
  /** The username of the player. */
  username: string;
  /** The badge's internal ID, and the filename of the badge icon (all PNGs within `/res/badges/`) */
  type: string;
  /** The badge's label. */
  label: string;
};

/** When a user gets a new top rank in TETRA LEAGUE. Seen in user streams only. */
type rankupNews = {
  /** The username of the player. */
  username: string;
  /** The badge's internal ID, and the filename of the badge icon (all PNGs within `/res/badges/`) */
  rank: AllRanks;
};

/** When a user gets TETR.IO Supporter. Seen in user streams only. */
type supporterNews = {
  /** The username of the player. */
  username: string;
};

/** When a user is gifted TETR.IO Supporter. Seen in user streams only. */
type supporter_giftNews = {
  /** The username of the recipient. */
  username: string;
};
