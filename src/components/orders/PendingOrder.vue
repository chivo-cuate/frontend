<template>
  <v-layout wrap>
    <v-flex>
      <v-btn text disabled>
        <v-img :src="require(`@/assets/img/table${order.status_id}.png`)" width="70px"></v-img>
      </v-btn>
      <br />
      <v-chip class="table-number-menu no-radius">Mesa {{order.table_number}}</v-chip>
      <br />
      <div
        v-for="(orderAsset, orderAssetIndex) in order.assets"
        :key="`orderAsset-${orderAssetIndex}`"
      >
        <span>{{ orderAsset.name }}</span><v-chip x-small class="ml-1 error">{{ orderAsset.quantity }}</v-chip>
        <br />
      </div>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  data() {
    return {};
  },
  components: {},
  props: ["order"],
  methods: {}
};
</script>
