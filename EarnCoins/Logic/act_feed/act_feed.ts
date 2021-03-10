import { shouldUseNewTTLogic } from "@/utils/general_utils";
import { Feed } from "../type";
import { runManually } from "./manual";
import { runAutomaticly } from "./automatic";

class EarnActFeed {
  /**
   * 自动根据原生版本号选择使用哪种act feed方式.
   *
   * @param feed
   * @param tikTokUserUniqueId
   * @param callSkipFeed
   */
  public async run(
    feed: Feed,
    tikTokUserUniqueId: string,
    callSkipFeed: Function
  ) {
    try {
      if (shouldUseNewTTLogic("1.1.0")) {
        await runAutomaticly(feed, callSkipFeed);
      } else {
        await runManually(feed, tikTokUserUniqueId, callSkipFeed);
      }
    } catch (error) {
      return error;
    }
  }
}

export default new EarnActFeed();
