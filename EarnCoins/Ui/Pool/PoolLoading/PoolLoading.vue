<template>
  <div class="pool-loading">
    <div class="ball-pulse">
      <div></div>
      <div></div>
      <div></div>
    </div>
    <p>Fetching feeds ...</p>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
@Component({
  components: {}
})
export default class PoolLoading extends Vue {}
</script>

<style scoped lang="scss" src="./pool_loading.scss"></style>
