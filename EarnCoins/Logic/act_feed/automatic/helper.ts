import { earnCoinArray } from "@/api/tt/tt_login_earn_coin/tt_earn_coin";
// eslint-disable-next-line
import { Feed } from "../../type";
import { actFeed } from "@/api/cg/service/feed";
import { store } from "@/main";
import {
  GETTER_MASTER_USER_ID,
  GETTER_CURRENT_TIKTOK_USER_ID
} from "@/store/constants/index_types";
import { UPDATE_GX_USER_INFO } from "@/store/constants/user_info_types";
/**
 * 通过新接口，不需要跳转直接earn feed.
 *
 * @param feed
 */
export const actFeedAuto = (feed: Feed) => {
  return new Promise(async (resolve: any, reject: any) => {
    const { kind, feed_id } = feed;
    earnCoinArray.addFeedArray(
      feed,
      async () => {
        try {
          const res = await actFeed(
            store.getters[GETTER_MASTER_USER_ID],
            store.getters[GETTER_CURRENT_TIKTOK_USER_ID],
            "ok",
            "",
            kind,
            feed_id,
            "",
            false
          );
          // act成功后加币
          store.commit(UPDATE_GX_USER_INFO, {
            userInfo: res,
            filters: ["coins"]
          });
          resolve();
        } catch (error) {
          reject(error);
        }
      },
      (err: any) => {
        reject(err);
      }
    );
  });
};
