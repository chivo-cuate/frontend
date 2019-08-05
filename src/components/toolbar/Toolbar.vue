<template>
  <v-layout row wrap>
    <v-flex xs12 sm12 md12 lg12>
      <v-navigation-drawer v-model="drawer" absolute>
        <v-list dense nav class="py-0">
          <v-list-item two-line>
            <v-list-item-avatar>
              <img :src="require('../../assets/img/logo_color.png')" alt="El Chivo Cuate" />
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
            <BranchSelector color="light-green--text" />
            <Clients color="light-green--text" />
            <Management color="light-green--text" />
            <MyAccount color="light-green--text" />
          </template>
        </v-list>
      </v-navigation-drawer>

      <v-app-bar class="animated slideInDown" :class="$store.getters.getThemeColor" fixed>
        <v-app-bar-nav-icon
          class="hidden-md-and-up white--text"
          @click.stop="drawer = !drawer"
        ></v-app-bar-nav-icon>

        <v-toolbar-title class="white--text">
          <router-link to="/inicio" tag="span" style="cursor: pointer">
            <img
              :src="require('../../assets/img/logo_text.png')"
              alt="El Chivo Cuate"
            />
          </router-link>
        </v-toolbar-title>


        <v-chip v-if="$store.getters.getCurrBranch" class="ml-3">
          <span>{{ $store.getters.getCurrBranch.name }}</span>
        </v-chip>

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
            <Clients color="white--text" />
            <Management color="white--text" />
            <MyAccount color="white--text" />
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
import Notifications from "@/components/toolbar/Notifications";
import BranchSelector from "@/components/toolbar/BranchSelector";
import Clients from "@/components/toolbar/Clients";
import Management from "@/components/toolbar/Management";
import MyAccount from "@/components/toolbar/MyAccount";

export default {
  data() {
    return {
      drawer: false
    };
  },
  components: { BranchSelector, Management, Clients, MyAccount },
  mounted() {
    
  },
  methods: {
    
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
