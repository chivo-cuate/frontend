<template>
  <v-layout wrap>
    <v-flex>
      <v-btn text disabled>
        <v-img
          :src="require(`@/assets/img/table${order.status_id}.png`)"
          width="70px"
        ></v-img>
      </v-btn>
      <br />
      <v-chip label class="mt-1">
        <v-icon small>mdi-tag</v-icon>
        <span
          v-html="`Mesa ${order.table_number} - orden ${order.order_number}`"
        ></span>
      </v-chip>

      <br />
      <div
        v-for="(orderAsset, orderAssetIndex) in order.assets"
        :key="`orderAsset-${orderAssetIndex}`"
      >
        <span>{{ orderAsset.name }}</span
        ><v-chip x-small class="ml-1 error">{{ orderAsset.quantity }}</v-chip>
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
