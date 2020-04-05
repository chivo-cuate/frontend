<template>
  <v-container>
    <v-card tile class="pb-4">
      <v-card-title
        :class="`title ${$store.getters.getThemeColor} white--text`"
        primary-title
      ><v-icon class="white--text">mdi-account</v-icon>Elaboradores para esta pantalla</v-card-title>

      <v-layout>
        <v-flex xs10 offset-xs1 sm8 offset-sm2 md6 offset-md3 mt-10
          class="animated fadeIn"
        >
          <v-autocomplete
            outlined
            :items="cooks"
            v-model="chosenCooks"
            item-text="full_name"
            :return-object="true"
            label="Seleccione los elaboradores"
            no-data-text="No hay resultados"
            multiple
          >
            <template v-slot:selection="{ item }">
              <v-chip>
                <span>{{ item.full_name }}</span>
              </v-chip>
            </template>
          </v-autocomplete>
        </v-flex>
      </v-layout>
      <v-layout>
        <v-flex class="text-center">
          <v-btn :disabled="chosenCooks.length === 0" x-large class="success" @click="setChosenCooks"><v-icon class="fa">check</v-icon>Aceptar</v-btn>
        </v-flex>
      </v-layout>
    </v-card>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      cooks: [],
      chosenCooks: []
    };
  },
  props: ["orders"],
  mounted() {
    this.cooks = this.$store.getters.getCurrentBranchCooks;
  },
  methods: {
    setChosenCooks() {
      this.$store.commit("setChosenCooks", this.chosenCooks)
      console.log(this.chosenCooks)
    }
  }
};
</script>
