<template>
  <section class="accountFeed">
    <section class="avatar">
      <img :src="userAvatar" class="img" />
    </section>
    <p class="name">@{{ userName }}</p>
  </section>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class AccountFeed extends Vue {
  @Prop()
  private resource: any;

  get userAvatar() {
    if (this.resource && this.resource.profile_pic_url) {
      return this.resource.profile_pic_url;
    } else {
      return require("@/assets/icons-file/earn_coin/follower_placeholder.png");
    }
  }

  get userName() {
    if (this.resource && this.resource.username) {
      return this.resource.username;
    } else {
      return "";
    }
  }
}
</script>

<style scoped lang="scss">
.accountFeed {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 127px;
  width: 100%;
  .avatar {
    @include flex-center;
    margin-bottom: 11px;
    width: 113px;
    height: 113px;
    background: #919496;
    border: 2px solid $white;
    border-radius: 50%;
    overflow: hidden;
    .img {
      width: 100%;
    }
  }
  .name {
    font-family: AppleSDGothicNeo-Regular;
    font-size: $font-12;
    color: $white;
  }
}
</style>
