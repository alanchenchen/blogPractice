// eslint-disable-next-line
import { ActFeedAutoError } from "../../type";

/**
 * 不开vpn earncoin，网络问题
 */
export const NETWORK_ERROR: ActFeedAutoError = {
  error_type: "page_not_available",
  error_message: "Network error."
};

/**
 * tt登录账号过期
 */
export const TT_ACOUNT_EXPIRED_ERROR: ActFeedAutoError = {
  error_type: "login_required",
  error_message: "Your account has expired, please login again."
};

/**
 * feed不存在，可能是被用户删掉了
 */
export const FEED_INVALID_ERROR: ActFeedAutoError = {
  error_type: "feed_not_exist",
  error_message: "This video is invalid."
};

/**
 * feed已经被用户follow｜like了
 */
export const FEED_NO_REWARD_ERROR: ActFeedAutoError = {
  error_type: "had_feed",
  error_message: "had_feed."
};

/**
 * 发送follow或者like的api失败
 */
export const REQUEST_ERROR: ActFeedAutoError = {
  error_type: "request_error",
  error_message: "request_error."
};

export const AUTOMATIC_EARN_NEED_STKIP_FEED_ERRORS = [
  FEED_INVALID_ERROR,
  FEED_NO_REWARD_ERROR,
  REQUEST_ERROR
];
