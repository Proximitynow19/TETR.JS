import { Packr, Unpackr, addExtension } from "msgpackr";
import { APIResponse } from "./types";

const cacheSessionID = `SESS-${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`;

const cache: Map<string, { expire: number; data: any }> = new Map();

addExtension({
  type: 1,
  read: (e) =>
    null === e
      ? {
          success: true,
        }
      : {
          success: true,
          ...e,
        },
});
addExtension({
  type: 2,
  read: (e) =>
    null === e
      ? {
          success: false,
        }
      : {
          success: false,
          error: e,
        },
});

const unpackr = new Unpackr({
  bundleStrings: true,
});

const packr = new Packr({
  bundleStrings: true,
});

export class APIError extends Error {
  public response: APIResponse;
  constructor(res: APIResponse) {
    super(res.error.msg);
    this.response = res;
    Error.captureStackTrace(this, APIError);
  }
}

export default async function (
  endpoint: string,
  token?: string,
  headers_ = {},
  method = "GET",
  body_?: any,
  cache_?: {
    expire: number;
    key: string;
  }
): Promise<APIResponse> {
  if (cache_) {
    let cacheData: any = cache.get(cache_.key);
    if (!!cacheData) {
      if (new Date().getTime() < cacheData.expire) {
        cacheData = await Promise.resolve(cacheData.data);
        if (cacheData.success) return cacheData;
      }
    }
  }

  let headers: any = {
    Accept: "application/vnd.osk.theorypack",
    "X-Session-ID": cacheSessionID,
    ...headers_,
  };

  if (token) headers.Authorization = `Bearer ${token}`;
  if (method == "POST") headers["content-type"] = "application/vnd.osk.theorypack";
  let response: Promise<APIResponse> = fetch(`https://tetr.io/api${endpoint}`, {
    method,
    body: body_ ? packr.pack(body_) : undefined,
    headers,
  })
    .then((res) => res.arrayBuffer())
    .then((res) => unpackr.unpack(Buffer.from(res)));

  if (cache_) cache.set(cache_.key, { expire: cache_.expire, data: response });

  if (!(await response).success) throw new APIError(await response);

  return await response;
}
