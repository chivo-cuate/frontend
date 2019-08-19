<template>
  <v-container>
    <v-card tile>
      <v-card-title :class="`title ${$store.getters.getThemeColor} white--text`" primary-title>
        <v-icon class="white--text">mdi-account</v-icon>Elaboradores habilitados
      </v-card-title>

      <v-layout wrap text-center mt-8 pb-2>
        <v-flex
          v-for="(cook, cookIndex) in cooks"
          :key="`table-${cookIndex}`"
          class="animated fadeIn mr-5 ml-5 text-center"
        >
          <Cook :cook="cook" @showDlgFinish="setEditedCook($event)" />
        </v-flex>
      </v-layout>

      <YesNoDlg @yes="finishOrder()" @no="dlgFinish = false" :visible="dlgFinish" :width="350" :title="'Terminar orden'" :question="`Se dispone a dar por terminada la orden actual de ${editedCook.first_name} ${editedCook.last_name}, asociada a la mesa ${editedCook.current_order.table_number}.`" :chip="null" :processing="handlingOrder" />

      <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)" />

    </v-card>
  </v-container>
</template>

<script>
import Cook from "@/components/orders/Cook";
import YesNoDlg from "@/components/_dialogs/YesNoDlg";

export default {
  data() {
    return {
      editedCook: {current_order: {}},
      handlingOrder: false,
      dlgFinish: false,
    };
  },
  components: { Cook, YesNoDlg },
  props: ["cooks"],
  methods: {
    
    setEditedCook(event) {
      this.editedCook = event;
      this.dlgFinish = true;
    },

    finishOrder(event) {
      if (!this.handlingOrder) {
        this.handlingOrder = true;
        var config = {
          url: "ordenes/elaborar",
          snackbar: true,
          method: "post",
          params: {
            id: this.editedCook.current_order.id,
            cook_id: this.editedCook.id,
            table_number: this.editedCook.current_order.table_number,
            branch_id: this.$store.getters.getCurrBranch.id
          }
        };
        this.$refs.axios.submit(config);
      }
    },

    handleHttpResponse(event) {
      this.handlingOrder = false;
      var response = event.data.result.response;
      this.operationMessage = response.msg;
      this.operationMessageType = response.code;
      this.dlgFinish = false;
      if (response.code === "success") {
        this.$emit('setResponse', response);
      }
    },

  }
};
</script>

<style scoped>
.table-number-menu {
  border-radius: 0;
  bottom: 15px;
}
.v-icon {
  margin-left: 5px;
}
</style>
