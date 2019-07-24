<template>
  <v-flex xs12>
    <p class="subheading text-uppercase text-xs-center">
      <template v-if="message">
        <span>{{ message }}</span>
        <br>
      </template>
      <v-progress-circular :width="2" indeterminate class="mt-3" :color="$store.getters.getThemeColor"></v-progress-circular>
    </p>
  </v-flex>
</template>

<script>
export default {
  data() {
    return {};
  },
  props: ["message"]
};
</script>