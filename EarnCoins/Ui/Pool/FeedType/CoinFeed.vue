<template>
  <section class="coinFeed" @click="buyCoinFeed">
    <section v-if="delayTime >= 0" class="delay-time">{{ delayTime }}s</section>
    <section class="feedWrap">
      <section class="discount">
        <p>
          <span class="discount-num">{{ offer.discount }}</span>
          <span class="discount-symbol">%</span>
        </p>
        <p class="discount-tip">OFF</p>
      </section>
      <img
        class="img"
        src="~@/assets/icons-file/earn_coin/coin@3x.png"
        alt=""
      />
      <section class="reward">
        <section class="inner">
          <p class="reward-coin">{{ offer.effect | format }}</p>
          <p class="reward-symbol">coins</p>
        </section>
      </section>
    </section>
    <section class="button">
      <span class="text">Only</span>
      <span class="now-price">{{ offer | getIapPrice }}</span>
      <span class="prev-price">{{ offer | originalPriceByOffer }}</span>
    </section>
  </section>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import eventBus from "@/utils/event_bus/event_bus";

@Component
export default class CoinFeed extends Vue {
  @Prop()
  private offer: any;

  private delayTime: number = 0;
  private delayInterval: any;

  private buyCoinFeed() {
    this.$emit("buyCoinFeed");
  }

  private startDelay() {
    this.delayInterval = setInterval(() => {
      if (this.delayTime >= 0) {
        this.delayTime--;
      } else {
        clearInterval(this.delayInterval);
      }
      if (this.delayTime < 0) {
        eventBus.$emit("earn_feed_coin_show_skip", true);
      }
    }, 1000);
  }

  private initDelayTime() {
    const { green_light } = this.offer;
    if (green_light) {
      this.delayTime = green_light.skip_delay;
    }
  }

  private created() {
    eventBus.$emit("earn_feed_coin_show_skip", false);
    this.initDelayTime();
    this.startDelay();
  }

  private beforeDestroy() {
    clearInterval(this.delayInterval);
  }
}
</script>

<style scoped lang="scss">
.coinFeed {
  @include flex-column-default;
  padding-top: 55px;
  position: relative;
  width: 100%;
  .delay-time {
    position: absolute;
    top: 30px;
    right: 20px;
    padding: 1px 9px;
    background-color: #554f58;
    border-radius: 8px;
    font-family: AppleSDGothicNeo-Regular;
    font-size: $font-12;
    color: #bbb5bf;
  }
  .feedWrap {
    position: relative;
    .discount {
      @include flex-column-default;
      margin-left: 14px;
      padding-top: 18px;
      width: 140px;
      height: 144px;
      background-image: url(~@/assets/icons-file/earn_coin/discount@3x.png);
      background-size: cover;
      .discount-num {
        font-family: AppleSDGothicNeo-Heavy;
        font-size: 48px;
        color: #fffdff;
      }
      .discount-symbol {
        font-family: AppleSDGothicNeo-ExtraBold;
        font-size: 28px;
        color: #fffdff;
      }
      .discount-tip {
        font-family: AppleSDGothicNeo-Heavy;
        font-size: 28px;
        color: #fffdff;
      }
    }
    .img {
      position: relative;
      top: -32px;
      width: 158px;
      height: 129px;
    }
    .reward {
      position: absolute;
      bottom: 23px;
      right: -27px;
      width: 84px;
      height: 84px;
      background-image: url(~@/assets/icons-file/earn_coin/bubble@3x.png);
      background-size: cover;
      .inner {
        width: 100%;
        height: 100%;
        @include flex-column-default;
        justify-content: center;
        transform: rotateZ(-12deg);
        .reward-coin {
          font-family: AppleSDGothicNeo-ExtraBold;
          font-size: 24px;
          color: #f8185f;
        }
        .reward-symbol {
          font-family: AppleSDGothicNeo-ExtraBold;
          font-size: 12px;
          color: #121111;
        }
      }
    }
  }
  .button {
    @include flex-center;
    margin: 0 28px;
    padding: 8px 38px 8px 33px;
    width: auto;
    background: #e3b475;
    border-radius: 10px;
    span {
      color: #643400;
    }
    .text {
      font-family: AppleSDGothicNeo-Regular;
      font-size: $font-12;
    }
    .now-price {
      margin: 0 8px;
      font-family: AppleSDGothicNeo-Bold;
      font-size: $font-16;
    }
    .prev-price {
      font-family: AppleSDGothicNeo-Regular;
      font-size: $font-12;
      text-decoration: line-through;
    }
  }
}
</style>
