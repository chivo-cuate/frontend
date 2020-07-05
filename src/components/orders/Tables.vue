<template>
  <v-container>
    <TakeAwayOrders
      v-if="perms.canCreateOPL"
      :takeAwayOrders="takeAwayOrders"
      @showDlgMenu="showDlgMenu()"
      @setEditedTable="setEditedTable($event)"
    />

    <v-card tile v-if="perms.canCreateOPC">
      <v-card-title
        :class="`title ${$store.getters.getThemeColor} white--text`"
        primary-title
      >
        <v-icon class="white--text">local_dining</v-icon>Mesas disponibles
        <v-spacer></v-spacer>
        <v-btn text class="white--text" @click="showDlgMenu()"
          >Ver men&uacute;</v-btn
        >
      </v-card-title>

      <v-layout wrap text-center mt-8 pb-2>
        <v-flex
          v-for="(table, tableIndex) in tables"
          :key="`table-${tableIndex}`"
          class="animated fadeIn mr-5 ml-5 text-center"
        >
          <Table
            :table="table"
            :perms="perms"
            @setEditedTable="setEditedTable($event)"
          />
        </v-flex>
      </v-layout>

      <TableOrders
        :drwOrders="drwOrders"
        :editedTable="editedTable"
        :perms="perms"
        @close="closeDrwOrders()"
        @showYesNoDialog="showYesNoDialog($event)"
      />
    </v-card>

    <SimpleTableDlg
      @close="dlgViewMenu = false"
      :visible="dlgViewMenu"
      :width="700"
      :title="'Menú'"
      :headers="dailyMenuHeaders"
      :items="compDailyMenu"
    />

    <SimpleTableDlg
        @close="dlgViewOrder = false"
        :visible="dlgViewOrder"
        :width="500"
        :title="'Productos'"
        :headers="viewOrderHeaders"
        :items="compEditedAssetsInfo"
      />

      <YesNoDlg
        @yes="checkout()"
        @no="dlgCheckout = false"
        :visible="dlgCheckout"
        :width="500"
        :title="'Cerrar orden'"
        :question="
          `Se dispone a cerrar la cuenta # ${editedOrder.order_number} ${editedOrder.order_type_id === 1 ? `de la mesa ${editedOrder.table_number}` : `para llevar`} con un monto de:`
        "
        :chip="compOrderPrice"
        :processing="handlingOrder"
      />

      <YesNoDlg
        @yes="cancelOrder()"
        @no="dlgCancelOrder = false"
        :visible="dlgCancelOrder"
        :width="350"
        :title="'Cancelar orden'"
        :question="
          `Se dispone a cancelar la orden # ${editedOrder.order_number} ${editedOrder.order_type_id === 1 ? `de la mesa ${editedOrder.table_number}` : `para llevar`} con un monto de:`
        "
        :chip="compOrderPrice"
        :processing="handlingOrder"
      />

      <YesNoDlg
        @yes="serveProducts()"
        @no="dlgServeProducts = false"
        :visible="dlgServeProducts"
        :width="350"
        :title="'Servir productos'"
        :question="
          `Se dispone a servir los productos de la orden # ${this
            .editedOrderIndex + 1} de la mesa ${editedTable.table_number}.`
        "
        :chip="null"
        :processing="handlingOrder"
      />

    <v-dialog v-model="dlgEditOrder" width="500" persistent>
      <v-card>
        <v-card-title
          :class="`headline ${$store.getters.getThemeColor} white--text`"
          primary-title
          >Mesa {{ editedTable.table_number }}</v-card-title
        >
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap mb-3>
              <v-flex xs12>
                <v-btn
                  @click="addAsset()"
                  :disabled="editedAssetsLength > 0 && !validAssetForm"
                  :class="`${$store.getters.getThemeColor} white--text`"
                >
                  <v-icon>mdi-food</v-icon>Agregar
                </v-btn>
              </v-flex>
            </v-layout>
            <v-form @submit.prevent ref="form" v-model="validAssetForm">
              <v-layout
                wrap
                v-for="(editedAssetAux, assetIndex) in editedAssets"
                :key="`prod-${assetIndex}`"
              >
                <v-flex xs8 sm6>
                  <v-autocomplete
                    small-chips
                    style="max-height: 20px!important;"
                    :rules="requiredRules"
                    v-model="editedAssetAux.asset_id"
                    :readonly="editedAssetAux.finished === '1'"
                    :items="assets"
                    :item-color="$store.getters.getThemeColor"
                    item-text="name"
                    item-value="id"
                    label="Producto"
                    no-data-text="No hay resultados"
                    @change="removeDuplicateAssets()"
                  >
                    <template v-slot:item="data">
                      <v-list-item-content>
                        <v-list-item-title
                          v-html="data.item.name"
                        ></v-list-item-title>
                        <v-list-item-subtitle
                          v-html="
                            `Precio: $${data.item.price}` +
                              (data.item.grams
                                ? ` (${data.item.grams} gramos)`
                                : '')
                          "
                        ></v-list-item-subtitle>
                      </v-list-item-content>
                    </template>
                  </v-autocomplete>
                </v-flex>

                <v-flex xs4 sm2>
                  <v-text-field
                    :rules="numberRules"
                    :disabled="editedAssetAux.finished === '1'"
                    v-model="editedAssetAux.quantity"
                    label="Unidades"
                    type="number"
                  ></v-text-field>
                </v-flex>

                <v-flex xs4 sm2>
                  <v-text-field
                    readonly
                    :disabled="editedAssetAux.finished === '1'"
                    :value="
                      getAssetPriceById(
                        editedAssetAux.asset_id,
                        editedAssetAux.quantity
                      )
                    "
                    label="Precio"
                  ></v-text-field>
                </v-flex>

                <v-flex xs12 sm2>
                  <v-btn
                    width="100%"
                    class="error"
                    @click="removeAsset(assetIndex)"
                  >
                    <v-icon>delete</v-icon>
                  </v-btn>
                </v-flex>
              </v-layout>

              <v-layout wrap>
                <v-flex xs12>
                  <span>Total:</span>
                  <v-chip>
                    <v-icon left>attach_money</v-icon>
                    {{ compOrderPrice }}
                  </v-chip>
                </v-flex>
              </v-layout>
            </v-form>
          </v-container>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            :disabled="
              editedAssetsLength < 1 || !validAssetForm || handlingOrder
            "
            :color="$store.getters.getThemeColor"
            text
            @click="sendOrder()"
          >
            <v-progress-circular
              v-if="handlingOrder"
              :size="15"
              :width="1"
              indeterminate
              class="v-icon"
            ></v-progress-circular>
            <span v-html="`${editedOrder.id ? 'Editar' : 'Agregar'}`"></span>
          </v-btn>
          <v-btn color="error" text @click="dlgEditOrder = false"
            >Cancelar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)" />
  </v-container>
