/* eslint-disable */
import WebIndexDBLocalStorage from "@/utils/localstorage/web_indexDB";
import { store } from "@/main";
import { GETTER_CLIENT_SETTINGS } from "@/store/constants/setting_types";
import { GEETER_TIKTOK_LOGIN_USER } from "@/store/constants/tiktok_user_types";
import { EarnLimitLogicLockData, Feed } from "../type";
import { FOLLOWER_FEED, LIKE_FEED } from "../constant";
import Watcher from "../feed_controller/watcher";
import { diffAndInsertArray } from "./utils";

const EARN_LIMIT_DB_KEY = "EARN_COINS_LIMIT_DB";
const EmptyLockData: EarnLimitLogicLockData = {
  userId: "",
  followCount: 0,
  followTimestamp: 0,
  likeCount: 0,
  likeTimestamp: 0,
  reachedLimitType: "",
  reachedLimitDurationTimestamp: 0
};

class ActLimitController extends Watcher {
  private followLimitCount: number = 0; // follow限制的次数
  private followLimitTime: number = 0; // follow限制的周期时间，单位是秒
  private likeLimitCount: number = 0; // like限制的次数
  private likeLimitTime: number = 0; // like限制的周期时间，单位是秒
  private currentTTUser: string = ""; // 当前登录的tt用户
  private currentLockData: EarnLimitLogicLockData = EmptyLockData; // 当前内存里保存的tt用户数据
  private refreshTimestamp: number = 0; // 重置的日期时间戳毫秒数

  /**
   * 初始化一切数据，并绑定监听函数
   *
   * @param handler 监听的回调函数，当到达限制逻辑触发
   */
  public async init(handler: any) {
    this.initLimitDataFromSetting();
    await this.initUserDataFormDB();
    this.observe(handler);
    this.judgeWhetherNoticeLimitWhileInit();
  }

  /**
   * 计数act，调用act feed则调用一次count
   *
   * @param feed
   */
  public count(feed: Feed) {
    try {
      const { kind } = feed;
      if (kind === FOLLOWER_FEED) {
        this.currentLockData.followCount++;
      } else if (kind === LIKE_FEED) {
        this.currentLockData.likeCount++;
      }
      const hasReached = this.judgeWhetherReachLimitation(
        kind
      );
      /**
       * 如果逻辑受限：
       * 1. 先存储当前账号受限的feed类型和限制时间戳，用于下次初始化判断，是否需要初始化立马展示受限逻辑
       * 2. 立马通知vue组件，展示受限逻辑ui，走倒计时
       */
      if (hasReached) {
        const deadlineTimestamp = this.calculateLimitDurationTimestamp(kind);
        this.currentLockData.reachedLimitType = kind;
        this.currentLockData.reachedLimitDurationTimestamp = deadlineTimestamp;
        this.notice(deadlineTimestamp);
      }
      this.storeDataToDB();
      console.log("当前限制逻辑账号数据：", this.currentLockData);
    } catch (error) {
      console.log("[ActLimitController count error]:", error);
    }
  }

  /**
   * 到达限制逻辑后，根据feed类型，重置当前用户的count和timestamp。由外部调用
   *
   * @param feedKind feed类型
   * @param count 指定重置的计数
   */
  public resetCount(feedKind: string, count: number = 0) {
    if (feedKind === FOLLOWER_FEED) {
      this.currentLockData.followTimestamp = this.refreshTimestamp;
      this.currentLockData.followCount = count;
    } else if (feedKind === LIKE_FEED) {
      this.currentLockData.likeTimestamp = this.refreshTimestamp;
      this.currentLockData.likeCount = count;
    }
  }

  /**
   * 是否成功切换tt用户登录
   */
  public hasSwitchTTUser() {
    return (
      this.currentTTUser !== store.getters[GEETER_TIKTOK_LOGIN_USER].user_id
    );
  }

  /**
   * 重置用户信息，当切换登录账号后调用
   */
  public reload() {
    this.initUserDataFormDB();
  }

  /**
   * 从setting中初始化follow/like的限制逻辑点击次数和周期
   */
  private initLimitDataFromSetting() {
    try {
      const { earn_limit } = store.getters[GETTER_CLIENT_SETTINGS];
      const {
          window_follow_limit,
          window_like_limit,
          ratelimit_followerwindow_size,
          ratelimit_slidingwindow_size
      } = earn_limit.level_1;
      this.followLimitCount = window_follow_limit;
      this.followLimitTime = ratelimit_followerwindow_size * 1000;
      this.likeLimitCount = window_like_limit;
      this.likeLimitTime = ratelimit_slidingwindow_size * 1000;
      /**
       * test code.
       */
      // this.followLimitCount = 3;
      // this.followLimitTime = 300000;
      // this.likeLimitCount = 3;
      // this.likeLimitTime = 300000;
    } catch (error) {
      console.log(
        "[ActLimitController initLimitDataFromSetting error]:",
        error
      );
    }
  }

