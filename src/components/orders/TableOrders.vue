<template>
  <v-navigation-drawer v-model="drwOrders" absolute temporary :permanent="drwOrders" right>
    <template v-if="drwOrders">
      <v-list-item class="grey">
        <v-list-item-content>
          <v-list-item-title class="uppercase">Mesa {{ editedTable.table_number }}</v-list-item-title>
        </v-list-item-content>
        <v-list-item-icon>
          <v-icon @click="$emit('close')">close</v-icon>
        </v-list-item-icon>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense>
        <v-list-item v-for="(order, orderIndex) in editedTable.orders" :key="`order-${orderIndex}`">
          <v-list-item-content>
            <v-layout wrap>
              <v-flex xs6>
                <v-chip small pill link @click="emitEvent('dlgViewOrder', orderIndex)">
                  <v-avatar left :class="order.gui_attribs.icon_color">
                    <v-icon size="20" class="white--text">{{ order.gui_attribs.icon }}</v-icon>
                    <!--<span class="white--text">{{ order.slug }}</span>-->
                  </v-avatar>
                  <span>Orden #{{ orderIndex + 1 }}</span>
                </v-chip>
              </v-flex>

              <v-flex>
                <v-layout>
                  <v-icon
                    v-ripple
                    v-if="order.gui_attribs.edit && perms.canEdit"
                    @click="emitEvent('dlgEditOrder', orderIndex)"
                    class="warning--text"
                  >edit</v-icon>
                  <v-icon
                    v-ripple
                    v-if="order.gui_attribs.serve"
                    @click="emitEvent('dlgServeProducts', orderIndex)"
                    class="success--text"
                  >check</v-icon>
                  <v-icon
                    v-ripple
                    v-if="order.gui_attribs.checkout && perms.canCheckout"
                    @click="emitEvent('dlgCheckout', orderIndex)"
                    class="success--text"
                  >attach_money</v-icon>
                  <v-icon
                    v-ripple
                    v-if="order.gui_attribs.delete && perms.canDelete"
                    @click="emitEvent('dlgCancelOrder', orderIndex)"
                    class="error--text"
                  >delete</v-icon>
                </v-layout>
              </v-flex>
            </v-layout>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </template>
  </v-navigation-drawer>
</template>

<script>
export default {
  data() {
    return {
      editedOrder: null,
      editedAssets: null,
      dlgViewOrder: false
    };
  },
  props: ["drwOrders", "editedTable", "perms"],
  methods: {
    emitEvent(action, orderIndex) {
      this.$emit('showYesNoDialog', {action: action, orderIndex: orderIndex});
    }
  }
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
