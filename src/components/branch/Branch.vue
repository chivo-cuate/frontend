<template>
  <v-container fluid>
    <v-layout row wrap>
      <v-flex xs12 sm4>
        <v-card>
          <v-list dense>
            <v-list-item
              v-for="(item, index) in actions"
              :to="`/sucursal/${item.action}`"
              :key="`action-${index}`"
            >
              <v-list-item-action>
                <v-icon :color="$store.getters.getThemeColor">{{item.icon}}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>{{item.title}}</v-list-item-title>
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
            <Ingredients v-else-if="currAction === 'ingredientes'" />
          </v-card>
        </v-flex>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import Index from "@/components/branch/Index";
import Ingredients from "@/components/branch/Ingredients";

export default {
  data: () => ({
    drawer: null,
    currAction: null,
    actions: [
      { action: "inicio", title: "Inicio", icon: "home" },
      { action: "ingredientes", title: "Ingredientes", icon: "assignment" },
      { action: "almacen", title: "Almacén", icon: "store" },
      { action: "productos", title: "Productos", icon: "shopping_cart" },
      { action: "menu-diario", title: "Menú diario", icon: "local_dining" }
    ]
  }),
  components: { Index, Ingredients },
  beforeRouteUpdate(to, from, next) {
    this.verifyAction(to.params.action);
    next();
  },
  mounted() {
    this.verifyAction(this.$route.params.action);
  },
  methods: {
    verifyAction(action) {
      let validAction = this.actions.find(obj => {
        return obj.action === action;
      });
      if (validAction) {
        this.currAction = validAction.action;
      } else {
        this.$router.push("/404");
      }
    }
  }
};
</script>
