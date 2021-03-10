/* eslint-disable */
export interface Feed {
  coins: number;
  feed_id: string;
  kind: string;
  sub_kind: string;
  subresources: any[];
}

export interface FeedAccountInfo {
  kind: string;
  count?: number;
  raw: any;
}

/**
 * 手动跳tt抛出的错误
 */
export interface FeedAccountError {
  code: number;
  error_type: string;
  massage: string;
}

export interface CheckFeedAccountResult {
  type: number;
  data: any;
}

export enum CheckFeedAccountStatus {
  success,
  fail
}

/**
 * 新接口抛出的错误
 */
export interface ActFeedAutoError {
  error_type: string;
  error_message: string;
}
/**
 * 新接口限制逻辑每个tt登录账号的数据
 */
export interface EarnLimitLogicLockData {
  userId: string; // 当前登录用户id
  followCount: number; // 当前账号已经follow数量
  followTimestamp: number; // 当前账号第一次follow或重置限制逻辑后的时间戳
  likeCount: number; // 当前账号已经like数量
  likeTimestamp: number; // 当前账号第一次like或重置限制逻辑后的时间戳
  reachedLimitType: string | "follow" | "like"; // 触发限制逻辑的类型
  reachedLimitDurationTimestamp: number; // 触发限制逻辑后倒计时长的时间戳
}
