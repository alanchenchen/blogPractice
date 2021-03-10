/* eslint-disable */
import { actFeedAuto } from "./helper";
import { handleTTAccountExpired } from "./utils";
import { Feed } from "../../type";
import ButtonLimitController from "../../button_limit/button_limit";
import ActLimitController from "../../act_limit/act_limit";

/**
 * 阻塞线程
 *
 * @param delay 单位是毫秒
 */
const busy = (delay: number) => {
  const init = new Date().valueOf();
  for (; true; ) {
    const now = new Date().valueOf();
    if (now - init >= delay) {
      break;
    }
  }
};
/**
 * 新版本，在当前app内使用接口earn逻辑
 *
 * @param currentFeed
 * @param callSkipFeed
 */
export const runAutomaticly = async (
  currentFeed: Feed,
  callSkipFeed: Function
) => {
  try {
    callSkipFeed(); // 立马跳入下一个feed，让用户无感
    ButtonLimitController.count(); // 记录按钮限制的次数
    ActLimitController.count(currentFeed); // 记录feed购买逻辑限制的次数
    await actFeedAuto(currentFeed);
  } catch (error) {
    console.log("earn feed error:", error, currentFeed);
    handleTTAccountExpired(error);
  }
};
