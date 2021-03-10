import { Feed } from "../type";
import { FOLLOWER_FEED, COMMENT_FEED, LIKE_FEED } from "../constant";

/**
 * 判断是否为ticktock的feed.
 *
 * @param feed
 */
export const isTTFeed = (feed: Feed) => {
  return (
    feed &&
    (feed.kind === FOLLOWER_FEED ||
      feed.kind === COMMENT_FEED ||
      feed.kind === LIKE_FEED)
  );
};

/**
 * 生成自动插入feed的id.
 */
export const creatFeedId = () => {
  const t = "xxxxx";
  return t.replace(/[xy]/g, (c: string) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
