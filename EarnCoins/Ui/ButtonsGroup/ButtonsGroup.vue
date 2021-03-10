<template>
  <section class="buttons-group">
    <section v-if="shouldSkip" class="skip" @click="handleSkip">
      Skip
    </section>
    <!--reward 按钮-->
    <section
      v-if="shouldShowRewardButton"
      class="actFeed"
      :class="{ disabled: limited }"
      @click="handleActFeed"
    >
      <section class="actFeed-button">
        <span>{{ feedType }}</span>
        <section class="award">
          <span class="coin">+{{ feedCoinCount }}</span>
          <img
            class="img"
            src="~@/assets/icons-file/coin_store/coin@3x.png"
            alt=""
          />
        </section>
        <!--限制按钮的倒计时-->
        <span v-if="limited"> {{ limitDurationText }}</span>
      </section>
    </section>
    <!--retry按钮-->
    <section
      v-else
      class="actFeed"
      :class="{ disabled: loading }"
      @click="handleGet"
    >
      <section
        class="actFeed-button"
        :class="{
          fontRed: feed !== null && [coinFeed, luckyCoin].includes(feed.kind)
        }"
      >
        {{ bottomButtonText }}
      </section>
    </section>
    <p class="toCoinStore" @click="handleMoreCoins">More Coins</p>
  </section>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import ButtonLimitController from "@/services/earn_coins/button_limit/button_limit";
import {
  TT_FEED_KINDS,
  RANDOM_FEED_KINDS,
  COIN_FEED,
  LUCKY_COIN
} from "@/services/earn_coins/constant";
import eventBus from "@/utils/event_bus/event_bus";

@Component
export default class ButtonsGroup extends Vue {
  @Prop()
  private feed: any;
  @Prop({ default: false, type: Boolean })
  private loading: any;

  private limited: boolean = false;
  private limitedDuration: number = 1;
  private interval: any;
  private isShowSkipWhenFeedCoin: boolean = true; // 当pool是feed coin时，是否展示skip
  private coinFeed: string = COIN_FEED;
  private luckyCoin: string = LUCKY_COIN;

  get shouldSkip() {
    return (
      !this.shouldRetry &&
      !this.loading &&
      (!this.limited ||
        RANDOM_FEED_KINDS.includes(this.feedType.toLowerCase())) &&
      this.isShowSkipWhenFeedCoin
    );
  }

  get shouldShowRewardButton() {
    const lowercase = this.feedType.toLowerCase();
    if (TT_FEED_KINDS().includes(lowercase)) {
      return true;
    } else {
      return false;
    }
  }

  get shouldRetry() {
    return this.feed === null;
  }

  get bottomButtonText() {
    if (this.shouldRetry) {
      return this.loading ? "Wait" : "Rerty";
    } else {
      return "Get";
    }
  }

  get limitDurationText() {
    return `(${this.limitedDuration}s)`;
  }

  get feedType() {
    const kind = (this.feed && this.feed.kind) || "";
    const format = kind.substring(0, 1).toUpperCase() + kind.substring(1);
    return format;
  }

  get feedCoinCount() {
    return this.feed && this.feed.coins;
  }

  @Watch("feed")
  private onFeedChange() {
    this.limited = ButtonLimitController.lockStatus();
    this.limitedDuration = ButtonLimitController.lockDuration();
  }

  @Watch("limited")
  private onLimitedChange(val: boolean) {
    if (val) {
      this.interval = setInterval(() => {
        if (this.limitedDuration <= 1) {
          clearInterval(this.interval);
          this.resetButtonLimitLock();
        } else {
          this.limitedDuration--;
        }
      }, 1000);
    }
  }

  /**
   * 当按钮倒计时走完后解除lock限制
   */
  private resetButtonLimitLock() {
    ButtonLimitController.resetLock();
    this.limited = ButtonLimitController.lockStatus();
    this.limitedDuration = ButtonLimitController.lockDuration();
  }

  private handleSkip() {
    // 当按钮限制已经加过锁后，skip之后也需要count
    // if (ButtonLimitController.hasLocked()) {
    //   ButtonLimitController.count();
    // }
    this.$emit("skipFeed");
  }

  private handleActFeed() {
    if (!this.limited) {
      this.$emit("actFeed");
    }
  }

  private handleGet() {
    if (!this.loading) {
      if (this.shouldRetry) {
        this.$emit("retryFeed");
      } else {
        this.$emit("handleSpecialFeed");
      }
    }
  }

  private handleMoreCoins() {
    this.$emit("clickMore");
  }

  private created() {
    eventBus.$off("earn_feed_coin_show_skip");
    eventBus.$on("earn_feed_coin_show_skip", (status: boolean) => {
      this.isShowSkipWhenFeedCoin = status;
    });
  }

  private beforeDestroy() {
    eventBus.$off("earn_feed_coin_show_skip");
  }
}
</script>

<style scoped lang="scss" src="./buttons_group.scss"></style>
