<script lang="tsx">
/* eslint-disable */
import { Component, Prop, Vue, Emit, Watch } from "vue-property-decorator";
import { CreateElement, VNode } from "vue";
import BackPress from "@/utils/back_press/back_press";
import { DIALOG_KEY } from "@/utils/back_press/back_press";
import { isIos } from "@/utils/lodash";

type Callback = (done: () => void) => void;

interface ColorStyle {
  textColor: string;
  bgColor: string;
}

@Component
export default class Dialog extends Vue {
  // 遮罩层开关
  @Prop({ default: false })
  private value?: boolean;

  // 是否显示右上角关闭icon
  @Prop({ default: false })
  private closable?: boolean;

  // 是否可以点击遮罩层来关闭modal
  @Prop({ default: false })
  private closeOnClickModal?: boolean;

  @Prop({ default: 79 })
  private width?: number;

  // dialog自定义样式
  @Prop({
    default() {
      return {};
    }
  })
  private wrapStyle?: any;

  // avatar自定义样式
  @Prop({
    default() {
      return {};
    }
  })
  private avatarstyle?: any;

  // title自定义样式
  @Prop({
    default() {
      return {};
    }
  })
  private titlestyle?: any;

  // 头部的图片地址
  @Prop()
  private avatar?: string;

  // 自定义头部的render函数
  @Prop()
  private headerCustom: any;

  // 标题文本
  @Prop()
  private title?: string;

  // 自定义标题的render函数
  @Prop()
  private titleCustom: any;

  // 内容文本，支持<% /%>拼接来实现高亮效果
  @Prop({
    default() {
      return {
        text: "",
        highlightColor: false,
        contentStyle: {}
      };
    }
  })
  private content?: object;

  // 内容的自定义render函数
  @Prop()
  private contentCustom: any;

  // 确认按钮
  @Prop({
    default() {
      return {
        text: "OK",
        icon: "",
        style: {
          textColor: "#fff",
          bgColor: "rgb(251, 22, 94)"
        },
        useCountDown: false
      };
    }
  })
  private confirmBtn?: object;

  // 自定义确认按钮的render函数
  @Prop()
  private confirmBtnCustom: any;

  // 取消按钮
  @Prop({
    default() {
      return {
        text: "",
        style: {
          textColor: "rgb(140, 140, 140)",
          bgColor: "#fff"
        }
      };
    }
  })
  private cancelBtn?: object;

  @Prop({ default: false })
  private closeFun?: boolean;

  // data，modal的开关
  private isShow: boolean = false;

  // 关闭modal
  public closeModal() {
    this.isShow = false;
  }

  @Watch("value")
  private updateisShow(val: boolean) {
    this.isShow = val;
  }

  @Watch("isShow")
  private onIsShowChange(val: boolean) {
    // if (!val) {
    //   this.onInput(false);
    // }
    if (!val) {
      this.onInput(false);
      !isIos() && BackPress.destroy(DIALOG_KEY);
    } else {
      !isIos() &&
        BackPress.listen({
          key: DIALOG_KEY,
          fn: () => {
            this.closeFun
              ? this.onCancelChange(this.closeModal)
              : this.closeModal();
          }
        });
    }
  }

  @Emit("input")
  private onInput(val: boolean): void {
    return undefined;
  }

  // 当closeOnClickModal为true时，点击modal关闭时触发
  @Emit("onModalClose")
  private onModalClose(): void {
    return undefined;
  }

  // 当closab为true时，点击close的icon触发，需要手动调用回调函数来手动关闭modal
  @Emit("onModalCloseWithIcon")
  private onModalCloseWithIcon(done: any) {
    return done;
  }

  // 点击确认按钮emit的事件，需要手动调用回调函数来手动关闭modal
  @Emit("onConfirm")
  private onConfirmChange(done: any) {
    return done;
  }

  // 点击确认按钮emit的事件，需要手动调用回调函数来手动关闭modal
  @Emit("onCancel")
  private onCancelChange(done: any) {
    return done;
  }

