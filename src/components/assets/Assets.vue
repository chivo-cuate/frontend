<template>
  <v-container fluid>
    <v-layout row wrap>
      <v-flex xs12 md4>
        <v-card>
          <v-list dense>
            <v-list-item
              v-for='(item, index) in $store.getters.getPermissions("Productos")'
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
            <AssetType :apiUrl="currAction" v-if="currAction === 'ingredientes'" class="animated fadeIn" />
            <Stock v-if="currAction === 'almacen'" class="animated fadeIn" />
            <AssetType :apiUrl="currAction" v-if="currAction === 'productos'" class="animated fadeIn" />
            <DailyMenu v-if="currAction === 'menu-diario'" class="animated fadeIn" />
            <Category :apiUrl="currAction" v-if="currAction === 'categorias'" class="animated fadeIn" />
          </v-card>
        </v-flex>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import Index from "@/components/assets/Index";
import AssetType from "@/components/assets/AssetType";
import Category from "@/components/assets/Category";

export default {
  data: () => ({
    drawer: null,
    currAction: null,
    permissions: []
  }),
  
  components: { Index, AssetType, Category },

  beforeRouteUpdate(to, from, next) {
    this.verifyAction(to.params.action);
    next();
  },
  mounted() {
    this.permissions = this.$store.getters.getPermissions("Productos")
    this.verifyAction(this.$route.params.action);
  },
  methods: {
    verifyAction(action) {
      this.currAction = action;

      if (action !== 'inicio') {
        let validRoute = false;
        this.$store.getters.getPermissions("Productos").forEach(element => {
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
