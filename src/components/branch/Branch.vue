<template>
  <v-container fluid>
    <v-layout row wrap>
      <v-flex xs12 sm4>
        <v-card>
          <v-list dense>
            <v-list-item
              v-for="(item, index) in $store.getters.getBranchPermissions"
              :to="item.slug"
              :key="`action-${index}`"
            >
              <v-list-item-action>
                <v-icon :color="$store.getters.getThemeColor">{{item.icon}}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>{{item.name}}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-flex>

      <v-flex xs12 sm8 text-center>
        <v-flex sm11 offset-sm1>
          <v-card class="elevation-0">
            <p class="text-center uppercase white--text" :class="$store.getters.getThemeColor">{{ $route.params.action }}</p>
            <Index v-if="currAction === 'inicio'" />
            <Assets :apiUrl="currAction" v-if="currAction === 'ingredientes'" class="animated fadeIn" />
            <Stock v-if="currAction === 'almacen'" class="animated fadeIn" />
            <Assets :apiUrl="currAction" v-if="currAction === 'productos'" class="animated fadeIn" />
            <DailyMenu v-if="currAction === 'menu-diario'" class="animated fadeIn" />
          </v-card>
        </v-flex>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import Index from "@/components/branch/Index";
import Stock from "@/components/branch/Stock";
import Assets from "@/components/branch/Assets";
import DailyMenu from "@/components/branch/DailyMenu";

export default {
  data: () => ({
    drawer: null,
    currAction: null
  }),
  
  components: { Index, Stock, DailyMenu, Assets },

  beforeRouteUpdate(to, from, next) {
    this.verifyAction(to.params.action);
    next();
  },
  mounted() {
    this.verifyAction(this.$route.params.action);
  },
  methods: {
    verifyAction(action) {
      this.currAction = action;
    }
  }
};
</script>