  private render(h: CreateElement) {
    const defaultHeader = this.$props.avatar ? (
      <section class="wrap-header">
        <img
          class="header-avatar"
          src={this.$props.avatar}
          style={this.$props.avatarstyle}
        />
      </section>
    ) : (
      ""
    );

    const defaultTitle = (
      <section class="wrap-title" style={this.$props.titlestyle}>
        {this.$props.title}
      </section>
    );

    let highlightContent: any;
    if (this.$props.content.text && this.$props.content.highlightColor) {
      const rule: RegExp = /\<\%|\/\%\>/g;
      const matchHighlightText: string[] = this.$props.content.text.split(rule);
      highlightContent = matchHighlightText.map((item, index: number): any => {
        if (this.$props.content.text.includes(`<%${item}/%>`)) {
          return (
            <span
              class="wrap-content-item"
              style={{ color: this.$props.content.highlightColor }}
            >
              {item}
            </span>
          );
        } else {
          return <span class="wrap-content-item">{item}</span>;
        }
      });
    }

    const defaultContent = (
      <section class="wrap-content" style={this.$props.content.contentStyle}>
        {this.$props.content.highlightColor ? (
          highlightContent
        ) : (
          <span
            class="wrap-content-item"
            style={this.$props.content.contentStyle}
          >
            {this.$props.content.text}
          </span>
        )}
      </section>
    );

    const defaultConfirmBtnStyle: ColorStyle = {
      textColor:
        (this.$props.confirmBtn &&
          this.$props.confirmBtn.style &&
          this.$props.confirmBtn.style.textColor) ||
        "#fff",
      bgColor:
        (this.$props.confirmBtn &&
          this.$props.confirmBtn.style &&
          this.$props.confirmBtn.style.bgColor) ||
        "rgb(255, 61, 89)"
    };

    const defaultCancelBtnStyle: ColorStyle = {
      textColor:
        (this.$props.cancelBtn.style &&
          this.$props.cancelBtn.style.textColor) ||
        "rgb(140, 140, 140)",
      bgColor:
        (this.$props.cancelBtn.style && this.$props.cancelBtn.style.bgColor) ||
        "#fff"
    };

    const defaultConfirmBtn = this.$props.confirmBtn.text ? (
      <button
        class="wrap-confirmBtn"
        style={{
          background: defaultConfirmBtnStyle.bgColor,
          color: defaultConfirmBtnStyle.textColor
        }}
        onClick={() => this.onConfirmChange(this.closeModal)}
      >
        {this.$props.confirmBtn.text}
      </button>
    ) : (
      ""
    );

    const defaultCancelBtn = this.$props.cancelBtn.text ? (
      <section
        class="wrap-cancelBtn"
        style={{
          background: defaultCancelBtnStyle.bgColor,
          color: defaultCancelBtnStyle.textColor
        }}
        onClick={() => this.onCancelChange(this.closeModal)}
      >
        {this.$props.cancelBtn.text}
      </section>
    ) : (
      ""
    );

    const closeIconRender = this.$props.closable ? (
      <span
        class="icon-app_close icon-close"
        onClick={() => this.onModalCloseWithIcon(this.closeModal)}
      ></span>
    ) : (
      ""
    );

    // 为了避免传入的props中jsx语法报错，所以将h函数作为回调函数第二个参数
    const headerRender: VNode = this.$props.headerCustom
      ? this.$props.headerCustom((this as any)._self, h)
      : defaultHeader;

    const titleRender: VNode = this.$props.titleCustom
      ? this.$props.titleCustom((this as any)._self, h)
      : defaultTitle;

    const contentRender: VNode = this.$props.contentCustom
      ? this.$props.contentCustom((this as any)._self, h)
      : defaultContent;

    const confirmBtnRender: VNode = this.$props.confirmBtnCustom
      ? this.$props.confirmBtnCustom((this as any)._self, h)
      : defaultConfirmBtn;

    return this.value ? (
      <section class="toast">
        <section
          class="toast-mask"
          onClick={() => {
            if (this.$props.closeOnClickModal) {
              this.onModalClose();
              this.closeModal();
            }
          }}
        ></section>
        <section
          class="toast-wrap"
          style={{
            width: `${this.$props.width}%`,
            ...this.$props.wrapStyle
          }}
        >
          {closeIconRender}
          {headerRender}
          {titleRender}
          {contentRender}
          {confirmBtnRender}
          {defaultCancelBtn}
        </section>
      </section>
    ) : (
      "<!--toast-->"
    );
  }
}
</script>

<style lang="scss" scoped src="./Dialogs.scss"></style>
