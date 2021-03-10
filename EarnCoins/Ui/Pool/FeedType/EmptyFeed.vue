<template>
  <section class="emptyFeed">
    <img
      src="~@/assets/icons-file/earn_coin/placeholder@3x.png"
      alt="userAvatar"
      class="img"
    />
    <p class="title">No feeds fetched</p>
    <p class="desc">Please try again later</p>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class EmptyFeed extends Vue {}
</script>

<style scoped lang="scss">
.emptyFeed {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 164px;
  width: 100%;
  .img {
    margin-bottom: 14px;
    width: 104px;
  }
  .title {
    margin-bottom: 6px;
    font-family: AppleSDGothicNeo-Bold;
    font-size: $font-16;
    color: $white;
  }
  .desc {
    font-family: AppleSDGothicNeo-Regular;
    font-size: $font-12;
    color: #968e9c;
  }
}
</style>
