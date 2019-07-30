<template>
  <v-menu
    v-if="securityPerms + branchPerms > 0 "
    offset-y
    transition="fade-transition"
    bottom
  >
    <template v-slot:activator="{ on }">
      <v-btn color="primary" text v-on="on">
        <v-icon :class="`${color} fa`">settings</v-icon>
        <span :class="color">Administrar</span>
      </v-btn>
    </template>
    <v-list>
      <v-list-item v-if="branchPerms > 0 && $store.getters.getCurrBranch" to="/sucursal/inicio" class="dropdown-menu-item">
        <v-icon small>domain</v-icon>
        <span>Sucursal activa</span>
      </v-list-item>
      <v-list-item v-if="securityPerms > 0" to="/seguridad/inicio" class="dropdown-menu-item">
        <v-icon small>security</v-icon>
        <span>Seguridad</span>
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
    };
  },
  created(){
    this.securityPerms = this.$store.getters.getSecurityPermissions.length
    this.branchPerms = this.$store.getters.getBranchPermissions.length
  },
  props: ['color']
};
</script>
