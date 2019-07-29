<template>
  <v-menu v-if="$store.getters.getBranches.length > 0" offset-y transition="fade-transition" right>
    <template v-slot:activator="{ on }">
      <v-btn color="primary" text v-on="on">
        <v-icon :class="`${color} fa`">domain</v-icon>
        <span :class="color">Escoger Sucursal</span>
      </v-btn>
    </template>
    <v-list>
      <v-list-item v-for="item in $store.getters.getBranches" :key="`branch-${item.id}`" @click="setCurrBranch(item)" class="dropdown-menu-item">
        <v-icon class="fa">group_work</v-icon>
        <span>{{ item.name }}</span>
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
  props: ['color'],
  methods: {
    setCurrBranch(branch) {
      this.$store.commit('setCurrBranch', branch)
      this.$router.push('/sucursal/inicio')
    }
  }
};
</script>
