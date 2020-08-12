/* eslint-disable */
import DialogComponent from "@/components/Dialog/Dialog.vue";
import { CreateElement, VNode, PluginObject, VueConstructor } from "vue";
export const Dialog: any = DialogComponent;

/**
 * @author alanchen
 * @date 2019/9/9
 * @description Dialog组件，支持实例全局调用，也支持组件模版语法调用
 * import DialogPlugin, {Dialog} from './index.tsx'
 * 1. Vue.use(DialogPlugin) 然后实例原型上挂载一个$_Dialog对象，对象拥有两个方法 show()、hide()
 *      show() 参数是一个对象，包含一下可选key：
 *              closeOnClickModal (boolean) 是否可以点击遮罩层关闭modal
 *              closable (boolean) 是否可以点击右上角关闭icon来关闭modal
 *              closeFun(boolean) 是关闭弹框，还是走cancelbtn的逻辑，默认为false，仅仅关闭弹框
 *              width (number)  modal宽度，默认为296
 *              wrapStyle () modal自定义样式
 *              avatarstyle (object) 头部图片自定义样式
 *              titlestyle (object) 标题自定义样式
 *              avatar (string)  头部图片的地址，必须是图片地址，如若为空，则不渲染
 *              headerCustom (function)  自定义头部的render函数，参数一是dialog实例，参数二是h函数
 *              title (string)  标题，如若为空，则不渲染
 *              titleCustom (function)  自定义标题的render函数，参数一是dialog实例，参数二是h函数
 *              content (object)  内容，文本支持字符串模版拼接，以<%开始， /%>结束的文本将会加上highlightColor的高亮颜色
 *                      {
 *                          text (string)
 *                          highlightColor (string)
 *                      }
 *              contentCustom (function)  自定义内容的render函数，参数一是dialog实例，参数二是h函数
 *              confirmBtn (object)  确认按钮,仅当text有值时才渲染
 *                      {
 *                          text (string) 默认为字符串OK
 *                          style (object)
 *                              {
 *                                  textColor (string) 默认为字符串 #fff
 *                                  bgColor (string) 默认为字符串 rgb(12, 195, 191)
 *                              }
 *                      }
 *              confirmBtnCustom (function)  自定义确认按钮的render函数，参数一是dialog实例，参数二是h函数
 *              cancelBtn (object)  取消按钮,仅当text有值时才渲染
 *                      {
 *                          text (string) 默认为空字符串
 *                          style (object)
 *                              {
 *                                  textColor (string) 默认为字符串 rgb(140, 140, 140)
 *                                  bgColor (string) 默认为字符串 #fff
 *                              }
 *                      }
 *              onConfirm (function(done))  点击确认按钮emit的事件，需要手动调用回调函数来手动关闭modal
 *              onCancel (function(done))  点击确认按钮emit的事件，需要手动调用回调函数来手动关闭modal
 *              onModalCloseWithIcon (function(done))  当closab为true时，点击close的icon触发，需要手动调用回调函数来手动关闭modal
 *              onModalClose (function)  当closeOnClickModal为true时，点击modal关闭时触发
 *
 *      hide() 无参数
 *    dialog实例有一个方法，closeModal，用于关闭遮罩层
 */

// interface DialogOpts {
//     closable: boolean
//     closeOnClickModal: boolean
//     width: number
//     avatar: string
//     headerCustom: any
//     title: string
//     titleCustom: any
//     content: any
//     contentCustom: any
//     confirmBtn: any
//     cancelBtn: any
//     onConfirm: any
//     onCancel: any
// }

declare module "vue/types/vue" {
  export interface Vue {
    $_Dialog: any;
  }
}

const plugin: PluginObject<any> = {
  install(Vue: VueConstructor, opts?: any) {
    const pluginRootEle = document.createElement("div");
    pluginRootEle.id = "dialogPluginRootInstance";
    document.body.appendChild(pluginRootEle);

    const pluginRootInstance = new Vue({
      data: {
        isShow: false,
        closable: false,
        closeOnClickModal: false,
        width: 0,
        style: {},
        closeFun: false,
        avatarstyle: {},
        titlestyle: {},
        avatar: "",
        headerCustom: null,
        title: "",
        titleCustom: null,
        content: {},
        contentStyle: {},
        contentCustom: null,
        confirmBtn: {},
        confirmBtnCustom: null,
        cancelBtn: {},
        onConfirm: (done: any) => undefined,
        onCancel: (done: any) => undefined,
        onModalCloseWithIcon: (done: any) => undefined,
        onModalClose: () => undefined
      },
      created() {
        const ctx = this;
        Vue.prototype.$_Dialog = {
          show({
            closeOnClickModal = false,
            closable = false,
            width = 79,
            style = {},
            avatarstyle = {},
            titlestyle = {},
            avatar = "",
            closeFun = false,
            headerCustom = null,
            title = "",
            titleCustom = null,
            content = {},
            contentCustom = null,
            confirmBtn = {},
            contentStyle = {},
            confirmBtnCustom = null,
            cancelBtn = {},
            onConfirm = (done: any) => undefined,
            onCancel = (done: any) => undefined,
            // 如果不传onModalCloseWithIcon，则默认点击icon按钮关闭modal
            onModalCloseWithIcon = (done: any) => done(),
            onModalClose = () => undefined
          } = {}) {
            ctx.closeOnClickModal = closeOnClickModal;
            ctx.closable = closable;
            ctx.width = width;
            ctx.style = style;
            ctx.avatarstyle = avatarstyle;
            ctx.titlestyle = titlestyle;
            ctx.avatar = avatar;
            ctx.headerCustom = headerCustom;
            ctx.title = title;
            ctx.closeFun = closeFun;
            ctx.titleCustom = titleCustom;
            ctx.content = content;
            ctx.contentCustom = contentCustom;
            ctx.confirmBtn = confirmBtn;
            ctx.confirmBtnCustom = confirmBtnCustom;
            ctx.cancelBtn = cancelBtn;
            ctx.onConfirm = onConfirm;
            ctx.onCancel = onCancel;
            ctx.onModalCloseWithIcon = onModalCloseWithIcon;
            ctx.onModalClose = onModalClose;

            ctx.isShow = true;
          },
          hide() {
            ctx.isShow = false;
          }
        };
      },
      methods: {
        fixedProp(param: any): any {
          return Object.keys(param).length >= 1 ? param : undefined;
        }
      },
      render(h: CreateElement): VNode {
        return (
          <Dialog
            value={this.isShow}
            closable={this.closable}
            closeOnClickModal={this.closeOnClickModal}
            width={this.width}
            wrapStyle={this.style}
            avatarstyle={this.avatarstyle}
            titlestyle={this.titlestyle}
            avatar={this.avatar}
            closeFun={this.closeFun}
            headerCustom={this.headerCustom}
            title={this.title}
            titleCustom={this.titleCustom}
            content={this.fixedProp(this.content)}
            contentCustom={this.contentCustom}
            confirmBtn={this.fixedProp(this.confirmBtn)}
            confirmBtnCustom={this.confirmBtnCustom}
            cancelBtn={this.fixedProp(this.cancelBtn)}
            on-input={(status: boolean) => (this.isShow = status)}
            on-onConfirm={(done: any) => this.onConfirm(done)}
            on-onCancel={(done: any) => this.onCancel(done)}
            on-onModalCloseWithIcon={(done: any) =>
              this.onModalCloseWithIcon(done)
            }
            on-onModalClose={() => this.onModalClose()}
          />
        );
      }
    }).$mount("#dialogPluginRootInstance");
  }
};
export default plugin;
