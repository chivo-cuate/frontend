<template>
  <v-card tile class="mb-5 pb-3">
    <v-card-title
      :class="`title ${$store.getters.getThemeColor} white--text`"
      primary-title
    >
      <v-icon class="white--text">card_giftcard</v-icon>&Oacute;rdenes para
      llevar
      <v-spacer></v-spacer>
      <v-btn text class="white--text" @click="showDlgMenu()"
        >Ver men&uacute;</v-btn
      >
    </v-card-title>

    <v-layout>
      <v-spacer></v-spacer>
      <v-btn
        :class="`${$store.getters.getThemeColor} white--text mt-4 mr-4`"
        @click="setEditedTable('add')"
      >
        <v-icon></v-icon>Nueva
      </v-btn>
    </v-layout>

    <v-layout v-if="takeAwayOrders.length > 0" wrap mt-8 pb-2>
      <v-flex
        v-for="(order, orderIndex) in takeAwayOrders"
        :key="`table-${orderIndex}`"
        class="animated fadeIn mr-5 ml-5 text-center"
      >
        <TakeAwayOrder :order="order" />
      </v-flex>
    </v-layout>

    <v-layout v-else wrap>
      <v-flex>
        <p class="title text-center mt-5">No se han encontrado &oacute;rdenes para llevar.</p>
      </v-flex>
    </v-layout>
  </v-card>
</template>

<script>
import TakeAwayOrder from "@/components/orders/TakeAwayOrder";

export default {
  data() {
    return {
      handlingOrder: false,
      editedOrdersByCategory: [],
      editedOrdersListIndex: -1,
      editedOrder: {},
      editedOrderIndex: {},
      editedAssets: [],
      editedAsset: {},
      drwOrders: false,
      dlgTableOrder: false,
      dlgCheckout: false,
      dlgCancelOrder: false,
      validAssetForm: false,
      requiredRules: [v => !!v || "Dato obligatorio"],
      numberRules: [
        v => !!v || "Dato obligatorio",
        v => v > 0 || "Dato incorrecto"
      ],
      timer: null
    };
  },
  components: { TakeAwayOrder },
  props: ["table", "perms", "takeAwayOrders"],
  methods: {
    showDlgMenu() {
      this.$emit("showDlgMenu");
    },
    setEditedTable(action) {
      this.$emit("setEditedTable", {
        table: -1,
        action: action,
        order_type: 2
      });
    }
  }
};
</script>

<style scoped>
.table-number-menu {
  border-radius: 0;
  bottom: 23px;
}
.v-icon {
  margin-left: 5px;
}
</style>
