import { FeedAccountError } from "../../type";

/**
 * 当前feed视频不存在抛出的错误.
 */
export const CHECK_TT_FEED_RESOUCE_ERROR: FeedAccountError = {
  code: 10204,
  error_type: "check_tt_feed_error",
  massage: "This video is invalid."
};

/**
 * 当前feed视频无法获取抛出的错误.
 */
export const CHECK_TT_FEED_VIDEO_ACCESS_ERROR: FeedAccountError = {
  code: 10215,
  error_type: "check_tt_feed_error",
  massage: "This video is invalid."
};

/**
 * 当前feed视频私有抛出的错误.
 */
export const CHECK_TT_FEED_PRIVATE_VIDEO_ERROR: FeedAccountError = {
  code: 10216,
  error_type: "check_tt_feed_error",
  massage: "This video is invalid."
};

/**
 * 当前feed id不存在抛出的错误.
 */
export const CHECK_TT_FEED_ID_ERROR: FeedAccountError = {
  code: 10217,
  error_type: "check_tt_feed_error",
  massage: "This video is invalid."
};

/**
 * 当前feed的follow账号是隐私账号抛出的错误.
 */
export const CHECK_TT_FEED_PRIVATE_ACCOUNT_ERROR: FeedAccountError = {
  code: 10222,
  error_type: "check_tt_feed_error",
  massage: "This account is private."
};

/**
 * 需要自动跳入下一个feed的错误类型列表.
 */
export const NEED_AUTO_SKIP_TT_ERRORS: FeedAccountError[] = [
  CHECK_TT_FEED_RESOUCE_ERROR,
  CHECK_TT_FEED_ID_ERROR,
  CHECK_TT_FEED_VIDEO_ACCESS_ERROR,
  CHECK_TT_FEED_PRIVATE_VIDEO_ERROR,
  CHECK_TT_FEED_PRIVATE_ACCOUNT_ERROR
];

/**
 * 用户跳到tt，但是没有follow/like/comment，再跳回抛出的错误.
 */
export const EARN_TT_FEED_ERROR: FeedAccountError = {
  code: 1111,
  error_type: "earn_tt_custom_error",
  massage: "Operation failed."
};

/**
 * tt接口网络出错抛出的错误.
 */
export const CHECK_TT_FEED_NETWORK_ERROR: FeedAccountError = {
  code: 1001,
  error_type: "check_tt_feed_error",
  massage: "Network error."
};

/**
 * post act feed 接口超时抛出的错误.
 */
export const POST_FEED_TIMEOUT_ERROR = {
  code: "ECONNABORTED",
  massage: "Network error."
};

/**
 * tt接口抛出的未知错误.
 */
export const CHECK_TT_FEED_UNKNOWN_ERROR = {
  massage: "unknown error."
};
