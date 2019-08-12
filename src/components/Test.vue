<template>
  <v-menu
    offset-y
    transition="fade-transition"
    bottom
    open-on-hover
  >
    <template v-slot:activator="{ on }">
      <v-btn color="success" v-on="on">
        <span>Orden 1</span>
        <v-icon :class="color">arrow_drop_down</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item class="dropdown-menu-item">
        <v-icon>person</v-icon>
        <span>Juan Perez</span>
      </v-list-item>
      <v-list-item class="dropdown-menu-item">
        <v-icon>person</v-icon>
        <span>Rodrigo Fonseca</span>
      </v-list-item>
      <v-list-item class="dropdown-menu-item">
        <v-icon>person</v-icon>
        <span>Juana Carrasco</span>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
  export default {
    data () {
      return {
        drawer: null,
      }
    },
  }
</script>
