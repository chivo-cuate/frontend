<template>
  <v-menu close-on-click dark offset-y transition="fade-transition" bottom open-on-hover>
    <template v-slot:activator="{ on }">
      <v-flex class="text-center align-center">
        <v-btn text disabled>
          <template v-if="table.orders_status_count">
            <v-badge
              v-for="(orderStatus, orderStatusIndex) in table.orders_status_count"
              :key="`badge-${orderStatusIndex}`"
              :color="orderStatus.icon_color"
              overlap
              class="animated slideInDown"
              :style="`bottom: 32px; left: ${59 - (20 * orderStatusIndex)}px;`"
            >
              <template v-slot:badge>
                <!--<v-icon x-small>{{ orderStatus.icon }}</v-icon>-->
                <span>{{ orderStatus.count }}</span>
              </template>
            </v-badge>
          </template>
          <v-img :src="require(`@/assets/img/table${table.status_id}.png`)" width="70px"></v-img>
        </v-btn>
      </v-flex>
      <v-flex mb-3>
        <v-chip v-on="on" class="table-number-menu">Mesa {{table.table_number}}</v-chip>
      </v-flex>
    </template>
    <v-list>
      <v-list-item v-if="perms.canCreate" class="dropdown-menu-item" @click="setEditedTable('add')">
        <v-icon>local_dining</v-icon>
        <span>Agregar orden</span>
      </v-list-item>

      <v-list-item
        class="dropdown-menu-item"
        v-if="table.status_id !== -1 && (perms.canEdit || perms.canDelete || perms.canCheckout)"
        @click="setEditedTable('view-orders')"
      >
        <v-icon>local_dining</v-icon>
        <span>Ver &oacute;rdenes</span>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
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
  components: {},
  props: ["table", "perms"],
  methods: {
    setEditedTable(action) {
      this.$emit("setEditedTable", { table: this.table, action: action });
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
