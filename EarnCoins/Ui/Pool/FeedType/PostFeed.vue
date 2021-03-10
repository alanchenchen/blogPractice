<template>
  <section
    ref="img"
    class="postFeed"
    :style="{
      height: imgAdaptedHeight
    }"
  >
    <img
      v-if="!vedioUrl"
      class="placeholder"
      src="~@/assets/icons-file/earn_coin/video.png"
    />
    <section style="height:100%;display:flex;align-items:center;" v-else>
      <VideoPlayer
        v-if="shouldShowVideo"
        box-style="max-height: 100%; display: flex;"
        :video-src="vedioUrl"
        :poster="posterSrc"
      />
      <img v-else class="img" :src="vedioUrl" />
    </section>
  </section>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import VideoPlayer from "@/components/VideoPlayer/VideoPlayer.vue";

import { isIos } from "@/utils/lodash";
import { item_details } from "@/api/tt/tt_user";
// import { getTtItemDetail } from "@/api/tt/tt_login_earn_coin/tt_login";
import { shouldUseNewTTLogic } from "@/utils/general_utils";

@Component({
  components: {
    VideoPlayer
  }
})
export default class PostFeed extends Vue {
  @Prop()
  private resource: any;
  private imgAdaptedHeight: string = "auto";
  private vedioUrl: string = "";
  private posterSrc: string = "";
  private isIOS: boolean = isIos();
  private shouldShowVideo: boolean = false;

  @Watch("resource")
  /**
   * 监听like/comment的feed，避免feed静态资源过期，手动获取用户数据展示
   */
  private async watchFeed(val: any) {
    try {
      this.vedioUrl = "";
      this.posterSrc = "";
      // 老版本逻辑获取实时的资源
      if (!shouldUseNewTTLogic("1.1.0")) {
        const { itemInfo, statusCode } = await item_details(val.media_id);
        if (statusCode === 0) {
          if (this.isIOS) {
            // ios不支持webp动图，只能使用视频
            this.shouldShowVideo = true;
            this.vedioUrl = itemInfo.itemStruct.video.playAddr;
            this.posterSrc = itemInfo.itemStruct.video.cover;
          } else {
            // 安卓使用动图，避免视频加载时间过长
            this.shouldShowVideo = false;
            this.vedioUrl = itemInfo.itemStruct.video.dynamicCover;
          }
        }
      } else {
        // 新版本逻辑则直接使用feed里图片资源
        this.shouldShowVideo = false;
        this.vedioUrl = this.backupVedioUrl;
      }
    } catch (error) {
      console.log("fetch like/comment feed video error:", error);
      this.shouldShowVideo = false;
      this.vedioUrl = this.backupVedioUrl;
    }
  }
  get backupVedioUrl() {
    return this.isIOS
      ? this.resource && this.resource.image_thumb
      : this.resource &&
          (this.resource.image_high ||
            this.resource.image_low ||
            this.resource.image_thumb);
  }

  get backupPosterSrc() {
    return this.resource && this.resource.image_thumb;
  }

  private created() {
    this.watchFeed(this.resource);
  }

  private async mounted() {
    await this.$nextTick();
    const imgDom: any = this.$refs.img;
    const imgWidth = Number.parseFloat(
      getComputedStyle(imgDom)["width"] as any
    );
    this.imgAdaptedHeight = `${(imgWidth * 379) / 213}px`;
  }
}
</script>

<style scoped lang="scss">
.postFeed {
  @include flex-center;
  margin: 16px 81px 0;
  width: auto;
  overflow: hidden;
  background: #212020;
  .placeholder {
    width: 46px;
    height: 46px;
  }
  .img {
    width: 100%;
    object-fit: contain;
  }
}
@include media-adjustify(ip8) {
  .postFeed {
    width: 190px !important;
    height: 340px !important;
    margin: 16px auto 0;
  }
}
</style>
