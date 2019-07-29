<template>
  <v-app>
    <Toolbar />
    <v-container fill-height mt-12 pt-12>
      <v-layout row wrap class="animated fadeIn">
        <v-flex xs12>
          <router-view />
        </v-flex>
      </v-layout>
    </v-container>
  </v-app>
</template>

<script>
import Toolbar from "./views/Toolbar";
import Vue from "vue";
import animate from "animate.css";
Vue.use(animate);

export default {
  name: "App",
  components: {
    Toolbar
  },
  data() {
    return {};
  }
};
</script>
