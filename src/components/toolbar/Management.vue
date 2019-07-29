<template>
  <v-menu
    v-if="$store.getters.isAdmin || $store.getters.isManager"
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
      <v-list-item v-if="$store.getters.isManager && $store.getters.getCurrBranch" to="/sucursal/inicio" class="dropdown-menu-item">
        <v-icon class="fa">domain</v-icon>
        <span>Sucursal activa</span>
      </v-list-item>
      <v-list-item v-if="$store.getters.isAdmin" to="/seguridad/inicio" class="dropdown-menu-item">
        <v-icon class="fa">security</v-icon>
        <span>Seguridad</span>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>

export default {
  data() {
    return {
      
    };
  },
  props: ['color']
};
</script>
