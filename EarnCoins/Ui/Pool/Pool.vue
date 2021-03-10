<template>
  <section class="Pool">
    <PoolLoading v-if="loading" />
    <FeedLimit
      v-else-if="limited"
      :limited-end-time-stamp="limitedDurationTimestamp"
      @shouldCloseLimit="shouldCloseLimit"
    />
    <template v-else>
      <AccountFeed v-if="feedType === FOLLOWER_FEED" :resource="feedResource" />
      <PostFeed
        v-if="POST_FEED_KINDS.includes(feedType)"
        :resource="feedResource"
      />
      <CoinFeed
        v-if="feedType === COIN_FEED"
        :offer="coinFeedOffer"
        @buyCoinFeed="buyCoinFeed"
      />
      <LuckyCoinFeed
        v-if="feedType === LUCKY_COIN"
        :offer="coinFeedOffer"
        @buyCoinFeed="buyCoinFeed"
      />
      <EmptyFeed v-if="feed === null" />
    </template>
  </section>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import AccountFeed from "./FeedType/AccountFeed.vue";
import PostFeed from "./FeedType/PostFeed.vue";
import CoinFeed from "./FeedType/CoinFeed.vue";
import LuckyCoinFeed from "./FeedType/LuckyCoinFeed.vue";
import EmptyFeed from "./FeedType/EmptyFeed.vue";
import FeedLimit from "./FeedLimit/FeedLimit.vue";
import PoolLoading from "./PoolLoading/PoolLoading.vue";

import {
  FOLLOWER_FEED,
  COIN_FEED,
  LUCKY_COIN,
  POST_FEED_KINDS
} from "@/services/earn_coins/constant";

@Component({
  components: {
    AccountFeed,
    PostFeed,
    CoinFeed,
    LuckyCoinFeed,
    EmptyFeed,
    FeedLimit,
    PoolLoading
  }
})
export default class Pool extends Vue {
  @Prop()
  private feed: any;
  @Prop({ type: Boolean })
  private loading: any;
  @Prop()
  private limited: any;
  @Prop()
  private limitedDurationTimestamp: any;

  private FOLLOWER_FEED: string = FOLLOWER_FEED;
  private COIN_FEED: string = COIN_FEED;
  private LUCKY_COIN: string = LUCKY_COIN;
  private POST_FEED_KINDS: string[] = POST_FEED_KINDS;

  get feedType() {
    return this.feed && this.feed.kind && this.feed.kind.toLowerCase();
  }

  get coinFeedOffer() {
    return this.feed && this.feed.offer;
  }

  get feedResource() {
    return this.feed && this.feed.subresources[0];
  }

  private buyCoinFeed() {
    this.$emit("buyCoinFeed");
  }

  private shouldCloseLimit() {
    this.$emit("shouldCloseLimit");
  }
}
</script>

<style scoped lang="scss"></style>
