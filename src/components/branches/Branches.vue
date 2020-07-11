<template>
  <v-container fluid>
    <v-layout row wrap>
      <v-flex xs12 sm4>
        <v-card>
          <v-list dense>
            <v-list-item
              v-for="(item, index) in $store.getters.getPermissions('Sucursales')"
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
            <BranchesManagement v-if="currAction === 'sucursales'" class="animated fadeIn" />
          </v-card>
        </v-flex>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import Index from "@/components/branches/Index";
import BranchesManagement from "@/components/branches/BranchesManagement";

export default {
  data: () => ({
    drawer: null,
    currAction: null
  }),
  components: { Index, BranchesManagement },
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
