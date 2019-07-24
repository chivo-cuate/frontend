<template>
  <v-layout row wrap>
    <v-flex xs12 sm12 md12 lg12>
      <v-navigation-drawer v-model="drawer" absolute>
        <v-list dense nav class="py-0">
          <v-list-item two-line>
            <v-list-item-avatar>
              <img :src="require('../assets/img/logo_color.png')" alt="El Chivo Cuate" />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>Taquer&iacute;a</v-list-item-title>
              <v-list-item-subtitle>El Chivo Cuate</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-divider></v-divider>

          <template v-if="$store.getters.isGuest">
            <v-list-item link to="/acceso/iniciar-sesion" color="success">
              <v-list-item-icon>
                <v-icon>lock</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Acceder</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>

          <template v-else>
            <BranchSelector color="success--text" />

            <v-btn text to="/pedidos">
              <v-icon class="success--text fa">room_service</v-icon>
              <span class="success--text">&Oacute;rdenes</span>
            </v-btn>

            <ManageDropdown color="success--text" />

            <Notifications />
          </template>
        </v-list>
      </v-navigation-drawer>

      <v-app-bar class="animated slideInDown" :class="$store.getters.getThemeColor" fixed>
        <v-app-bar-nav-icon
          style="background-color: green; color: red!important;"
          class="hidden-md-and-up"
          @click.stop="drawer = !drawer"
        ></v-app-bar-nav-icon>

        <v-toolbar-title class="white--text">
          <router-link to="/inicio" tag="span" style="cursor: pointer">
            <img
              class="hidden-sm-and-down"
              :src="require('../assets/img/logo_text.png')"
              alt="El Chivo Cuate"
            />
            <img
              class="hidden-md-and-up"
              :src="require('../assets/img/logo_color.png')"
              alt="El Chivo Cuate"
            />
          </router-link>
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <v-toolbar-items class="hidden-sm-and-down">
          <template v-if="$store.getters.isGuest">
            <v-btn text to="/acceso/iniciar-sesion">
              <v-icon class="white--text">lock</v-icon>
              <span class="white--text">Acceder</span>
            </v-btn>
          </template>

          <template v-else>
            <BranchSelector color="white--text" />

            <v-btn text to="/pedidos">
              <v-icon class="white--text">room_service</v-icon>
              <span class="white--text">&Oacute;rdenes</span>
            </v-btn>

            <ManageDropdown color="white--text" />

            <Notifications />

            <v-menu offset-y transition="fade-transition" bottom>
              <template v-slot:activator="{ on }">
                <v-btn color="primary" class="white--text" text v-on="on">
                  <v-icon class="white--text">account_circle</v-icon>
                  <span class="white--text">Mi cuenta</span>
                </v-btn>
              </template>
              <v-list>
                <v-list-item to="/perfil" class="dropdown-menu-item">
                  <v-icon class="fa">person</v-icon>
                  <span>Mi perfil</span>
                </v-list-item>

                <v-list-item v-on:click="logout()" class="dropdown-menu-item">
                  <v-icon class="fa">power_settings_new</v-icon>
                  <span>Salir</span>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </v-toolbar-items>
      </v-app-bar>
    </v-flex>

    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)" />
  </v-layout>
</template>

<script>
import classList from "classlist";
import { mapGetters } from "vuex";
import Notifications from "@/components/Notifications";
import BranchSelector from "@/components/BranchSelector";
import ManageDropdown from "@/components/ManageDropdown";

export default {
  data() {
    return {
      drawer: false
    };
  },
  components: { Notifications, BranchSelector, ManageDropdown },
  mounted() {},
  methods: {
    logout() {
      this.$store.commit("logout");
      this.$router.push("/acceso/iniciar-sesion");
    }
  }
};
</script>

<style scoped>
a {
  text-decoration: none;
}
.white--text {
  margin-left: 5px;
}
/*.bold {
  font-weight: bold;
}
.not-bold {
  font-weight: normal;
}*/
::-webkit-scrollbar {
  width: 7px !important;
}
</style>
