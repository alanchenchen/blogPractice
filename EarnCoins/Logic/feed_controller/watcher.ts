export default class Watcher {
  private handler: any;

  /**
   * 存入handler
   * @param handler
   */
  public observe(handler: any) {
    this.handler = handler;
  }

  /**
   * 通知handler执行
   *
   * @param value
   */
  public notice(value: any) {
    this.handler(value);
  }
}
