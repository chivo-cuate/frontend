<template>
  <v-container>
    <v-card tile class="pb-4">
      <v-card-title :class="`title ${$store.getters.getThemeColor} white--text`" primary-title>
        <v-icon class="white--text">mdi-account</v-icon>Elaboradores para esta
        pantalla
      </v-card-title>

      <v-layout>
        <v-flex
          xs10
          offset-xs1
          sm8
          offset-sm2
          md6
          offset-md3
          mt-10
          class="animated fadeIn text-center"
        >
          <v-chip
            v-for="(item, index) in cooks"
            :key="`cook-${index}`"
            link
            label
            :disabled="item.readOnly"
            :color="getCookColor(index)"
            text-color="white"
            class="ml-1"
            @click="toggleActiveCook(index)"
          >
            <v-avatar left>
              <v-icon>{{ getCookIcon(index) }}</v-icon>
            </v-avatar>
            {{ item.full_name }}
          </v-chip>
        </v-flex>
      </v-layout>

      <v-layout>
        <v-flex class="text-center mt-2">
          <v-btn :disabled="chosenCooks.length === 0" class="success" @click="setChosenCooks">
            <v-icon class="fa">check</v-icon>Aceptar
          </v-btn>
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
    let myID = this.$store.getters.getUserID;
    let myUserIndex = this.cooks.findIndex(obj => parseInt(obj.id) === myID);
    if (myUserIndex >= 0) {
      this.cooks[myUserIndex].readOnly = true;
      this.chosenCooks.push(this.cooks[myUserIndex]);
    }
  },
  methods: {
    getCookIcon(index) {
      return this.getSelectedCooksIndex(index) >= 0
        ? "mdi-checkbox-marked-circle"
        : "mdi-close";
    },

    getCookColor(index) {
      return this.getSelectedCooksIndex(index) >= 0 ? "info" : "grey";
    },

    getSelectedCooksIndex(index) {
      let cookId = this.cooks[index].id;
      return this.chosenCooks.findIndex(obj => obj.id === cookId);
    },

    toggleActiveCook(index) {
      let cookIndex = this.getSelectedCooksIndex(index);
      if (cookIndex === -1) {
        this.chosenCooks.push(this.cooks[index]);
      } else {
        this.chosenCooks.splice(cookIndex, 1);
      }
    },

    setChosenCooks() {
      this.$emit('setChosenCooks', this.chosenCooks)
    }
  }
};
</script>
