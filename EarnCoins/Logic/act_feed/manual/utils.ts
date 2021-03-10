import { FeedAccountInfo, Feed } from "../../type";
import { COMMENT_FEED } from "../../constant";
import jsbridge from "@/jsbridge";
import { isIos } from "@/utils/lodash";

/**
 * 比较两次feed user info的count是否出现增长
 *
 * @param feed
 * @param oldTTInfo earn之前的数据
 * @param currentTTInfo earn之后的数据
 */
export const hasActFeedSuccessfully = (
  feed: Feed,
  oldTTInfo: FeedAccountInfo,
  currentTTInfo: FeedAccountInfo
) => {
  const { subresources, kind } = feed;
  const initialCount = subresources[0].initial_count;
  if (kind === COMMENT_FEED) {
    console.log("act count compare:", initialCount, currentTTInfo);
    return (currentTTInfo as any).count > initialCount;
  } else {
    console.log("act count compare:", oldTTInfo, currentTTInfo);
    return (currentTTInfo as any).count > (oldTTInfo as any).count;
  }
};

/**
 * 兼容ios和android平台，打开tiktok app去earn coin
 *
 * @param ttUrl
 */
export const openTTApp = (ttUrl: string) => {
  // 安卓tt有3个版本，为了避免当前用户没有安装对应版本，所以需要按照顺序去尝试请求打开.
  const androidTTPackages: string[] = [
    "com.zhiliaoapp.musically",
    "com.ss.android.ugc.trill",
    "com.zhiliaoapp.musically.go"
  ];
  return new Promise(async (resolve: any, reject: any) => {
    try {
      if (isIos()) {
        await jsbridge.openBrowser(ttUrl, "system_browser");
      } else {
        for (
          let callCount: number = 0;
          callCount < androidTTPackages.length;
          callCount++
        ) {
          const { result }: any = await jsbridge.openBrowser(
            ttUrl,
            "system_browser",
            {
              package: androidTTPackages[callCount],
              open_app: true
            }
          );
          // 如果当前版本的安卓tt没有安装，则继续打开下一版本tt
          if (result === 1) {
            break;
          }
        }
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};
