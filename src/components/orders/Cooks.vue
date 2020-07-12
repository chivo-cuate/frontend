<template>
  <v-container>
    <v-card tile>
      <v-card-title :class="`title ${$store.getters.getThemeColor} white--text`" primary-title>
        <v-icon class="white--text">mdi-account</v-icon>Elaboradores seleccionados
        <v-spacer></v-spacer>
        <v-btn text @click="showdlgChooseCooks()">
          <v-icon color="white">mdi-account-switch</v-icon>
        </v-btn>
      </v-card-title>

      <v-layout wrap text-center mt-8>
        <v-flex
          v-for="(cook, cookIndex) in $store.getters.getChosenCooks"
          :key="`table-${cookIndex}`"
          class="animated fadeIn mr-5 ml-5 text-center"
        >
          <Cook :cook="cook" @showDlgFinish="setEditedCook($event)" />
        </v-flex>
      </v-layout>

      <v-dialog width="500" v-model="dlgChooseCooks" persistent>
        <v-card>
          <v-card-title class="subtitle grey lighten-2">Actualizar elaboradores</v-card-title>
          <v-container>
            <div>
              <v-checkbox
                v-for="cook in branchCooks"
                v-bind:key="cook.id"
                v-model="newChosenCooks"
                :label="cook.full_name"
                :value="cook"
              ></v-checkbox>
            </div>
          </v-container>
          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="setChosenCooks()" :color="$store.getters.getThemeColor" text>
              <span>Aceptar</span>
            </v-btn>
            <v-btn color="error" text @click="closeDlgChooseCooks()">Cancelar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <YesNoDlg
        @yes="finishOrder()"
        @no="dlgFinish = false"
        :visible="dlgFinish"
        :width="350"
        :title="'Terminar orden'"
        :question="
          `Se dispone a dar por terminada la orden actual de ${editedCook.full_name}.`
        "
        :chip="null"
        :processing="handlingOrder"
      />

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
      editedCook: { current_order: {} },
      handlingOrder: false,
      dlgFinish: false,
      dlgChooseCooks: false,
      branchCooks: [],
      newChosenCooks: []
    };
  },
  components: { Cook, YesNoDlg },
  mounted() {
    this.branchCooks = this.$store.getters.getCooks[
      this.$store.getters.getCurrBranchID
    ];
  },
  methods: {
    showdlgChooseCooks() {
      //this.newChosenCooks = this.$store.getters.getChosenCooks;
      this.newChosenCooks = []
      this.dlgChooseCooks = true
      this.$emit("disableTimer")
    },

    closeDlgChooseCooks() {
      this.dlgChooseCooks = false
      this.$emit("enableTimer")
    },

    setChosenCooks() {
      this.$emit("setChosenCooks", this.newChosenCooks)
      this.dlgChooseCooks = false
    },

    setEditedCook(event) {
      this.editedCook = event
      this.dlgFinish = true
    },

    finishOrder(event) {
      if (!this.handlingOrder) {
        this.handlingOrder = true
        var config = {
          url: "ordenes/elaborar",
          snackbar: true,
          method: "post",
          params: {
            id: this.editedCook.current_order.id,
            cook_id: this.editedCook.id,
            cooks: this.$store.getters.getChosenCooksIDs.join(),
            table_number: this.editedCook.current_order.table_number,
            branch_id: this.$store.getters.getCurrBranchID
          }
        }
        this.$refs.axios.submit(config)
      }
    },

    handleHttpResponse(event) {
      this.handlingOrder = false
      var response = event.data.result.response
      this.operationMessage = response.msg
      this.operationMessageType = response.code
      this.dlgFinish = false
      if (response.code === "success") {
        this.$emit("setResponse", response)
      }
    }
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
