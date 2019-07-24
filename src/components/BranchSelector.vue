<template>
  <v-menu offset-y transition="fade-transition" right>
    <template v-slot:activator="{ on }">
      <v-btn color="primary" text v-on="on">
        <v-icon :class="`${color} fa`">domain</v-icon>
        <span :class="color">Cambiar Sucursal</span>
      </v-btn>
    </template>
    <v-list>
      <v-list-item @click class="dropdown-menu-item">
        <v-icon class="fa">group_work</v-icon>
        <span>Sucursal 1</span>
      </v-list-item>
      <v-list-item @click class="dropdown-menu-item">
        <v-icon class="fa">group_work</v-icon>
        <span>Sucursal 2</span>
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
