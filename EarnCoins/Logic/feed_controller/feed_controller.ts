/**
 * Feeds 管理：
 * 1.feeds的添加 : 添加要根据space来动态添加
 * 2.feeds的替换 : 替换掉不能用的feed_id
 * 3.feeds的过滤 : 重复feed_id的过滤；服务器下发的offer过滤掉
 */

/* eslint-disable */
import Watcher from "./watcher";
import { getAndFilterFeeds, judgeWhetherInsertRandomFeed } from "./helper";
import { Feed } from "../type";
import {
  MIN_FEEDS_STACK_NUM,
  MAX_RETRY_PULL_FEEDS_NUM,
  TT_FEED_KINDS
} from "../constant";

class FeedController extends Watcher {
  constructor() {
    super();
  }

  private cache: Feed[] = [];
  // 已经act过的缓存，需要一直保存。因为act可能是在队列里未及时通知后台。需要拿usingActFeedsCache和cache与后台数据去重
  private usingActFeedsCache: Feed[] = [];
  // 记录useFeed过程中缓存队列弹出去的普通feed次数，用于补充feed coin这类特殊feed逻辑，每当补充一次，则清空count
  private usingNormalFeedCount: number = 1;
  // 加一个processing状态，用于等待补充feeds操作，避免请求接口补充未完成而触发多次refresh效果.
  private isProcessing: boolean = false;

  /**
   * 初始化controlloer.
   * 监听ui事件函数，并刷新feeds
   *
   * @param handler 当cache数据发生改变，该函数都会执行，建议直接绑定vue实例的data，会触发render
   */
  public async init(handler: any) {
    this.observe(handler);
    await this.refreshFeeds();
  }

  /**
   * 使用feed做任务.
   * 1. 偷偷给下一个feed补充为特殊fedd.
   * 2. 如果当前feed缓存队列只剩下 MIN_FEEDS_STACK_NUM 个，则需要从接口中补
   */
  public async useFeed() {
    try {
      await judgeWhetherInsertRandomFeed(
        this.cache,
        this.usingNormalFeedCount,
        (feeds: Feed[]) => (this.cache = feeds),
        3
      );
      this.cache.shift();
      this.notice(this.cache);
      this.countUsingNormalFeedNumber();
      if (this.cache.length <= MIN_FEEDS_STACK_NUM) {
        // 偷偷补充队列，补充后不通知ui，因为当前队列第一个feed没改变
        this.refreshFeeds(false);
      }
    } catch (error) {
      console.log("use feeds error:", error);
    }
  }

  /**
   * 记录做任务act的feed，skip不需要记录。在act触发立马调用，不需要等待act成功触发postAct接口。
   *
   * @param feed
   */
  public countActFeedsCache(feed: Feed) {
    const isDumplicated = this.usingActFeedsCache.some(
      item => feed.feed_id === item.feed_id
    );
    if (!isDumplicated) {
      this.usingActFeedsCache.push(feed);
    }
    // 保持usingActFeedsCache长度在60，避免内存占用过多导致卡顿
    if (this.usingActFeedsCache.length >= 60) {
      this.usingActFeedsCache.splice(0, 10);
    }
  }

  /**
   * 刷新feeds.
   * 从接口获取乱序feeds，然后根据setting的概率参数，插入并排序缓存中feeds队列.
   *
   * @param shoudlNotice 补充feeds后，是否立即通知ui监听函数执行，默认true
   */
  public async refreshFeeds(shoudlNotice = true) {
    try {
      if (!this.isProcessing) {
        this.isProcessing = true;
        const needInsertfeeds = await getAndFilterFeeds(
          this.cache,
          this.usingActFeedsCache
        );
        this.cache.push(...needInsertfeeds);
        // if (this.cache.length < MAX_RETRY_PULL_FEEDS_NUM) {
        //   this.refreshFeeds();
        // }
        shoudlNotice === true && this.notice(this.cache);
        this.isProcessing = false;
        // console.log("need insert feeds:", needInsertfeeds);
        // console.log("current feeds:", this.cache);
      } else {
        console.log("refreshFeeds is proccessing... please wait.");
      }
    } catch (error) {
      this.isProcessing = false;
      console.log("refresh feeds error:", error);
    }
  }

  /**
   * 记录消耗的普通feeds数量，一旦消耗特殊feed，立马重置为0
   */
  private countUsingNormalFeedNumber() {
    if (this.cache[0]) {
      const { kind } = this.cache[0];
      if (TT_FEED_KINDS().includes(kind)) {
        this.usingNormalFeedCount++;
      } else {
        this.usingNormalFeedCount = 0;
      }
    }
  }
}

export default new FeedController();
