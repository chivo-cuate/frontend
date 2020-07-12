<template>
  <v-menu v-if="ordersPerms > 0 && $store.getters.getCurrBranch" offset-y transition="fade-transition" bottom open-on-hover>
    <template v-slot:activator="{ on }">
      <v-btn color="primary" text v-on="on">
        <v-icon :class="`${color} fa`">mdi-account</v-icon>
        <span :class="`${color} fa`">Clientes</span>
        <v-icon :class="color">arrow_drop_down</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item v-if="ordersPerms > 0" to="/clientes/ordenes" class="dropdown-menu-item">
        <v-icon>room_service</v-icon>
        <span>Órdenes</span>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  data() {
    return {
      ordersPerms: 0
    };
  },
  mounted() {
    this.ordersPerms = this.$store.getters.getPermissions("Clientes").length;
  },
  props: ["color"]
};
</script>
