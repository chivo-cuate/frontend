<template>
  <v-btn color="primary" :class="color" text>
    <v-icon :class="color">lock</v-icon>
    <span :class="`${color} fa`">Acceder</span>
  </v-btn>
</template>

<script>
export default {
  props: ["color"]
};
</script>

