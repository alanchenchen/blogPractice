<template>
  <section id="earn-coins">
    <NavBar
      :transparent="true"
      :show-coin="true"
      title="EARN COINS"
      class="nav-bar"
      @clickRight="toCoinStore"
    >
      <!-- user select  -->
      <SelectUser
        :login="isOnlyLogin"
        @clickSelectUser="clickSelectUser"
        slot="left"
      />
    </NavBar>
    <Pool
      :loading="poolLoading"
      :limited="limited"
      :limited-duration-timestamp="limitedDurationTimestamp"
      :feed="currentFeed"
      @buyCoinFeed="handleSpecialFeed"
      @shouldCloseLimit="closeFeedLimit"
    />
    <LimitedButton
      v-if="limited && !poolLoading"
      @shouldCloseLimit="closeFeedLimit(true)"
      @clickMore="toCoinStore"
    />
    <ButtonsGroup
      v-else
      :loading="poolLoading"
      :feed="currentFeed"
      @skipFeed="skipFeed"
      @actFeed="debounceActFeed"
      @retryFeed="retryFeed"
      @handleSpecialFeed="handleSpecialFeed"
      @clickMore="toCoinStore"
    />
  </section>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { Getter, Action } from "vuex-class";
import NavBar from "@/components/NavBar/NavBar.vue";
import SelectUser from "@/components/SelectUser/SelectUser.vue";
import Pool from "./Pool/Pool.vue";
import ButtonsGroup from "./ButtonsGroup/ButtonsGroup.vue";
import LimitedButton from "./ButtonsGroup/LimitedButton.vue";

import { goToCoinStore, goToSearch } from "@/utils/router_jump/router_jump";
import EventBus from "@/utils/event_bus/event_bus";
import { debounce } from "@/utils/lodash";
import {
  TIKTOK_LOGIN_USER_EMPTY,
  GETTER_CURRENT_TIKTOK_USER_INFO,
  LOGIN_TIKTOK_USER_ACTION,
  GETTER_TIKTOK_USER_EMPTY,
  GEETER_TIKTOK_LOGIN_USER
} from "@/store/constants/tiktok_user_types";
import {
  GETTER_TAB_EARN_COINS_SETTINGS,
  UPDATE_GX_TAB_EARN_COINS_SETTING_DATA
} from "@/store/constants/setting_types";
import { PAY_ANY } from "@/store/constants/payment_types";
import { DIALOG_NEED_LOGGED_OUT } from "@/store/constants/dialog_types";

import FeedController from "@/services/earn_coins/feed_controller/feed_controller";
import EarnActFeed from "@/services/earn_coins/act_feed/act_feed";
import { COIN_FEED, LUCKY_COIN } from "@/services/earn_coins/constant";
import CheckUserHelper from "@/utils/check_user_helper/check_user_helper";
import { shouldUseNewTTLogic } from "@/utils/general_utils";
import ButtonLimitController from "@/services/earn_coins/button_limit/button_limit";
import ActLimitController from "@/services/earn_coins/act_limit/act_limit";
import { recordSituation } from "@/utils/log_event/pay_event";

@Component({
  components: {
    NavBar,
    SelectUser,
    Pool,
    ButtonsGroup,
    LimitedButton
  }
})
export default class EarnCoins extends Vue {
  @Getter(TIKTOK_LOGIN_USER_EMPTY)
  private isTiktokLoginEmpty?: boolean;
  @Getter(GETTER_TIKTOK_USER_EMPTY)
  private isTiktokEmpty?: boolean;
  @Getter(GETTER_CURRENT_TIKTOK_USER_INFO)
  private tikTokUser: any;
  @Getter(GETTER_TAB_EARN_COINS_SETTINGS)
  private tabEarnCoinsSetting: any;
  @Getter(GEETER_TIKTOK_LOGIN_USER)
  private tiktokLoginUser: any;
  @Action(UPDATE_GX_TAB_EARN_COINS_SETTING_DATA)
  private updateEarnCoinsSetting: any;
  @Action(PAY_ANY)
  private payByAny: any;
  @Action(LOGIN_TIKTOK_USER_ACTION)
  private tiktokLogin: any;
  @Action(DIALOG_NEED_LOGGED_OUT)
  private changeTTAcount: any;

  private limited: boolean = false; // 购买feed限制逻辑的开关
  private limitedDurationTimestamp: number = 0; // 触发feed限制逻辑后的倒计时
  private poolLoading: boolean = false;
  private currentFeed: any = null;
  // 是否可以自动跳下一个feed，当act成功或失败都需要自动跳，但是需要做限制，避免手动skip后🈶️触发一次skip
  private couldAutoSkipFeed: boolean = true;
  // 需要给act feed做防抖，避免疯狂做任务
  private debounceActFeed: any = () => {};

  get isOnlyLogin() {
    return shouldUseNewTTLogic();
  }

  get tikTokUserUniqueId() {
    if (this.tikTokUser) {
      return this.tikTokUser.tik_user_info.uniqueId;
    } else {
      return "";
    }
  }

