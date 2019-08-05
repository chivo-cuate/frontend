<template>
  <v-menu
    v-if="securityPerms + branchPerms + branchesPerms > 0 "
    offset-y
    transition="fade-transition"
    bottom
    open-on-hover
  >
    <template v-slot:activator="{ on }">
      <v-btn color="primary" text v-on="on">
        <v-icon :class="`${color} fa`">settings</v-icon>
        <span :class="`${color} fa`">Administrar</span>
        <v-icon :class="color">arrow_drop_down</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item v-if="securityPerms > 0" to="/seguridad/inicio" class="dropdown-menu-item">
        <v-icon>security</v-icon>
        <span>Seguridad</span>
      </v-list-item>
      <v-list-item v-if="branchesPerms > 0" to="/sucursales/sucursales" class="dropdown-menu-item">
        <v-icon>domain</v-icon>
        <span>Sucursales</span>
      </v-list-item>
      <v-list-item
        v-if="branchPerms > 0 && $store.getters.getCurrBranch"
        to="/sucursal/inicio"
        class="dropdown-menu-item"
      >
        <v-icon>location_city</v-icon>
        <span>Mi Sucursal</span>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  data() {
    return {
      securityPerms: 0,
      branchPerms: 0,
      branchesPerms: 0
    };
  },
  mounted() {
    this.securityPerms = this.$store.getters.getSecurityPermissions.length;
    this.branchPerms = this.$store.getters.getBranchPermissions.length;
    this.branchesPerms = this.$store.getters.getBranchesPermissions.length;
  },
  props: ["color"]
};
</script>
