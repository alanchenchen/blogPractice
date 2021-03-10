<template>
  <section class="button">
    <section class="changeAccount" @click="handlerClick">
      <p class="title">ADD ACCOUNT</p>
      <p class="desc">to continue earning coins</p>
    </section>
    <p class="toCoinStore" @click="handleMoreCoins">More Coins</p>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class LimitedButton extends Vue {
  private handlerClick() {
    this.$emit("shouldCloseLimit");
  }

  private handleMoreCoins() {
    this.$emit("clickMore");
  }
}
</script>

<style scoped lang="scss">
.button {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  .changeAccount {
    margin: 0 auto 16px;
    width: calc(100% - 48px);
    background: $white;
    border-radius: 10px;
    padding: 4px 0;
    &:active {
      box-shadow: 0px 0px 8px #ddd;
    }
    .title {
      margin-bottom: 0px;
      font-family: AppleSDGothicNeo-Bold;
      font-size: $font-16;
      color: #121111;
      text-align: center;
    }
    .desc {
      font-family: AppleSDGothicNeo-Regular;
      font-size: $font-10;
      color: #121111;
      text-align: center;
    }
  }
  .toCoinStore {
    width: 100%;
    text-align: center;
    font-family: AppleSDGothicNeo-Regular;
    font-size: $font-14;
    color: #f8185f;
  }
}
</style>
