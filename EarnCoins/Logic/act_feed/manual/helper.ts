/* eslint-disable */
import Vue from "vue";
import {
  Feed,
  FeedAccountInfo,
  FeedAccountError,
  CheckFeedAccountResult,
  CheckFeedAccountStatus
} from "../../type";
import {
  FOLLOWER_FEED,
  POST_FEED_KINDS,
  LIKE_FEED,
  COMMENT_FEED,
  FEED_INVALID_ERROR_CODE_LIST
} from "../../constant";
import { EARN_TT_FEED_ERROR } from "./error";
import { hasActFeedSuccessfully, openTTApp } from "./utils";
import { user_detail, item_details } from "@/api/tt/tt_user";
import { actFeed } from "@/api/cg/service/feed";
import ApplifeCycle from "@/utils/app_lifecycle";
import { store } from "@/main";
import {
  GETTER_MASTER_USER_ID,
  GETTER_CURRENT_TIKTOK_USER_ID
} from "@/store/constants/index_types";
import { UPDATE_GX_USER_INFO } from "@/store/constants/user_info_types";
import WebLocalStorageWorker from "@/utils/localstorage/web_local_storage";
import { HAS_SHOW_EARN_COIN_TIP } from "@/utils/localstorage/local_keys/web_local_keys";

/**
 * 校验当前feed的账号是否可用，可用返回当前tt用户信息，否则返回错误信息.通过type来判断.
 *
 * @param feed
 * @param currentUniqueId 当前选中登陆的用户uniqueId
 * @param needCheck 是否需要检测feed合法，默认true
 */
export const checkFeedAvailable = async (
  feed: Feed,
  currentUniqueId: string,
  needCheck = true
): Promise<CheckFeedAccountResult> => {
  const returnVal: CheckFeedAccountResult = { type: -1, data: {} };
  try {
    let checkStatus: boolean = true;
    let checkResult: any;
    const { subresources, kind } = feed;
    const info: FeedAccountInfo = {
      kind,
      raw: null
    };
    let handler: any = null;
    let param: any = null;

    if (kind === FOLLOWER_FEED) {
      handler = user_detail;
      param = subresources[0].username;
    } else if (POST_FEED_KINDS.includes(kind)) {
      handler = item_details;
      param = subresources[0].media_id;
    }
    // 切回后台，如果feed不是comment，不需要再检查
    if (needCheck) {
      checkResult = await handler(param);
      checkStatus = checkResult.statusCode === 0;
    }
    if (checkStatus) {
      if (kind === FOLLOWER_FEED) {
        const { userInfo } = await user_detail(currentUniqueId);
        info.count = userInfo.stats.followingCount;
        info.raw = userInfo;
      } else if (kind === LIKE_FEED) {
        const { userInfo } = await user_detail(currentUniqueId);
        info.count = userInfo.stats.diggCount;
        info.raw = userInfo;
      } else if (kind === COMMENT_FEED && !needCheck) {
        const { itemInfo } = await item_details(param);
        info.count = itemInfo.itemStruct.stats.commentCount;
        info.raw = itemInfo;
      }
      returnVal.type = CheckFeedAccountStatus.success;
      returnVal.data = info;
    }
    return returnVal;
  } catch (error) {
    console.log("check feed valid error:", error, feed);
    returnVal.type = CheckFeedAccountStatus.fail;
    returnVal.data = error;
    return returnVal;
  }
};

/**
 * 跳转到tikTok手动earn，然后跳回app，检测是否earn成功，成功则postActFeed给后台.
 *
 * @param feed
 * @param currentUniqueId 当前选中登陆的用户uniqueId
 * @param prevTTInfo 上次checkFeedValid之后得到的tt用户信息
 */
export const goTikTokToEarn = (
  feed: Feed,
  currentUniqueId: string,
  prevTTInfo: FeedAccountInfo
) => {
  return new Promise(async (resolve: any, reject: any) => {
    try {
      const { subresources, kind, feed_id } = feed;
      const uniqueId = subresources[0].username;
      const itemId = subresources[0].media_id;
      let ttUrl: string = "";
      if (kind === FOLLOWER_FEED) {
        ttUrl = `https://www.tiktok.com/@${uniqueId}`;
      } else if (POST_FEED_KINDS.includes(kind)) {
        ttUrl = `https://www.tiktok.com/@${uniqueId}/video/${itemId}`;
      }
      ApplifeCycle.removeListener("earn_tiktok_feed");
      ApplifeCycle.addFrontListener(async () => {
        try {
          const { type, data } = await checkFeedAvailable(
            feed,
            currentUniqueId,
            false
          );
          if (type === CheckFeedAccountStatus.success) {
            if (hasActFeedSuccessfully(feed, prevTTInfo, data)) {
              const res = await actFeed(
                store.getters[GETTER_MASTER_USER_ID],
                store.getters[GETTER_CURRENT_TIKTOK_USER_ID],
                "ok",
                "",
                kind,
                feed_id,
                data.raw,
                false
              );
              // act成功后加币
              store.commit(UPDATE_GX_USER_INFO, {
                userInfo: res,
                filters: ["coins"]
              });
              resolve();
            } else {
              // 没有手动earn成功，自定义一个错误
              reject(EARN_TT_FEED_ERROR);
            }
          }
        } catch (error) {
          // 主要是postActFeed接口错误
          reject(error);
        }
        ApplifeCycle.removeListener("earn_tiktok_feed");
      }, "earn_tiktok_feed");
      await openTTApp(ttUrl);
    } catch (error) {
      console.log("earn tikTok feed error:", error, feed);
      // 主要是跳到tt app接口错误
      reject(error);
    }
  });
};

/**
 * act feed前，如果校验账户非法，则上报错误账户给后台
 *
 * @param feed
 * @param errorData checkFeedValid校验返回的error
 */
export const noticeCurrentFeedInvalid = async (
  feed: Feed,
  errorData: FeedAccountError
) => {
  try {
    const { kind, feed_id } = feed;
    const { code, massage } = errorData;
    if (FEED_INVALID_ERROR_CODE_LIST.includes(code)) {
      await actFeed(
        store.getters[GETTER_MASTER_USER_ID],
        store.getters[GETTER_CURRENT_TIKTOK_USER_ID],
        "fail",
        massage === undefined ? "" : massage,
        kind,
        feed_id,
        {},
        false
      );
    }
  } catch (error) {
    console.log("notice current feed invalid to server error:", error);
  }
};

/**
 * 在earn 之前检测是否需要在当前app安装周期内只弹窗一次tip
 */
export const judgeWhetherShowEarnTip = () => {
  return new Promise((resolve: any) => {
    const hasShow = WebLocalStorageWorker.has(HAS_SHOW_EARN_COIN_TIP);
    if (!hasShow) {
      Vue.prototype.$_Dialog.show({
        title: "Friendly Reminder",
        content: {
          text:
            "To earn coins, the account you selected must be the same as your login account in the official TikTok app."
        },
        onConfirm(done: any) {
          done();
          WebLocalStorageWorker.set(HAS_SHOW_EARN_COIN_TIP, true);
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
};