</template>

<script>
import Table from "@/components/orders/Table";
import TableOrders from "@/components/orders/TableOrders";
import SimpleTableDlg from "@/components/_dialogs/SimpleTableDlg";
import YesNoDlg from "@/components/_dialogs/YesNoDlg";
import TakeAwayOrders from "@/components/orders/TakeAwayOrders";

export default {
  data() {
    return {
      handlingOrder: false,
      editedTable: {},
      editedTableIndex: -1,
      editedOrders: [],
      editedOrdersListIndex: -1,
      editedOrder: {},
      editedOrderIndex: {},
      editedAssets: [],
      editedAsset: {},
      dailyMenu: [],
      drwOrders: false,
      dlgViewMenu: false,
      dlgViewOrder: false,
      dlgEditOrder: false,
      dlgCheckout: false,
      dlgCancelOrder: false,
      dlgServeProducts: false,
      validAssetForm: false,
      requiredRules: [v => !!v || "Dato obligatorio"],
      numberRules: [
        v => !!v || "Dato obligatorio",
        v => v > 0 || "Dato incorrecto"
      ],
      dailyMenuHeaders: [
        { text: "Categoría", value: "group" },
        { text: "Producto", value: "name" },
        { text: "Precio", value: "price" },
        { text: "Cantidad", value: "grams" }
      ],
      viewOrderHeaders: [
        { text: "Producto", value: "name" },
        { text: "Precio", value: "price" },
        { text: "Cantidad", value: "quantity" },
        { text: "Estado", value: "status" }
      ]
    };
  },
  components: { Table, TableOrders, SimpleTableDlg, YesNoDlg, TakeAwayOrders },
  props: ["tables", "takeAwayOrders", "assets", "perms"],
  mounted() {
    this.$root.$on("showYesNoDialog", event => {
      this.editedOrder = Object.assign({}, event.order);
      this.setEditedAssets();
      this.activateDlgFlag(event.action);
    });
  },
  watch: {
    editedOrders: function(newValue, oldValue) {
      if (!newValue) {
        this.drwOrders = false;
      }
    }
  },
  computed: {
    compEditedAssetsInfo() {
      let res = [];
      this.editedAssets.forEach(element => {
        res.push({
          name: this.getAssetById(element.asset_id).name,
          quantity: element.quantity,
          price: this.getAssetPriceById(element.asset_id, element.quantity),
          status: element.finished === "1" ? "Servido" : "Pendiente"
        });
      });
      res.push({
        name: "TOTAL",
        price: this.compOrderPrice
      });
      return res;
    },

    compDailyMenu() {
      let res = [];
      this.assets.forEach(element => {
        if (!(element.divider || element.header)) {
          res.push(element);
        }
      });
      return res;
    },

    compOrderPrice() {
      let res = 0;
      this.editedAssets.forEach(element => {
        res += this.getAssetPriceById(
          element.asset_id,
          parseInt(element.quantity)
        );
      });
      return res;
    },

    editedAssetsLength() {
      return this.editedAssets.length;
    }
  },
  methods: {
    closeDrwOrders() {
      this.drwOrders = false;
      this.editedOrders = [];
    },

    setEditedAssets() {
      this.editedAssets = [];
      this.editedOrder.assets.forEach(element => {
        element.price = this.getAssetById(element.asset_id).price;
        this.editedAssets.push(element);
      });
    },

    setEditedOrder(orderIndex) {
      this.editedOrderIndex = orderIndex;
      let order = this.editedOrders[orderIndex];
      this.editedOrder = Object.assign({}, order);
      this.setEditedAssets();
    },

    showDlgMenu() {
      this.dlgViewMenu = true;
    },

    showYesNoDialog(event) {
      this.setEditedOrder(event.orderIndex);
      this.activateDlgFlag(event.action);
    },

    activateDlgFlag(action) {
      switch (action) {
        case "dlgEditOrder":
          this.dlgEditOrder = true;
          break;
        case "dlgServeProducts":
          this.dlgServeProducts = true;
          break;
        case "dlgCheckout":
          this.dlgCheckout = true;
          break;
        case "dlgViewOrder":
          this.dlgViewOrder = true;
          break;
        case "dlgCancelOrder":
          this.dlgCancelOrder = true;
          break;
        default:
          break;
      }
    },

    setEditedTable(data) {
      this.editedTable = data.table;
      this.editedTableIndex = this.tables.indexOf(this.editedTable);

      switch (data.action) {
        case "add":
          this.editedOrder = {
            order_type_id: data.order_type
          };
          this.editedAssets = [];
          this.dlgEditOrder = true;
          break;
        case "view-orders":
          this.editedOrders = this.editedTable.orders;
          this.drwOrders = true;
          break;
        case "checkout":
          this.dlgCheckout = true;
          break;
        case "cancel":
          this.dlgCancelOrder = true;
          break;
      }
    },

    getAssetById(id) {
      let result = this.assets.find(obj => {
        return obj.id === id;
      });
      return result;
    },

    getAssetPriceById(id, quantity) {
      if (!id) {
        return 0;
      }
      let asset = this.getAssetById(id);
      return asset
        ? parseInt(asset.price) * (quantity ? parseInt(quantity) : 1)
        : 0;
    },

    removeAsset(index) {
      this.editedAssets.splice(index, 1);
      this.removeDuplicateAssets();
    },

    removeDuplicateAssets() {
      let res = [];
      for (let i = 0; i < this.editedAssetsLength; i++) {
        this.editedAssets[i].price = this.getAssetById(
          this.editedAssets[i].asset_id
        ).price;
        let index = res.findIndex(
          obj =>
            obj.asset_id === this.editedAssets[i].asset_id &&
            obj.finished === "0"
        );
        if (index >= 0) {
          res[index].quantity =
            parseInt(res[index].quantity) +
            parseInt(this.editedAssets[i].quantity);
        } else {
          res.push(this.editedAssets[i]);
        }
      }
      this.editedAssets = res;
    },

    addAsset() {
      this.removeDuplicateAssets();
      this.editedAsset = { quantity: 1, finished: "0" };
      this.editedAssets.push(this.editedAsset);
    },

    sendOrder() {
      this.removeDuplicateAssets();
      if (!this.handlingOrder) {
        this.handlingOrder = true;
        var config = {
          url: this.editedOrder.id ? "ordenes/editar" : "ordenes/crear",
          snackbar: true,
          method: "post",
          params: {
            item: {
              table_number: this.editedTable.table_number,
              id: this.editedOrder.id,
              order_type_id: this.editedOrder.order_type_id
            },
            assets: this.editedAssets,
            branch_id: this.$store.getters.getCurrBranchID
          }
        };
        this.$refs.axios.submit(config);
      }
    },

    cancelOrder() {
      if (!this.handlingOrder) {
        this.handlingOrder = true;
        var config = {
          url: "ordenes/eliminar",
          snackbar: true,
          method: "post",
          params: {
            id: this.editedOrder.id,
            table_number: this.editedTable.table_number,
            branch_id: this.$store.getters.getCurrBranchID
          }
        };
        this.$refs.axios.submit(config);
      }
    },

    serveProducts() {
      if (!this.handlingOrder) {
        this.handlingOrder = true;
        var config = {
          url: "ordenes/servir-productos",
          snackbar: true,
          method: "post",
          params: {
            id: this.editedOrder.id,
            table_number: this.editedTable.table_number,
            branch_id: this.$store.getters.getCurrBranchID
          }
        };
        this.$refs.axios.submit(config);
      }
    },

    checkout() {
      if (!this.handlingOrder) {
        this.handlingOrder = true;
        var config = {
          url: "ordenes/cerrar",
          snackbar: true,
          method: "post",
          params: {
            id: this.editedOrder.id,
            table_number: this.editedTable.table_number,
            branch_id: this.$store.getters.getCurrBranchID
          }
        };
        this.$refs.axios.submit(config);
      }
    },

    updateCurrTableAndOrders(response) {
      if (this.editedTableIndex > -1) {
        this.editedTable = response.data.tables[this.editedTableIndex];
        this.editedOrders = this.editedTable.orders;
      }
    },

    handleHttpResponse(event) {
      if (event.data.result.code === 200) {
        let response = event.data.result.response;
        this.handlingOrder = false;
        this.dlgEditOrder = false;
        this.dlgCheckout = false;
        this.dlgCancelOrder = false;
        this.dlgServeProducts = false;

        if (response.code === "success") {
          this.$emit("setResponse", response);
        }
        this.updateCurrTableAndOrders(response);
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
