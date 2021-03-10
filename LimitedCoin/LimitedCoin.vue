<template>
  <div
    v-if="isShowLimitedCoin && !isDouble && limitedCoinOffers"
    class="limit-coin"
    @click="clickSingle"
  >
    <div class="outer">
      <div class="discount">
        <img
          class="discount_img"
          src="@/assets/icons-file/coin_store/badge_limited_discount.png"
        />
        <p class="discount-percent">
          <span>{{ limitedCoinOffers.discount }}%</span>
          <span class="percent-tip"> OFF</span>
        </p>
      </div>
      <CountDwonTime
        class="countdown"
        :type="false"
        :end-time-stamp="limitedCoinDuration"
        @countDownTimeEnded="countDownTimeEnded"
      />
      <div class="inner">
        <div class="coin_wrappe">
          <img src="@/assets/icons-file/coin_store/bonus_coins.png" />
          <div class="coins_box">
            <p class="coins_number">{{ limitedCoinOffers.effect | format }}</p>
            <span class="coins_unit">Coins</span>
          </div>
          <div class="original-price">
            {{ limitedCoinOffers | originalPriceByOffer }}
          </div>
          <div class="button">
            {{ limitedCoinOffers | getIapPrice }}
          </div>
        </div>
        <div class="tik-green"></div>
        <div class="tik-red"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { Getter, Action } from "vuex-class";
import {
  GETTER_CLIENT_SETTINGS,
  GETTER_TAB_COIN_STORE_SETTINGS
} from "@/store/constants/setting_types";
import { PAY_ANY } from "@/store/constants/payment_types";
import { isDoubleCoins } from "@/utils/general_utils";
import PaymentUtil from "@/utils/payment_util";
import EventBus from "@/utils/event_bus";
import {
  IS_LIMITEDCOIN_INITIAL,
  LIMITEDCOIN_COUNT_TIMESTAMP,
  LIMITEDCOIN_COUNT_TIMESTAMP_FLAG,
  LIMITEDCOIN_COUNT_DURATION
} from "@/utils/localstorage/local_keys/web_session_keys";
import WebSessionStorageWorker from "@/utils/localstorage/web_session_storage";
import CountDwonTime from "@/components/CountDwonTime/CountDwonTime.vue";
import { recordSituation } from "@/utils/log_event/pay_event";

/**
 * limited coins 逻辑总结：
 *
 * 1. 首先处理显示和隐藏的问题，倒计时走完或点击购买成功后，需要隐藏，隐藏时候，保存隐藏时候的时间戳和时间戳标识符flag。需要显示的条件如下：
 *     （1）第一次进来，time（进入路由的时间和app启动的时间差）大于t1，显示
 *     （2）非第一次进来，需要判断上次隐藏是通过哪种形式触发，所以需要给一个flag
 *     （3）非第一次进来，如果flag是倒计时走完，则拿上次隐藏时间戳和t4比较，大于t4则显示，并且重置倒计时长为0
 *     （4）非第一次进来，如果flag是购买成功，则拿上次隐藏时间戳和t3比较，大于t3则显示，并且重置倒计时长为0
 *    这个过程需要给interval，因为当前路由不跳转，需要循环出现
 * 2. 然后处理倒计时显示问题，倒计时的时长和limited coins显示有关。条件如下：
 *     （1）第一次进来，时长初始化一次，每次离开路由或路由失活都会存起来
 *     （2）非第一次进来，时长初始化要判断存储的值。如果值的时间比当前时间早，说明倒计时已经结束，如果值为0，说明倒计时被重置过.这两种情况都需要重置倒计时长为当前时间，
 *     （3）更新倒计时长，只发生在倒计时被重置，并且limited coins需要显示的时候
 * 3. 这些存储的值可以放在web session storage，因为app退出可以清空，不需要持久化。
 */

@Component({
  components: {
    CountDwonTime
  }
})
export default class LimitedCoin extends Vue {
  // init中client_settings数据
  @Getter(GETTER_CLIENT_SETTINGS)
  private settingData: any;
  // tab_coin_store数据
  @Getter(GETTER_TAB_COIN_STORE_SETTINGS)
  private tabCoinStore: any;
  @Action(PAY_ANY)
  private payByAny: any;

  private isShowLimitedCoin: boolean = false;
  private limitedCoinDuration: number = 0;
  private limited_coin_offers: any;
  private intervalTimer: any = null;

  get isDouble() {
    return isDoubleCoins();
  }

  // tab_coin_store中limited_coin_offers第一组数据
  get limitedCoinOffers() {
    return this.tabCoinStore ? this.tabCoinStore.limited_coin_offers[0] : null;
  }