  /**
   * 从DB里初始化当前登录tt用户的数据
   */
  private async initUserDataFormDB() {
    try {
      this.currentTTUser = store.getters[GEETER_TIKTOK_LOGIN_USER].user_id;
      const userList = await WebIndexDBLocalStorage.get(EARN_LIMIT_DB_KEY);
      const isDBExist = WebIndexDBLocalStorage.has(EARN_LIMIT_DB_KEY);
      const isUserExist =
        isDBExist &&
        userList !== null &&
        userList.some(
          (item: EarnLimitLogicLockData) => item.userId === this.currentTTUser
        );
      if (isUserExist) {
        this.currentLockData = userList.find(
          (item: EarnLimitLogicLockData) => item.userId === this.currentTTUser
        );
      } else {
        this.currentLockData = EmptyLockData;
        this.currentLockData.userId = this.currentTTUser;
      }
    } catch (error) {
      console.log("[ActLimitController initUserDataFormDB error]:", error);
    }
  }

  /**
   * 初始化时，如果处于受限漏记，判断是否立即通知ui显示倒计时长
   */
  private judgeWhetherNoticeLimitWhileInit() {
    console.log("初始化限制逻辑当前账号：", this.currentLockData);
    const hasReached = this.judgeWhetherReachLimitation(
      this.currentLockData.reachedLimitType
    );
    if (hasReached) {
      this.notice(this.currentLockData.reachedLimitDurationTimestamp);
    }
    console.log("初始化是否已经到达限制逻辑", hasReached);
  }

  /**
   * 当触发限制逻辑时，计算倒计时组件的时间戳毫秒数
   *
   * @param feedKind feed类型
   */
  private calculateLimitDurationTimestamp(feedKind: string): number {
    let endTimestamp = 0;
    if (feedKind === FOLLOWER_FEED) {
      endTimestamp =
        this.followLimitTime + this.currentLockData.followTimestamp;
    } else if (feedKind === LIKE_FEED) {
      endTimestamp = this.likeLimitTime + this.currentLockData.likeTimestamp;
    }
    return endTimestamp;
  }

  /**
   * 判断是否到达限制逻辑
   *
   * @param feedKind feed类型
   */
  private judgeWhetherReachLimitation(feedKind: string) {
    const nowTimestamp = new Date().valueOf();
    this.refreshTimestamp = nowTimestamp;
    let hasReached = false;
    if (feedKind === FOLLOWER_FEED) {
      // 如果第一次count，则先记录初始化时间戳
      if (this.currentLockData.followTimestamp === 0) {
        this.currentLockData.followTimestamp = nowTimestamp;
      }
      // 如果时间差远超过限制周期，则初始化用户数据
      if (
        nowTimestamp - this.currentLockData.followTimestamp >
        this.followLimitTime
      ) {
        this.resetCount(feedKind, 1);
      }
      hasReached =
        this.currentLockData.followCount >= this.followLimitCount &&
        nowTimestamp - this.currentLockData.followTimestamp <=
          this.followLimitTime;
    } else if (feedKind === LIKE_FEED) {
      // 如果第一次count，则先记录初始化时间戳
      if (this.currentLockData.likeTimestamp === 0) {
        this.currentLockData.likeTimestamp = nowTimestamp;
      }
      // 如果时间差远超过限制周期，则初始化用户数据
      if (
        nowTimestamp - this.currentLockData.likeTimestamp >
        this.likeLimitTime
      ) {
        this.resetCount(feedKind, 1);
      }
      hasReached =
        this.currentLockData.likeCount >= this.likeLimitCount &&
        nowTimestamp - this.currentLockData.likeTimestamp <= this.likeLimitTime;
    }
    return hasReached;
  }

  /**
   * diff当前userData和DB里数据，增量存入DB。在不需要操作当前用户限制逻辑前调用
   */
  private async storeDataToDB() {
    try {
      let userList = await WebIndexDBLocalStorage.get(EARN_LIMIT_DB_KEY);
      if (userList === null) {
        userList = [];
      }
      const needStoreData = diffAndInsertArray(userList, this.currentLockData);
      WebIndexDBLocalStorage.set(EARN_LIMIT_DB_KEY, needStoreData);
    } catch (error) {
      console.log("[ActLimitController storeDataToDB error]:", error);
    }
  }
}

export default new ActLimitController();
