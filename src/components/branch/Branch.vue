<template>
  <v-container fluid>
    <v-layout row wrap>
      <v-flex xs12 md4>
        <v-card>
          <v-list dense>
            <v-list-item
              v-for="(item, index) in $store.getters.getPermissions('Mi Sucursal')"
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

      <v-flex xs12 md8 text-center>
        <v-flex md11 offset-md1>
          <v-card class="elevation-0">
            <p class="text-center uppercase white--text" :class="$store.getters.getThemeColor">{{ $route.params.action }}</p>
            <Index v-if="currAction === 'inicio'" />
            <Stock v-if="currAction === 'almacen'" class="animated fadeIn" />
            <DailyMenu v-if="currAction === 'menu-diario'" class="animated fadeIn" />
            <MyUsers v-if="currAction === 'usuarios-sucursal'" class="animated fadeIn" />
          </v-card>
        </v-flex>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import Index from "@/components/branch/Index";
import Stock from "@/components/branch/Stock";
import DailyMenu from "@/components/branch/DailyMenu";
import MyUsers from "@/components/branch/MyUsers";

export default {
  data: () => ({
    drawer: null,
    currAction: null
  }),
  
  components: { Index, Stock, DailyMenu, MyUsers },

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

      if (action !== 'inicio') {
        let validRoute = false;
        this.$store.getters.getPermissions("Mi Sucursal").forEach(element => {
          let actionAux = element.slug.substring(element.slug.lastIndexOf("/") + 1);
          if (actionAux === action) {
            validRoute = true;
          }
        });
        if (!validRoute) {
          this.$router.push('/not-found');
        }
      }
    }
  }
};
</script>