  private durationMock: number = 8;
  private t1Mock: number = 3;
  private t3Mock: number = 3;
  private t4Mock: number = 3;
  // 初始化duration，先从sessionstorage里取，没有则表明是第一次倒计时
  private initDuration() {
    if (WebSessionStorageWorker.has(LIMITEDCOIN_COUNT_DURATION)) {
      const lastDuration: any = Number.parseFloat(
        WebSessionStorageWorker.get(LIMITEDCOIN_COUNT_DURATION) as any
      );
      // 如果初始化遇到duration为0或时间早于当前时间，表明倒计时已经结束
      if (lastDuration === 0 || lastDuration <= new Date().valueOf()) {
        this.countDownTimeEnded();
      }
      this.limitedCoinDuration = lastDuration;
    } else {
      this.limitedCoinDuration =
        this.settingData.limited_coin.limited_coinoffer_duration * 1000 +
        new Date().valueOf();
      // this.limitedCoinDuration = this.durationMock * 1000 + new Date().valueOf();
    }
  }
  // 实时改变duration，不能使用computed，因为缓存数据,仅当limitedcoin重新触发显示，并且dutaion为0（为0表示倒计时重置过），才更新倒计时
  @Watch("isShowLimitedCoin")
  private updateDuration(val: any) {
    const shouldUpdateDuration: any =
      Number.parseFloat(
        WebSessionStorageWorker.get(LIMITEDCOIN_COUNT_DURATION) as any
      ) === 0;
    if (val === true && shouldUpdateDuration) {
      this.limitedCoinDuration =
        this.settingData.limited_coin.limited_coinoffer_duration * 1000 +
        new Date().valueOf();
      // this.limitedCoinDuration = this.durationMock * 1000 + new Date().valueOf();
    }
  }
  // 存储duraion到sessionstorage，在离开组件或组件失活时使用
  private storeDuration() {
    const durationStr = this.limitedCoinDuration;
    WebSessionStorageWorker.set(
      LIMITEDCOIN_COUNT_DURATION,
      durationStr.toString()
    );
  }

  // 重置组件的倒计时，并重置sessionstorage里的倒计时为字符串0，0是为了用来判断倒计时是否重置过
  private resetDuraion() {
    this.limitedCoinDuration = 0;
    this.storeDuration();
  }

  // 计算是否显示limitedcoin
  private judgeWhetherShowLimitedCoin() {
    if (this.isShowLimitedCoin === true) {
      return;
    }
    const now = new Date().getTime();
    const lastCountTimestampFlag: any = WebSessionStorageWorker.get(
      LIMITEDCOIN_COUNT_TIMESTAMP_FLAG
    );
    let lastCountTimestamp: any;
    // 产品逻辑图中对应的时间
    const t1: number = this.settingData.limited_coin
      .limited_coinoffer_initial_interval;
    const t3: number = this.settingData.limited_coin
      .limited_coinoffer_chance_interval;
    const t4: number = this.settingData.limited_coin.limited_coinoffer_interval;
    // const t1: number = this.t1Mock;
    // const t3: number = this.t3Mock;
    // const t4: number = this.t4Mock;
    // 当不是第一次进入coin store，时间戳为上次消失的时间，根据消失时候的flag来判断和t3还是t4对比
    if (WebSessionStorageWorker.has(IS_LIMITEDCOIN_INITIAL)) {
      const lastTimeStr: any = WebSessionStorageWorker.get(
        LIMITEDCOIN_COUNT_TIMESTAMP
      );
      lastCountTimestamp = Number.parseFloat(lastTimeStr);
      const time = (now - lastCountTimestamp) / 1000;
      if (lastCountTimestampFlag === "t3") {
        this.isShowLimitedCoin = time >= t3;
      } else if (lastCountTimestampFlag === "t4") {
        this.isShowLimitedCoin = time >= t4;
      } else {
        // 如果存储里没有时间戳标识符，表面是第一次的倒计时没走完，默认继续上次的倒计时
        this.isShowLimitedCoin = true;
      }
    } else {
      // 当第一次进入coin store，时间戳为app启动的时间，先判断是否double，如果不double，则判断time是否大于t1
      lastCountTimestamp = PaymentUtil.getPaymentParams(
        "lifecycle_enter_timestamp"
      );
      const time = (now - lastCountTimestamp) / 1000;
      if (!isDoubleCoins() && time > t1) {
        WebSessionStorageWorker.set(IS_LIMITEDCOIN_INITIAL, "false");
        this.isShowLimitedCoin = true;
      } else {
        this.isShowLimitedCoin = false;
      }
    }
  }

  /**
   * 主动隐藏limitedcoin，并重置时间戳，添加时间戳标识符，重置倒计时duration
   *
   * @param {string} flag t3或者t4
   */
  private restoreLmitedCoinCount(flag: string) {
    this.isShowLimitedCoin = false;
    WebSessionStorageWorker.set(
      LIMITEDCOIN_COUNT_TIMESTAMP,
      new Date().valueOf().toString()
    );
    WebSessionStorageWorker.set(LIMITEDCOIN_COUNT_TIMESTAMP_FLAG, flag);
    this.resetDuraion();
  }

  // 点击购买，隐藏limitedcoin
  private async clickSingle() {
    // 先拉起购买，等待购买完成，关闭limited coin
    EventBus.$off("limited_coin_buying_finished");
    EventBus.$once("limited_coin_buying_finished", () => {
      this.restoreLmitedCoinCount("t3");
    });
    recordSituation.setSituation("default");
    await this.payByAny(this.limitedCoinOffers);
  }

  // 倒计时结束，隐藏limitedcoin
  private countDownTimeEnded() {
    this.restoreLmitedCoinCount("t4");
  }

  // 初始化limited coins所有配置
  private initLimitedCoin() {
    this.initDuration();
    this.judgeWhetherShowLimitedCoin();
    this.intervalTimer = setInterval(() => {
      this.judgeWhetherShowLimitedCoin();
    }, 1000);
  }

  // 销毁limited coins所有配置
  private destroyLimitedCoin() {
    clearInterval(this.intervalTimer);
    this.storeDuration();
  }

  // 加载(激活)先运行一次，然后开启定时器,组件销毁(失活)前必须清除定时器
  private created() {
    this.initLimitedCoin();
  }
  private beforeDestroy() {
    this.destroyLimitedCoin();
  }
  private activated() {
    this.initLimitedCoin();
  }
  private deactivated() {
    this.destroyLimitedCoin();
  }
}
</script>

<style scoped lang="scss" src="./limited_coin.scss"></style>
