import { shouldUseNewTTLogic } from "@/utils/general_utils";

export const FOLLOWER_FEED = "follow";
export const LIKE_FEED = "like";
export const COMMENT_FEED = "comment";
export const VIDEO_AD_FEED = "feed_video_ad";
export const SUPER_PAY_FEED = "feed_super_pay";
export const BACK_UP_FEED = "feed_back_up";
export const COIN_FEED = "feed_coin";
export const LUCKY_COIN_FEED = "feed_lucky_coin";
export const LUCKY_COIN = "lucky_coin"; // LUCKY_COIN_FEED补全offer时需要替换kind为lucky_coin，购买项要求

export const POST_FEED_KINDS = [LIKE_FEED, COMMENT_FEED];
// export const RANDOM_FEED_KINDS = [COIN_FEED, LUCKY_COIN_FEED, BACK_UP_FEED, SUPER_PAY_FEED];
export const RANDOM_FEED_KINDS = [COIN_FEED, LUCKY_COIN_FEED];
/**
 * 根据不同的原生版本号选择是否剔除comment feed.
 */
export const TT_FEED_KINDS = () => {
  return shouldUseNewTTLogic("1.1.0")
    ? [FOLLOWER_FEED, LIKE_FEED]
    : [FOLLOWER_FEED, COMMENT_FEED, LIKE_FEED];
};

export const MIN_FEEDS_STACK_NUM = 5;
export const MAX_RETRY_PULL_FEEDS_NUM = 5;

// tt接口校验feed，失败的code，需要上报给后台
export const FEED_INVALID_ERROR_CODE_LIST = [10201, 10202, 10204, 10217];
// 当actFeed接口报错当前feed已经被加币的错误码
export const HAS_REWARD_FEED_ERROR_CODE = 22001;
