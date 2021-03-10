<template>
  <section class="coinFeed" @click="buyCoinFeed">
    <section v-if="delayTime >= 0" class="delay-time">{{ delayTime }}s</section>
    <section class="feedWrap">
      <img
        class="img"
        src="~@/assets/icons-file/earn_coin/lucky_feed@3x.png"
        alt=""
      />
      <section class="reward">
        <p class="reward-title">
          <span>Win</span>
          <span class="reward-coin">{{ offer.lucky_effect.max | format }}</span>
          <span>coins</span>
        </p>
        <p class="reward-subtitle">
          min. {{ offer.lucky_effect.min }} coins guaranteed
        </p>
      </section>
    </section>
    <section class="button">
      <span class="text">Only</span>
      <span class="now-price">{{ offer | getIapPrice }}</span>
      <!-- <span class="prev-price">{{ offer | originalPriceByOffer }}</span> -->
    </section>
  </section>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import eventBus from "@/utils/event_bus/event_bus";

@Component
export default class LUCKY_COIN_FEED extends Vue {
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
  justify-content: center;
  position: relative;
  margin: 26px 25px 0px;
  padding-top: 38px;
  padding-bottom: 60px;
  width: auto;
  background-color: #1c1323;
  border-radius: 10px;
  box-shadow: 0px 4px 15px 0px rgba(51, 51, 51, 0.04);
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
    @include flex-column-default;
    justify-content: center;
    .img {
      margin-bottom: 21px;
      width: 200px;
      height: 150px;
    }
    .reward {
      @include flex-column-default;
      justify-content: center;
      .reward-title {
        margin-bottom: 8px;
        span {
          font-family: AppleSDGothicNeo-Bold;
          font-size: 28px;
          line-height: 28px;
          color: $white;
        }
        .reward-coin {
          margin-left: 5px;
          margin-right: 5px;
          color: #ff1a50;
        }
      }
      .reward-subtitle {
        margin-bottom: 26px;
        font-family: AppleSDGothicNeo-Regular;
        font-size: $font-16;
        line-height: 12px;
        color: #aeb2b7;
      }
    }
  }
  .button {
    @include flex-center;
    margin: 0 28px;
    padding: 8px 54px;
    width: auto;
    background: #ff1a50;
    border-radius: 10px;
    span {
      color: $white;
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
