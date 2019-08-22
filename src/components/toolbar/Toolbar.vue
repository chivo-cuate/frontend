<template>
  <v-layout row wrap>
    <v-flex xs12 sm12 md12 lg12>
      <v-navigation-drawer v-model="drawer" absolute>
        <v-list dense nav class="py-0">
          <v-list-item two-line>
            <v-list-item-avatar>
              <img :src="require('@/assets/img/logo_color.png')" alt="El Chivo Cuate" />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>Taquer&iacute;a</v-list-item-title>
              <v-list-item-subtitle>El Chivo Cuate</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-divider></v-divider>

          <template v-if="$store.getters.isGuest">
            <Login class="mt-3" color="light-green--text" />
          </template>

          <template v-else>
            <div class="mt-3">
              <BranchSelector color="light-green--text" />
              <Clients color="light-green--text" />
              <Management color="light-green--text" />
              <MyAccount color="light-green--text" />
            </div>
          </template>
        </v-list>
      </v-navigation-drawer>

      <v-app-bar class="animated slideInDown" :class="$store.getters.getThemeColor" fixed>
        <v-app-bar-nav-icon class="hidden-md-and-up white--text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>

        <v-toolbar-title class="white--text">
          <router-link to="/inicio" tag="span" style="cursor: pointer">
            <img :src="require('@/assets/img/logo_text.png')" alt="El Chivo Cuate" />
          </router-link>
        </v-toolbar-title>

        <CurrBranchChip />

        <!--<v-btn
          text
          @click="$refs.notifComp.notifyUser('test')"
        >TTS</v-btn>-->

        <v-spacer></v-spacer>

        <v-toolbar-items class="hidden-sm-and-down">
          <template v-if="$store.getters.isGuest">
            <Login color="white--text" />
          </template>

          <template v-else>
            <BranchSelector color="white--text" />
            <Clients color="white--text" />
            <Management color="white--text" />
            <Notifications ref="notifComp" />
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
import Login from "@/components/toolbar/Login";
import CurrBranchChip from "@/components/toolbar/CurrBranchChip";
import BranchSelector from "@/components/toolbar/BranchSelector";
import Clients from "@/components/toolbar/Clients";
import Management from "@/components/toolbar/Management";
import Notifications from "@/components/toolbar/Notifications";
import MyAccount from "@/components/toolbar/MyAccount";

export default {
  data() {
    return {
      drawer: false,
      audioPlayer: null,
    };
  },
  components: {
    Login,
    CurrBranchChip,
    BranchSelector,
    Management,
    Clients,
    MyAccount,
    Notifications
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
