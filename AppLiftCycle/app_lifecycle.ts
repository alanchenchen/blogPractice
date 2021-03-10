type evhandler = () => void;

class AppLifeCycle {
  private frontListeners: any[] = [];
  private backListeners: any[] = [];

  /**
   * 添加前台事件监听器
   *
   * @param handler 事件函数
   * @param group 可选，组id
   * @returns string | undefined，如果添加成功会返回一个随机id，如果事件重复添加，则返回undefined
   */
  public addFrontListener(handler: () => void, group?: string) {
    return this.addListener(0, handler, group);
  }

  /**
   * 添加后台事件监听器
   *
   * @param handler 事件函数
   * @param group 可选，组id
   * @returns string | undefined，如果添加成功会返回一个随机id，如果事件重复添加，则返回undefined
   */
  public addBackListener(handler: () => void, group?: string) {
    return this.addListener(1, handler, group);
  }

  /**
   * 去除事件监听器，会根据id或group名自动去除，传入group，则会去除同一group的一系列监听器
   *
   * @param key 添加事件返回的id或者手动传入的group
   */
  public removeListener(key: string) {
    const hasTargetFrontGroup = this.frontListeners.some(
      (item: any) => item.group === key
    );
    const hasTargetBackGroup = this.backListeners.some(
      (item: any) => item.group === key
    );
    const targetFrontIndex = this.frontListeners.findIndex(
      (item: any) => item.id === key
    );
    const targetBackIndex = this.backListeners.findIndex(
      (item: any) => item.id === key
    );

    // 先判断是key是否group，然后再判断是否id
    if (hasTargetFrontGroup) {
      this.removeListenerByGroup(this.frontListeners, key);
    } else if (hasTargetBackGroup) {
      this.removeListenerByGroup(this.backListeners, key);
    } else if (targetFrontIndex >= 0) {
      this.removeListenerById(this.frontListeners, targetFrontIndex);
    } else if (targetBackIndex >= 0) {
      this.removeListenerById(this.backListeners, targetBackIndex);
    } else {
      console.warn("can not find responsding id handler");
    }
  }

  /**
   * 获取所有的前台和后台监听事件
   *
   * @param type
   */
  public getAllListeners(type?: 0 | 1) {
    if (type === 0) {
      return this.frontListeners;
    } else if (type === 1) {
      return this.backListeners;
    } else if (type === undefined) {
      return {
        frontListeners: this.frontListeners,
        backListeners: this.backListeners
      };
    }
  }

  /**
   * 去除所有的前台和后台监听事件
   */
  public removeAllListeners() {
    if (this.frontListeners.length >= 1) {
      this.frontListeners.forEach((item: any) => {
        this.removeListener(item.id);
      });
    }
    if (this.backListeners.length >= 1) {
      this.backListeners.forEach((item: any) => {
        this.removeListener(item.id);
      });
    }
  }

  private getID(): string {
    const t = "xxxxx";
    return t.replace(/[xy]/g, (c: string) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * 添加并返回包装好的事件函数
   *
   * @param type 0表示前台事件，1表示后台事件
   * @param handler 事件函数
   * @returns 包装好的事件函数
   */
  private wrapHandler(type: 0 | 1, handler: evhandler): any {
    if (type === 0) {
      return () => {
        if (document.visibilityState !== "hidden") {
          handler();
        }
      };
    } else if (type === 1) {
      return () => {
        if (document.visibilityState === "hidden") {
          handler();
        }
      };
    }
  }

  /**
   * 添加事件
   *
   * @param type 0表示前台事件，1表示后台事件
   * @param handler 事件函数
   * @param group 自定义事件的id，同一个group的事件函数会处于同一组
   */
  private addListener(type: 0 | 1, handler: () => void, group?: string) {
    const targetListenerList =
      type === 0 ? this.frontListeners : this.backListeners;
    const hasListenerExisted = targetListenerList.some((item: any) => {
      return item && item.rawHandler.toString() === handler.toString();
    });
    if (hasListenerExisted) {
      console.warn(
        "the listener has already been existed, don't insert duplicate listener"
      );
    } else {
      const id = this.getID();
      const handlerFn = this.wrapHandler(type, handler);
      targetListenerList.push({
        id,
        group,
        handler: handlerFn,
        rawHandler: handler
      });
      document.addEventListener("visibilitychange", handlerFn);
      return id;
    }
  }

  // 根据id删除事件监听器
  private removeListenerById(listeners: any[], id: number) {
    const handlerFn = listeners[id].handler;
    listeners.splice(id, 1);
    document.removeEventListener("visibilitychange", handlerFn);
  }

  // 根据group删除事件监听器
  private removeListenerByGroup(listeners: any[], key: string) {
    listeners.forEach((item: any, i: number) => {
      if (item.group === key) {
        document.removeEventListener("visibilitychange", item.handler);
        listeners.splice(i, 1);
      }
    });
  }
}

export default new AppLifeCycle();
