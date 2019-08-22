<template>
  <v-chip
    v-if="!$store.getters.isGuest && $store.getters.getCurrBranch"
    pill
    class="ml-3 mt-1"
    dark
    text-color="white"
    small
  >
    <v-avatar left :color="$store.getters.getThemeColor">
      <v-icon>domain</v-icon>
    </v-avatar>
    {{ $store.getters.getCurrBranch.name }}
  </v-chip>
</template>

<script>
export default {
};
</script>
