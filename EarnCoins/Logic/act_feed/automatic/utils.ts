import { store, Vue } from "@/main";
import { LOGIN_TIKTOK_USER_ACTION } from "@/store/constants/tiktok_user_types";
import { TT_ACOUNT_EXPIRED_ERROR } from "./error";

/**
 * 处理当tt登录账号过期的错误
 */
export const handleTTAccountExpired = (error: any = {}) => {
  const { error_type } = error;
  if (error_type === TT_ACOUNT_EXPIRED_ERROR.error_type) {
    Vue.prototype.$_Toast.show({
      text: TT_ACOUNT_EXPIRED_ERROR.error_message
    });
    setTimeout(() => {
      store.dispatch(LOGIN_TIKTOK_USER_ACTION);
    }, 2000);
  }
};
