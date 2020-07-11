<template>
  <v-layout wrap>
    <v-flex class="pb-3">
      <v-card>
        <div class="d-flex flex-column align-center mb-3">
          <v-img
            :src="require(cook.sex === 'F' ? `@/assets/img/cheff_f.png` : `@/assets/img/cheff_m.png`)"
            width="70px"
          ></v-img>
          <v-chip label dark class="mt-1 cyan darken-3">{{`${cook.first_name} ${cook.last_name}`}}</v-chip>
        </div>
        <v-divider></v-divider>
        <template v-if="cook.current_order">
          <p>
            <v-chip label class="mt-1">
              <v-icon>mdi-tag</v-icon>
              <span
                v-html="`${cook.current_order.order_type_id === 1 ? `Mesa ${cook.current_order.table_number}`  : 'Para llevar'} - orden ${cook.current_order.order_number}`"
              ></span>
            </v-chip>
            <br />
            <v-chip label class="warning darken-1 mt-1">
              <v-icon class="white--text">mdi-timelapse</v-icon>
              {{cook.current_order.elapsed_time}}
            </v-chip>
          </p>
          <div
            v-for="(orderAsset, orderAssetIndex) in cook.current_order.assets"
            :key="`orderAsset-${orderAssetIndex}`"
          >
            <span>
              <v-icon small>local_dining</v-icon>
              {{ orderAsset.asset_name }}
            </span>
            <v-chip x-small class="ml-1 error">{{ orderAsset.quantity }}</v-chip>
            <br />
          </div>
          <v-btn
            @click="$emit('showDlgFinish', cook)"
            large
            width="100%"
            :class="`${$store.getters.getThemeColor} mt-3 no-radius white--text`"
          >
            <v-icon>check</v-icon>Terminar
          </v-btn>
        </template>
        <template v-else>
          <p class="mt-3 pb-3 warning--text">No tiene orden asignada.</p>
        </template>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  props: ["cook"],
  mounted() {}
};
</script>
