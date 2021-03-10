import { store } from "@/main";
import { GETTER_CLIENT_SETTINGS } from "@/store/constants/setting_types";

/**
 * 控制earn coins按钮限制的逻辑
 * 1. 未加过锁，每次需要用count来计数，一旦达到临界值，加锁
 * 2. 加锁后，按钮处于加锁状态，开始倒计时，倒计时结束后需要手动解锁，让当前按钮可操作
 * 3. 已加过锁，此时最大临界值被改变，然后重复加锁解锁流程
 */
class ButtonLimitController {
  private countNum: number = 1; // 当前count数量
  private shouldLock: boolean = false; // 是否加锁
  private limitCountNum: number = 0; // 限制加锁的最大临界值数量
  private resetLimitCountNum: number = 1; // 当重置加锁后，每隔多少个再次加锁
  private limitDuration: number = 1; // 加锁后倒计时长

  public init() {
    const { earn_limit } = store.getters[GETTER_CLIENT_SETTINGS];
    const { earn_feed_spacing_time, earn_feed_spacing_threshhold } = earn_limit;
    this.limitCountNum = earn_feed_spacing_threshhold;
    this.limitDuration = earn_feed_spacing_time;
  }

  /**
   * count计数
   * 1. act每调用一次则count一次
   * 2. 如果已经加锁过，则skip操作也需要count一次
   */
  public count() {
    if (
      this.countNum < this.limitCountNum ||
      this.limitDuration <= 1 // 当boss配置中limitDuration小于等于1，则一直不加锁
    ) {
      this.countNum++;
    } else {
      this.shouldLock = true;
      console.log("act feeds has limited the button, please wait for duration");
    }
  }

  /**
   * 重置限制锁，当按钮中倒计时走完调用。
   * 此时最大临界值会被赋值成resetLimitCountNum。
   */
  public resetLock() {
    this.countNum = 1;
    this.limitCountNum = this.resetLimitCountNum;
    this.shouldLock = false;
  }

  /**
   * 是否已经加过锁，用于判断是够已经加过锁，因为加锁后，为了让按钮重新回复，需要手动解锁。
   */
  public hasLocked() {
    return this.limitCountNum === this.resetLimitCountNum;
  }

  /**
   * 返回lock状态，是否加锁，如果加锁，则按钮处于倒计时状态
   */
  public lockStatus() {
    return this.shouldLock;
  }

  /**
   * 返回lock倒计时长，单位是s
   */
  public lockDuration() {
    return this.limitDuration;
  }
}

export default new ButtonLimitController();
