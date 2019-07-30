<template>
  <v-flex xs12>
    <v-img :src="require('../assets/img/404.png')" contain height="300"></v-img>
    <v-flex class="text-center mt-3">
      <span class="title">Tu solicitud se ha perdido en el espacio.</span><br />
      <router-link to="/">
        <v-btn color="primary" class="mt-2">
          <v-icon small>home</v-icon>Ve al inicio
        </v-btn>
      </router-link>
    </v-flex>
  </v-flex>
</template>
