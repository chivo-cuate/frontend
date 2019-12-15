<template>
  <v-container>
    <v-card tile class="pb-4">
      <v-card-title
        :class="`title ${$store.getters.getThemeColor} white--text`"
        primary-title
      ><v-icon class="white--text">access_time</v-icon>&Oacute;rdenes en cola</v-card-title>

      <v-layout v-if="orders.length > 0" wrap mt-8 pb-2>
          <v-flex
            v-for="(order, orderIndex) in orders"
            :key="`table-${orderIndex}`"
            class="animated fadeIn mr-5 ml-5 text-center"
          >
            <PendingOrder :order="order" />
          </v-flex>
      </v-layout>
      <v-layout v-else wrap>
        <v-flex>
          <p class="title text-center mt-8">No se han encontrado &oacute;rdenes en cola.</p>
        </v-flex>
      </v-layout>
    </v-card>
  </v-container>
</template>

<script>
import PendingOrder from "@/components/orders/PendingOrder";

export default {
  data() {
    return {};
  },
  components: { PendingOrder },
  props: ["orders"]
};
</script>

<style scoped>
.table-number-menu {
  border-radius: 0;
  bottom: 15px;
}
.v-icon {
  margin-left: 5px;
}
</style>
