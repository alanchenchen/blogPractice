import Vue from "vue";
// eslint-disable-next-line
import { Feed } from "../../type";
import {
  HAS_REWARD_FEED_ERROR_CODE,
  FOLLOWER_FEED,
  POST_FEED_KINDS
} from "@/services/earn_coins/constant";
import { CheckFeedAccountStatus } from "@/services/earn_coins/type";
import {
  NEED_AUTO_SKIP_TT_ERRORS,
  POST_FEED_TIMEOUT_ERROR,
  CHECK_TT_FEED_NETWORK_ERROR,
  CHECK_TT_FEED_UNKNOWN_ERROR
} from "@/services/earn_coins/act_feed/manual/error";
import {
  judgeWhetherShowEarnTip,
  checkFeedAvailable,
  goTikTokToEarn,
  noticeCurrentFeedInvalid
} from "./helper";
import { sendGXSuccess, sendGXError } from "@/utils/log_event/api_event";

/**
 * 兼容老版本，跳出到tt的earn逻辑
 * 逻辑如下：
 *
 * 1. 每次actFeed必须要校验当前是否存在tt的已登陆用户.
 * 2. act之前必须检查当前feed的账号是否可用.
 * 3. 以上检测均通过，则跳转到tt的链接。监听切入前台事件，再次拉取feed user信息，比对是否earn成功.
 * 4. earn成功则postActFeed，加币。失败弹出toast，如果错误码表示账号非法，上报给后台.
 * @param currentFeed
 * @param tikTokUserUniqueId
 * @param callSkipFeed
 */
export const runManually = async (
  currentFeed: Feed,
  tikTokUserUniqueId: string,
  callSkipFeed: Function
) => {
  try {
    await judgeWhetherShowEarnTip();
    Vue.prototype.$_Toast.show({
      type: "loading",
      text: "processing..."
    });
    // 校验当前feed用户是否可用
    const { type, data } = await checkFeedAvailable(
      currentFeed,
      tikTokUserUniqueId
    );
    Vue.prototype.$_Toast.hide();
    if (type === CheckFeedAccountStatus.success) {
      await goTikTokToEarn(currentFeed, tikTokUserUniqueId, data);
      // 用户手动act earn操作成功，api打点
      if (currentFeed.kind === FOLLOWER_FEED) {
        sendGXSuccess("tt_api_commit_follow_user_without_login");
      } else if (POST_FEED_KINDS.includes(currentFeed.kind)) {
        sendGXSuccess("tt_api_commit_item_digg_without_login");
      }
      callSkipFeed();
    } else {
      // 再次包装error message
      let errorMessage = data.massage || CHECK_TT_FEED_UNKNOWN_ERROR.massage;
      const needSkip = (NEED_AUTO_SKIP_TT_ERRORS as any).some(
        (error: any) => error.code === data.code
      );
      if (needSkip) {
        errorMessage = (NEED_AUTO_SKIP_TT_ERRORS as any).find(
          (error: any) => error.code === data.code
        ).massage;
        callSkipFeed();
      }
      if (data.code === CHECK_TT_FEED_NETWORK_ERROR.code) {
        errorMessage = CHECK_TT_FEED_NETWORK_ERROR.massage;
      }
      // 主要弹校验feed过程中接口的错误，例如tt网络出错、账号非法、视频无效、账号隐私等.
      Vue.prototype.$_Toast.show({
        type: "fail",
        text: errorMessage
      });
      // 失败会有很多状态码，仅当账号非法才上报后台
      noticeCurrentFeedInvalid(currentFeed, data);
    }
  } catch (error) {
    console.log("earn feed error:", error, currentFeed);
    // post act feed接口报错当前feed失效，直接跳入下一个feed
    if (error.code === HAS_REWARD_FEED_ERROR_CODE) {
      callSkipFeed();
    } else if (error.code === POST_FEED_TIMEOUT_ERROR.code) {
      // post act feed接口超时
      Vue.prototype.$_Toast.show({
        type: "fail",
        text: POST_FEED_TIMEOUT_ERROR.massage
      });
    } else {
      // tt没有follow/like/comment成功
      Vue.prototype.$_Toast.show({
        type: "fail",
        text: error.massage || error.error_message
      });
      // 用户手动act earn操作失败，api打点
      if (currentFeed.kind === FOLLOWER_FEED) {
        sendGXError("tt_api_commit_follow_user_without_login", error);
      } else if (POST_FEED_KINDS.includes(currentFeed.kind)) {
        sendGXError("tt_api_commit_item_digg_without_login", error);
      }
    }
  }
};
