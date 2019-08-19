<template>
  <v-flex xs12>
    <v-img :src="require('@/assets/img/403.png')" contain height="150"></v-img>
    <v-flex class="text-center mt-3">
      <span class="title">No tienes acceso al recurso solicitado.</span><br />
      <router-link to="/inicio">
        <v-btn :class="$store.getters.getThemeColor" class="mt-2 white--text">
          <v-icon small>home</v-icon>Ve al inicio
        </v-btn>
      </router-link>
    </v-flex>
  </v-flex>
</template>