  get feedCoinOffer() {
    return this.currentFeed.offer;
  }

  /**
   * 监听tt用户登录，每次启动app都会登录，每次切换用户，会先登出然后登录
   * 1. 登录成功，重启ActLimitController数据
   * 2. 登出成功，结束倒计时
   * 3. 实现了启动app或切换账号后刷新ActLimitController数据，并且登出或切换账号退出限制逻辑
   */
  @Watch("isTiktokLoginEmpty")
  private onTTLoginChange(val: boolean) {
    if (!val) {
      ActLimitController.reload();
    } else {
      // 当没有账号登录，退出限制逻辑
      this.limited = false;
    }
  }

  /**
   * 监听tt用户切换另一个登录，一旦切换成功，重启ActLimitController数据，并结束倒计时
   */
  // @Watch("tiktokLoginUser")
  // private onTTLoginUserChange(val: any) {
  //   if (val) {
  //     ActLimitController.reload();
  //     this.limited = false;
  //   }
  // }

  /**
   * 确保当前已经登陆用户.
   */
  private checkExistTTUserLogin() {
    if (this.isOnlyLogin && this.isTiktokLoginEmpty) {
      this.$_Toast.show({
        text: "Log in to TikTok first to earn coins."
      });
      setTimeout(() => {
        this.tiktokLogin();
      }, 2000);
      return false;
    } else if (this.isTiktokEmpty) {
      goToSearch();
      return false;
    } else {
      return true;
    }
  }

  /**
   * 刷新feeds流
   */
  private async retryFeed() {
    this.poolLoading = true;
    await FeedController.refreshFeeds();
    this.poolLoading = false;
  }

  /**
   * 跳到下一个feed
   */
  private async skipFeed() {
    this.couldAutoSkipFeed = false;
    await FeedController.useFeed();
  }

  /**
   * 安全的跳入下一个feed，避免手动skip后再次skip一次
   */
  private autoSkipFeedSafely() {
    if (this.couldAutoSkipFeed) {
      // 保证skipFeed函数内this指向vue实例
      this.skipFeed.call(this);
    }
  }

  /**
   * 使用feed，兼容两种模式
   */
  private async actFeed() {
    if (this.checkExistTTUserLogin()) {
      this.couldAutoSkipFeed = true;
      EarnActFeed.run(this.currentFeed, this.tikTokUserUniqueId, () => {
        this.autoSkipFeedSafely();
        FeedController.countActFeedsCache(this.currentFeed);
      });
    }
  }

  /**
   * 购买feed类型为feed coin/feed lucky coin的offer.
   */
  private buyCoinFeedOffer() {
    recordSituation.setSituation("feed");
    this.payByAny(this.feedCoinOffer);
    EventBus.$off("earn_feed_coin_buying_finished");
    EventBus.$once("earn_feed_coin_buying_finished", () => {
      this.autoSkipFeedSafely();
    });
  }

  private handleSpecialFeed() {
    // 购买feed coin
    if (
      this.currentFeed &&
      [COIN_FEED, LUCKY_COIN].includes(this.currentFeed.kind)
    ) {
      this.buyCoinFeedOffer();
    }
  }

  private toCoinStore() {
    goToCoinStore();
  }

  private clickSelectUser() {
    if (this.isOnlyLogin) {
      console.log("clickSelectUser login");
      this.isTiktokLoginEmpty && this.tiktokLogin();
    } else if (this.isTiktokEmpty) {
      goToSearch();
    } else {
      EventBus.$emit("show-account-list", {
        show: true,
        login: this.isOnlyLogin
      });
    }
  }

  /**
   * 关闭feed购买限制，保存数据到DB，然后根据情况是切换tt登录
   *
   * @param switchTTUser 是否切换tt用户，默认false
   */
  private closeFeedLimit(switchTTUser: boolean = false) {
    if (switchTTUser) {
      this.changeTTAcount();
    } else {
      ActLimitController.resetCount(this.currentFeed.kind);
      this.limited = false;
    }
  }

  private async created() {
    this.updateEarnCoinsSetting(); // setting
    // 确保tab3存在一个webview
    !this.isOnlyLogin &&
      !CheckUserHelper.getUserName() &&
      CheckUserHelper.checkUserExit("tiktok");

    // 初始化按钮限制逻辑
    ButtonLimitController.init();
    // 初始化购买feed限制逻辑，绑定ui监听函数
    ActLimitController.init((val: number) => {
      this.limited = true;
      this.limitedDurationTimestamp = val;
    });
    // 初始化FeedController，绑定ui监听函数，并刷新一次feeds流.
    this.poolLoading = true;
    await FeedController.init((val: any) => {
      this.currentFeed = val.length > 0 ? val[0] : null;
      // console.log("current feeds length:", val.length);
    });
    this.poolLoading = false;
    this.debounceActFeed = debounce(this.actFeed, 450);
  }
}
</script>

<style scoped lang="scss" src="./earn_coins.scss"></style>
