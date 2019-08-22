<template>
  <v-dialog v-model="visible" :width="width" persistent>
    <v-card>
      <v-card-title
        :class="`headline ${$store.getters.getThemeColor} white--text`"
        primary-title
      >{{title}}</v-card-title>
      <v-card-text>
        <v-container grid-list-md>
          <v-data-table
            :headers="headers"
            hide-default-footer
            :items="items"
            :no-data-text="'No hay elementos'"
            class="elevation-1"
          ></v-data-table>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" text @click="$emit('close')">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: ["visible", "width", "title", "headers", "items"]
};
</script>
