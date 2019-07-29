<template>
  <v-container fluid>
    <v-layout row wrap>
      <v-flex xs12 sm4>
        <v-card>
          <v-list dense>
            <v-list-item
              v-for="(item, index) in actions"
              :to="`/seguridad/${item.action}`"
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
            <Branches v-if="currAction === 'sucursales'" />
            <Roles v-if="currAction === 'roles'" />
            <Usuarios v-if="currAction === 'usuarios'" />
          </v-card>
        </v-flex>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import Index from "@/components/security/Index";
import Branches from "@/components/security/Branches";
import Roles from "@/components/security/Roles";
import Usuarios from "@/components/security/Users";

export default {
  data: () => ({
    drawer: null,
    currAction: null,
    actions: [
      { action: "inicio", title: "Inicio", icon: "home" },
      { action: "sucursales", title: "Sucursales", icon: "domain" },
      { action: "roles", title: "Roles", icon: "assignment_ind" },
      { action: "usuarios", title: "Usuarios", icon: "supervisor_account" },
    ]
  }),
  components: { Index, Branches, Roles, Usuarios },
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
