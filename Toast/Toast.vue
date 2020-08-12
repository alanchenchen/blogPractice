<script lang="tsx">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
@Component
export default class Dialog extends Vue {
  @Prop({ default: false })
  private value: any;
  @Prop({ default: 2000 })
  private duration?: any;
  @Prop({ default: "text" })
  private type?: any;
  @Prop({ default: "" })
  private isPayment?: any;
  @Prop({ default: "" })
  private text?: any;
  @Prop({
    default() {
      return {
        icon: "",
        text: ""
      };
    }
  })
  private content?: any;
  @Prop({
    default() {
      return {};
    }
  })
  private styles?: any;
  private timer: any;
  private iconList: any[] = [
    {
      type: "success",
      src: require("@/assets/icons-file/toast/lh_toast_success.png")
    },
    {
      type: "fail",
      src: require("@/assets/icons-file/toast/lh_toast_failure.png")
    },
    {
      type: "loading",
      src: require("@/assets/icons-file/toast/loading@3x.png")
    },
    {
      type: "pay_loading",
      src: require("@/assets/icons-file/toast/lh_toast_process.png")
    },
    {
      type: "warning",
      src: require("@/assets/icons-file/toast/lh_toast_warning.png")
    }
  ];

  public closeToast() {
    this.$emit("input", false);
    this.$emit("onClose");
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  // 有一种情况不会触发。当toast组件先hide，然后立即show则组件不会被destroy，猜测这是vue的优化策略！
  @Watch("value")
  private switchShow(val: boolean) {
    if (val) {
      if (this.type !== "loading") {
        this.setDurationTime();
      }
    } else {
      clearTimeout(this.timer);
    }
  }

  // 当toast组件先hide，然后立即show时只能监听type的变化，是为了当type立即从loading变为非loading，添加timeout。
  @Watch("type")
  private switchType(val: string) {
    if (val !== "loading") {
      this.setDurationTime();
    }
  }

  // 当toast组件没被hide，且type未改变，则必须先去除上一个定时器。
  @Watch("text")
  private switchText() {
    clearTimeout(this.timer);
    if (this.type !== "loading") {
      this.setDurationTime();
    }
  }

  private setDurationTime() {
    this.timer = setTimeout(() => {
      this.closeToast();
    }, this.duration);
  }
  // eslint-disable-next-line
  private render(h: any): any {
    const targetIcon = (type: any): string => {
      return (
        this.iconList.find((item: any) => item.type === type) &&
        this.iconList.find((item: any) => item.type === type).src
      );
    };
    const shortIconRender: any = (
      <section class="short-icon-inner">
        {this.type === "loading" ? (
          <img class="spin" src={targetIcon(this.type)} alt={this.type} />
        ) : (
          <img src={targetIcon(this.type)} alt={this.type} />
        )}
        <span>{this.text}</span>
      </section>
    );
    const longTextRender: any = (
      <section class="long-text-inner">
        <span>{this.text}</span>
      </section>
    );
    const coinIconSrc = this.content.icon
      ? this.content.icon
      : require("@/assets/icons-file/sku/coins.png");
    const multiInfoRender: any = (
      <section class="multi-info-inner">
        <img class="tip" src={targetIcon("success")} alt="success" />
        <section class="msg">
          <img src={coinIconSrc} />
          <span>{this.content.text}</span>
        </section>
      </section>
    );

    let targetRender: any;
    if (
      this.type === "success" ||
      this.type === "fail" ||
      this.type === "loading" ||
      this.type === "warning"
    ) {
      targetRender = shortIconRender;
    } else if (this.type === "text") {
      targetRender = longTextRender;
    } else if (this.type === "multiInfo") {
      targetRender = multiInfoRender;
    }
    // 如果是loading类型，默认加遮罩
    const mask = this.type === "loading";
    const toast = (
      <section class="toast-wrap" style={this.styles}>
        {targetRender}
      </section>
    );
    const pay_toast = (
      <section class="toast-wrap-column" style={this.styles}>
        <i class="k-loader k-circle" />
        <span class="text">{this.text}</span>
      </section>
    );
    return this.value ? (
      mask ? (
        <section class="toast">{this.isPayment ? pay_toast : toast}</section>
      ) : (
        toast
      )
    ) : (
      ""
    );
  }
}
</script>
<style lang="scss" scoped src="./toast.scss"></style>
