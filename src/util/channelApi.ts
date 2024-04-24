import {
  APIResponse,
  GeneralActivityType,
  GeneralStatsType,
  LatestNewsType,
  LeagueLeaderboardUserInfoType,
  RecordType,
  UserInfoType,
  UserRecordsType,
  UserSearchType,
  streamID,
} from "./types";

const cacheSessionID = `SESS-${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`;

const cache: Map<string, any> = new Map();

export default async function channelApi(
  endpoint: string,
  method = "GET",
  body?: any
): Promise<APIResponse> {
  if (method == "GET" && !body) {
    let cacheData = cache.get(endpoint);
    if (!!cacheData) {
      cacheData = await Promise.resolve(cacheData);
      if (cacheData.success && new Date().getTime() < cacheData.cache.cached_until)
        return cacheData.data;
    }
  }
  let response: Promise<APIResponse> = fetch(`https://ch.tetr.io/api${encodeURI(endpoint)}`, {
    method,
    body,
    headers: {
      Accept: "application/json",
      "X-Session-ID": cacheSessionID,
    },
  }).then((res) => res.json());
  cache.set(endpoint, response);

  if (!(await response).success) throw Error((await response).error);

  return (await response).data;
}

/**
 * @description Some statistics about the service.
 * @returns {Promise<GeneralStatsType>}
 */
function generalStats(): Promise<GeneralStatsType> {
  return channelApi("/general/stats");
}

/**
 * @description A graph of user activity over the last 2 days. A user is seen as active if they logged in or received XP within the last 30 minutes.
 * @returns {Promise<GeneralActivityType>}
 */
function generalActivity(): Promise<GeneralActivityType> {
  return channelApi("/general/activity");
}

/**
 * @description An object describing the user in detail.
 * @param {string} user The username or user ID to look up.
 * @returns {Promise<UserInfoType>}
 */
function userInfo(user: string): Promise<UserInfoType> {
  return channelApi("/users/" + user.toLowerCase()).then((x) => x.user);
}

/**
 * @description An object describing the user in detail.
 * @param {string} user The username or user ID to look up.
 * @returns {Promise<UserRecordsType>}
 */
function userRecords(user: string): Promise<UserRecordsType> {
  return channelApi("/users/" + user.toLowerCase() + "/records");
}

/**
 * @description An object describing the user found, or undefined if none found.
 * @param {string} query The Discord ID (snowflake) to look up.
 * @returns {Promise<UserSearchType>}
 */
function userSearch(query: string): Promise<UserSearchType | undefined> {
  return channelApi("/users/search/" + query).then((x) => x.user ?? undefined);
}

/**
 * @description An array of all users fulfilling the search criteria. Please do not overuse this.
 * @param {number?} after The upper bound in TR. Use this to paginate downwards: take the lowest seen TR and pass that back through this field to continue scrolling. 25000 by default.
 * @param {number?} before The lower bound in TR. Use this to paginate upwards: take the highest seen TR and pass that back through this field to continue scrolling. If set, the search order is reversed (returning the lowest items that match the query)
 * @param {number?} limit The amount of entries to return, between 1 and 100. 50 by default.
 * @param {string?} country The ISO 3166-1 country code to filter to. Leave unset to not filter by country.
 * @returns {Promise<LeagueLeaderboardUserInfoType[]>}
 */
function leagueLeaderboard(
  after?: number,
  before?: number,
  limit?: number,
  country?: string
): Promise<LeagueLeaderboardUserInfoType[]> {
  return channelApi(
    `/users/lists/league?${after ? `after=${after}&` : ""}${before ? `before=${before}&` : ""}${
      limit ? `limit=${limit}&` : ""
    }${country ? `country=${country}&` : ""}`
  ).then((x) => x.users);
}

/**
 * @description An array of all users fulfilling the search criteria. Please do not overuse this.
 * @param {string?} country The ISO 3166-1 country code to filter to. Leave unset to not filter by country.
 * @returns {Promise<LeagueLeaderboardUserInfoType[]>}
 */
function leagueLeaderboardFull(country?: string): Promise<LeagueLeaderboardUserInfoType[]> {
  return channelApi(`/users/lists/league/all?${country ? `country=${country}` : ""}`).then(
    (x) => x.users
  );
}

/**
 * @description The records in this Stream. A Stream is a list of records with a set length. Replays that are not featured in any Stream are automatically pruned.
 * @param {streamID} stream The stream ID to look up.
 * @returns {Promise<RecordType[]>}
 */
function stream(stream: streamID): Promise<RecordType[]> {
  return channelApi("/streams/" + stream).then((x) => x.records);
}

/**
 * @description The latest news items in any stream.
 * @param {number?} limit The amount of entries to return, between 1 and 100. 25 by default.
 * @returns {Promise<LatestNewsType[]>}
 */
function allNews(limit?: number): Promise<LatestNewsType[]> {
  return channelApi(`/news/?${limit ? `limit=${limit}` : ""}`).then((x) => x.news);
}

/**
 * @description The latest news items in the stream. Use stream "global" for the global news.
 * @param {streamID} stream The stream ID to look up.
 * @param {number?} limit The amount of entries to return, between 1 and 100. 25 by default.
 * @returns {Promise<LatestNewsType[]>}
 */
function news(stream: streamID, limit?: number): Promise<LatestNewsType[]> {
  return channelApi(`/news/${stream}?${limit ? `limit=${limit}` : ""}`).then((x) => x.news);
}

const general = {
  stats: generalStats,
  activity: generalActivity,
};

const users = {
  info: userInfo,
  records: userRecords,
  search: userSearch,
};

const leaderboards = {
  league: leagueLeaderboard,
  leagueFull: leagueLeaderboardFull,
  // xp: XPLeaderboard,
};

const misc = {
  stream,
  allNews,
  news,
};

export const TetraChannel = {
  general,
  users,
  leaderboards,
  misc,
  cache,
};
