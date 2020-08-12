import ToastComponent from "@/components/Toast/Toast.vue";
// eslint-disable-next-line
import { CreateElement, VNode, PluginObject, VueConstructor } from "vue";
export const Toast: any = ToastComponent;

/**
 * @author alanchen
 * @date 2019/9/19
 * @description Toast组件，支持实例全局调用，也支持组件模版语法调用
 * import Toast, {Toast} from './index.tsx'
 * 1. Vue.use(Toast) 然后实例原型上挂载一个$_Toast对象，对象拥有两个方法 show()、hide()
 *      show() 参数是一个对象，包含一下可选key：
 *              type (string) 默认是text，
 *                  可选：
 *                      text-长文本
 *                      success-带成功icon的文本
 *                      fail-带失败icon的文本
 *                      loading-带loading状态的文本，需要手动hide()
 *                      multiInfo-带成功icon的复杂信息
 *              duration (number) 控制非loading显示的时长，单位是毫秒。默认2000
 *              text (string)  非multiInfo类型显示的文本
 *              content (object)
 *                  content.icon    multiInfo类型显示的icon地址，默认是金币icon
 *                  content.text    multiInfo类型显示的文本
 *              wrapStyle (object) toast自定义样式
 *              onClose (function())  当toast被关闭时的回调函数，当调用hide方法时也会触发，不支持阻止toast关闭～
 *
 *      hide() 无参数,手动关闭toast，用于手动关闭loading类型
 *    Toast实例有一个方法，closeToast，用于关闭toast
 */

declare module "vue/types/vue" {
  export interface Vue {
    $_Toast: any;
  }
}

const plugin: PluginObject<any> = {
  install(Vue: VueConstructor) {
    const pluginRootEle = (window as any).document.createElement("div");
    pluginRootEle.id = "toastPluginRootInstance";
    document.body.appendChild(pluginRootEle);

    new Vue({
      data: {
        isShow: false,
        duration: 0,
        type: "",
        isPayment: false,
        text: "",
        content: {},
        style: {},
        onClose: () => undefined
      },
      created() {
        const ctx = this;
        Vue.prototype.$_Toast = {
          show({
            type = "text",
            isPayment = false,
            duration = 2000,
            text = "",
            content = {},
            style = {},
            onClose = () => undefined
          } = {}) {
            ctx.type = type;
            ctx.isPayment = isPayment;
            ctx.duration = duration;
            ctx.text = text;
            ctx.content = content;
            ctx.style = style;
            ctx.onClose = onClose;

            ctx.isShow = true;
          },
          hide() {
            (ctx.$refs.toast as any).closeToast();
          }
        };
      },
      methods: {
        fixedProp(param: any): any {
          return Object.keys(param).length >= 1 ? param : undefined;
        }
      },
      // eslint-disable-next-line
      render(h: CreateElement): VNode {
        return (
          <Toast
            ref="toast"
            value={this.isShow}
            duration={this.duration}
            text={this.text}
            type={this.type}
            isPayment={this.isPayment}
            style={this.style}
            content={this.fixedProp(this.content)}
            on-input={(status: boolean) => (this.isShow = status)}
            on-onClose={() => this.onClose()}
          />
        );
      }
    }).$mount("#toastPluginRootInstance");
  }
};
export default plugin;
