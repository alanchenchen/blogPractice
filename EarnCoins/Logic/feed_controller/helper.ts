/* eslint-disable */
import { getFeeds } from "@/api/cg/service/feed";
import { store } from "@/main";
import { GETTER_MASTER_USER_ID } from "@/store/constants/index_types";
import {
  GETTER_CLIENT_SETTINGS,
  GETTER_TAB_EARN_COINS_SETTINGS,
  GETTER_TAB_COIN_STORE_SETTINGS
} from "@/store/constants/setting_types";
import { TT_FEED_KINDS, RANDOM_FEED_KINDS, LUCKY_COIN_FEED } from "../constant";
import { isTTFeed, creatFeedId } from "./utils";
import { Feed } from "../type";

/**
 * 从后台获取feeds流
 *
 * 过滤非tt feeds
 *
 * 过滤当前cache里已经存在的feeds
 *
 * 过滤本地已经被act的feeds
 *
 * @param cache 需要被过滤的源feeds
 * @param usingActFeedsCache 需要被过滤的已经被做过任务的feeds
 */
export const getAndFilterFeeds = async (
  cache: any,
  usingActFeedsCache: any
): Promise<any> => {
  try {
    const res: any = await getFeeds(store.getters[GETTER_MASTER_USER_ID]);
    // 去除非ticktock feeds
    const TTFeeds = res.filter((item: any) =>
      TT_FEED_KINDS().includes(item.kind)
    );
    const existedFeedIDList = cache.map((item: any) => item.feed_id);
    const usingFeedIDList = usingActFeedsCache.map((item: any) => item.feed_id);
    // 过滤掉本地缓存和已经做过任务的feeds
    const noDuplicatedFeeds = TTFeeds.filter((item: any) => {
      return (
        !existedFeedIDList.includes(item.feed_id) &&
        !usingFeedIDList.includes(item.feed_id)
      );
    });
    return noDuplicatedFeeds;
  } catch (error) {
    console.log("get feeds errror:", error);
  }
};

/**
 * 判断是否需要插入特殊feed
 *
 * @param oldFeeds
 * @param usingNormalFeedCount 在此之前已经消耗的普通feed数量
 * @param insertHandler 插入特殊feed的回调函数，通知cache更新
 * @param gap usingNormalFeedCount和feedSpacing之间的间隔，默认为5
 */
export const judgeWhetherInsertRandomFeed = async (
  oldFeeds: Feed[],
  usingNormalFeedCount: number,
  insertHandler: any,
  gap: number = 5
) => {
  try {
    let newFeeds: Feed[] = JSON.parse(JSON.stringify(oldFeeds));
    const { earn_limit } = store.getters[GETTER_CLIENT_SETTINGS];
    const feedSpacing = earn_limit.other_feed_spacing || 5;
    if (usingNormalFeedCount === feedSpacing - gap) {
      const feed = await getRandomFeed();
      const formerFeeds = newFeeds.slice(0, gap + 1);
      const latterFeeds = newFeeds.slice(gap + 1);
      newFeeds = [...formerFeeds, feed, ...latterFeeds];
      console.log(
        `randomFeed has been inserted, you have used ${usingNormalFeedCount} normal feeds before`
      );
      insertHandler(newFeeds);
    }
  } catch (error) {
    return error;
  }
};

/**
 * 根据推荐，生成新的feed
 */
export const getRandomFeed = async (): Promise<any> => {
  try {
    // 从feed coins中根据权重取出:
    let { feed_coin_offers } = store.getters[GETTER_TAB_EARN_COINS_SETTINGS];
    const randomArr = [];
    let totalWeight = 0;

    // 先过滤掉写死的类型：
    feed_coin_offers = feed_coin_offers.filter((offer: any) => {
      return RANDOM_FEED_KINDS.includes(offer.kind);
    });

    // 补全luck coin feed的offer信息
    feed_coin_offers = feed_coin_offers.map((offer: any) => {
      if (offer.kind === LUCKY_COIN_FEED) {
        const targetOffer = { ...offer, ...store.getters[GETTER_TAB_COIN_STORE_SETTINGS].lucky_coin_offers[0] };
        targetOffer.offer_id = offer.offer_id;
        return targetOffer;
      } else {
        return offer;
      }
    });

    // const can_recommend = await super_pay_can_recommend();
    // // 过滤掉super pay的 如果不能显示过滤掉superpay
    // if (!can_recommend) {
    //     feed_coin_offers = feed_coin_offers.filter((offer: any) => {
    //         return !(offer.kind === SUPER_PAY_FEED);
    //     });
    // }

    // const back_up_can_show = await back_up_can_recommend();
    // console.log("back_up_can_show:", back_up_can_show);
    // // 过滤掉back up的:如果不能显示过滤掉backup
    // if (!back_up_can_show) {
    //     feed_coin_offers = feed_coin_offers.filter((offer: any) => {
    //         return !(offer.kind === BACK_UP_FEED);
    //     });
    // }

    for (const item of feed_coin_offers) {
      totalWeight += item.green_light.weight;
    }

    for (const offer of feed_coin_offers) {
      const times: any = Math.ceil(
        (offer.green_light.weight / totalWeight) * 100
      );
      for (let i = 0; i < times; i++) {
        randomArr.push({
          kind: offer.kind,
          sub_kind: offer.kind,
          offer: {
            ...offer
          },
          feed_id: creatFeedId(),
          coins: 0,
          subresources: []
        });
      }
    }

    // 从0-100选一个随机数:
    const randomNum = Math.floor(Math.random() * 100);
    return randomArr[randomNum];
  } catch (error) {
    console.log("getRandomFeed errro:", error);
  }
};

/**
 * 最后一个offer后面跟了多少个普通的feeds
 */
export const getLastOfferFeedIndex = (feeds: any): number => {
  let findFeedOfferIndex: any = null;
  for (let i = 0; i < feeds.length; i++) {
    if (!isTTFeed(feeds[i])) {
      findFeedOfferIndex = i;
    }
  }
  if (findFeedOfferIndex === null) {
    // 没有找到,直接返回获取的长度
    return feeds.length;
  } else {
    return feeds.length - 1 - findFeedOfferIndex;
  }
};

/**
 * 生成最终需要push到cache的feeds
 *
 * @param oldFeeds 需要参考的源feeds
 * @param newFeeds 需要被插入的乱序feeds
 */
export const createInsertFeeds = async (
  oldFeeds: any[],
  newFeeds: any[]
): Promise<any> => {
  const { earn_limit } = store.getters[GETTER_CLIENT_SETTINGS];
  const feedSpacing = earn_limit.other_feed_spacing || 5;
  const remainIndex = getLastOfferFeedIndex(oldFeeds);
  if (remainIndex + newFeeds.length < feedSpacing) {
    return newFeeds;
  } else if (remainIndex + newFeeds.length === feedSpacing) {
    const randomFeeds = await getRandomFeed();
    // 直接插入一个
    randomFeeds && newFeeds.push(randomFeeds);
    return newFeeds;
  } else {
    // 大于feedSpacing
    const newArr = [];
    let totalNum = remainIndex;
    for (const val of newFeeds) {
      totalNum += 1;
      if (totalNum === feedSpacing + 1) {
        const randomFeeds = await getRandomFeed();
        randomFeeds && newArr.push(randomFeeds);
        totalNum = 0;
        continue;
      }
      newArr.push(val);
    }
    return newArr;
  }
};
