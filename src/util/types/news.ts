import { NewsRecordsType, streamID } from ".";

export type NewsType = {
  /** The item's internal ID. */
  _id: string;
  /** The item's stream. */
  stream: streamID;
  /** The item's type. */
  type: string;
  /** The item's records. */
  data: NewsRecordsType;
  /** The item's creation date. */
  ts: string;
};
