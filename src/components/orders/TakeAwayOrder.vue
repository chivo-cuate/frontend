<template>
  <v-container>
    <v-layout wrap>
      <v-flex>
        <v-btn text disabled>
          <v-img
            :src="require(`@/assets/img/takeaway.png`)"
            width="52px"
          ></v-img>
        </v-btn>
        <br />

        <v-menu
          close-on-click
          offset-y
          transition="fade-transition"
          bottom
          open-on-hover
          dark
        >
          <template v-slot:activator="{ on }">
            <v-btn
              small
              class="mt-6"
              :class="order.gui_attribs.icon_color"
              dark
              v-on="on"
            >
              <v-icon size="20" class="white--text">
                {{ order.gui_attribs.icon }}</v-icon
              >{{ `Orden #${order.order_number}` }}
            </v-btn>
          </template>
          <v-list>
            <v-list-item v-if="order.gui_attribs.edit" class="dropdown-menu-item" @click="showYesNoDialog('dlgEditOrder')">
              <v-icon>edit</v-icon><span>Editar</span>
            </v-list-item>
            <v-list-item v-if="order.gui_attribs.delete" class="dropdown-menu-item" @click="showYesNoDialog('dlgCancelOrder')">
              <v-icon>close</v-icon><span>Eliminar</span>
            </v-list-item>
            <v-list-item v-if="order.gui_attribs.checkout" class="dropdown-menu-item" @click="showYesNoDialog('dlgCheckout')">
              <v-icon>attach_money</v-icon><span>Cerrar cuenta</span>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data() {
    return {};
  },
  components: {},
  props: ["order"],
  methods: {
    showYesNoDialog(action) {
      this.$root.$emit("showYesNoDialog", {
        action: action,
        order: this.order
      });
    }
  }
};
</script>
