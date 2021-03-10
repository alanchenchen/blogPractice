<template>
  <section id="limit-status">
    <img
      class="tips-icon"
      src="@/assets/icons-file/earn_coin/feed_limited.png"
    />

    <CountDwonTime
      :end-time-stamp="limitedEndTimeStamp"
      @countDownTimeEnded="shouldCloseLimit"
    />

    <h3>Limit Reached</h3>

    <p>
      You've reached the <span>hourly limit</span> of earning coins. Please wait
      the <span>above time</span> to continue.
    </p>
  </section>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import CountDwonTime from "@/components/CountDwonTime/CountDwonTime.vue";
@Component({
  components: {
    CountDwonTime
  }
})
export default class LimitStatus extends Vue {
  @Prop({ default: 0 })
  private limitedEndTimeStamp?: number;

  private shouldCloseLimit() {
    this.$emit("shouldCloseLimit");
  }
}
</script>

<style scoped lang="scss">
#limit-status {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-top: 127px;
  text-align: center;
  .tips-icon {
    display: block;
    width: 128px;
    margin-bottom: 22px;
  }
  h3 {
    font-size: 14px;
    color: $white;
    line-height: 16px;
    margin-bottom: 16px;
    font-family: AvenirNext-Medium, AppleSDGothicNeo-Medium;
    margin-top: 24px;
  }
  p {
    font-size: 12px;
    color: #8c8c8c;
    line-height: 18px;
    padding: 0 40px;

    span {
      font-family: AvenirNext-Medium, AppleSDGothicNeo-Medium;
      color: $orange;
    }
  }
  .boring-tip {
    font-size: 10px;
    line-height: 22px;
    color: rgb(245, 96, 40);
    padding: 0px 6px;
    border-radius: 2px;
    background: rgb(254, 249, 246);
    margin-top: 20px;
    font-family: AvenirNext-Medium, AppleSDGothicNeo-Medium;
  }
}
</style>
