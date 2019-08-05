<template>
  <v-menu offset-y transition="fade-transition" bottom open-on-hover>
    <template v-slot:activator="{ on }">
      <v-btn color="primary" :class="color" text v-on="on">
        <v-icon :class="color">account_circle</v-icon>
        <span :class="`${color} fa`">Mi Cuenta</span>
        <v-icon :class="color">arrow_drop_down</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item to="/perfil" class="dropdown-menu-item">
        <v-icon>person</v-icon>
        <span>Mi perfil</span>
      </v-list-item>
      <v-list-item v-on:click="logout()" class="dropdown-menu-item">
        <v-icon>power_settings_new</v-icon>
        <span>Salir</span>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {
    logout() {
      this.$store.commit("logout");
      this.$router.push("/acceso/iniciar-sesion");
    }
  },
  props: ["color"]
};
</script>
