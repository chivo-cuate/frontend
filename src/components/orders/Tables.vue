<template>
  <v-card class="pt-7 pb-7">
    <v-container>
      <v-layout wrap align-center justify-center text-center>
        <v-flex xs12>
          <span class="uppercase">Mesas disponibles</span>
        </v-flex>
        <v-flex xs12 class="animated fadeIn mt-2">
          <v-tooltip bottom v-for="(item, index) in tables" :key="`table-${index}`">
            <template v-slot:activator="{ on }">
              <v-menu offset-y transition="fade-transition" bottom open-on-hover>
                <template v-slot:activator="{ on }">
                  <v-btn color="primary" :class="getTableColor(item.status)" text v-on="on">
                    <span class="white--text">{{ item.table_number }}</span>
                  </v-btn>
                </template>
                <v-list>
                  <!--
                      -1: atendida por otro mesero
                       0: vacía
                       1: atendida por el mesero actual
                       2: elaborada y lista para cobrar
                  -->
                  <template v-if="item.status !== -1">
                    <v-list-item
                      :disabled="item.status === 2"
                      class="dropdown-menu-item"
                      link
                      @click="setEditedTable(item, index, 'edit')"
                    >
                      <v-icon>local_dining</v-icon>
                      <span>{{ item.status === 0 ? 'Nueva orden' : 'Editar orden' }}</span>
                    </v-list-item>

                    <v-list-item
                      :disabled="item.status !== 2"
                      class="dropdown-menu-item"
                      link
                      @click="setEditedTable(item, index, 'checkout')"
                    >
                      <v-icon>attach_money</v-icon>
                      <span>Cerrar cuenta</span>
                    </v-list-item>
                    <v-divider></v-divider>
                    <v-list-item
                      :disabled="item.status !== 1"
                      class="dropdown-menu-item"
                      link
                      @click="setEditedTable(item, index, 'cancel')"
                    >
                      <v-icon>close</v-icon>
                      <span>Cancelar orden</span>
                    </v-list-item>
                  </template>

                  <template v-else>
                    <v-list-item>
                      <v-icon>local_dining</v-icon>
                      <span>La atiende {{item.waiter}}</span>
                    </v-list-item>
                  </template>
                </v-list>
              </v-menu>
            </template>
          </v-tooltip>
        </v-flex>
      </v-layout>
    </v-container>

    <v-dialog v-model="dlgTableOrder" width="700" persistent>
      <v-card>
        <v-card-title
          class="headline grey lighten-2"
          primary-title
        >Mesa {{editedTable.table_number}}</v-card-title>

        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap mb-3>
              <v-flex xs12>
                <v-btn
                  @click="addAsset()"
                  :disabled="editedAssetsLength > 0 && !validAssetForm"
                  :class="`${$store.getters.getThemeColor} white--text`"
                >
                  <v-icon>add</v-icon>Nuevo producto
                </v-btn>
              </v-flex>
            </v-layout>
            <v-form ref="form" v-model="validAssetForm">
              <v-layout
                wrap
                v-for="(editedAssetAux, assetIndex) in editedAssets"
                :key="`prod-${assetIndex}`"
              >
                <v-flex xs8 sm6>
                  <v-autocomplete
                    small-chips
                    clearable
                    style="max-height: 20px!important;"
                    :rules="requiredRules"
                    v-model="editedAssetAux.asset_id"
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
                        <v-list-item-title v-html="data.item.name"></v-list-item-title>
                        <v-list-item-subtitle
                          v-html="`Precio: $${data.item.price}` + (data.item.grams ? ` (${data.item.grams} gramos)` : '')"
                        ></v-list-item-subtitle>
                      </v-list-item-content>
                    </template>
                  </v-autocomplete>
                </v-flex>

                <v-flex xs4 sm2>
                  <v-text-field
                    :rules="numberRules"
                    v-model="editedAssetAux.quantity"
                    label="Unidades"
                    type="number"
                  ></v-text-field>
                </v-flex>

                <v-flex xs4 sm2>
                  <v-text-field
                    readonly
                    :value="getAssetPriceById(editedAssetAux.asset_id, editedAssetAux.quantity)"
                    label="Precio"
                  ></v-text-field>
                </v-flex>

                <v-flex xs12 sm2>
                  <v-btn width="100%" class="error" @click="removeAsset(assetIndex)">Eliminar</v-btn>
                </v-flex>
              </v-layout>

              <v-layout wrap>
                <v-flex xs12>
                  <span>Total:</span>
                  <v-chip>
                    <v-icon left>attach_money</v-icon>
                    {{calculateTotalPrice}}
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
            :disabled="editedAssetsLength < 1 || !validAssetForm || handlingOrder"
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
            <span>Registrar orden</span>
          </v-btn>
          <v-btn color="error" text @click="dlgTableOrder = false">Cancelar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dlgCheckout" width="500" persistent>
      <v-card>
        <v-card-title
          class="headline grey lighten-2"
          primary-title
        >Mesa {{editedTable.table_number}}</v-card-title>

        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12>
                <v-card-text>Se dispone a cerrar la cuenta de la mesa # {{editedTable.table_number}} con un monto de:</v-card-text>
                <p class="text-center">
                  <v-chip class="error">
                    <v-icon color="white" medium left>attach_money</v-icon>
                    {{calculateTotalPrice}}
                  </v-chip>
                </p>
                <p class="text-center">¿Confirma que desea continuar?</p>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            :disabled="handlingOrder"
            :color="$store.getters.getThemeColor"
            text
            @click="checkout()"
          >
            <v-progress-circular
              v-if="handlingOrder"
              :size="15"
              :width="1"
              indeterminate
              class="v-icon"
            ></v-progress-circular>
            <span>Continuar</span>
          </v-btn>
          <v-btn color="error" text @click="dlgCheckout = false">Cancelar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dlgCancelOrder" width="500" persistent>
      <v-card>
        <v-card-title
          class="headline grey lighten-2"
          primary-title
        >Mesa {{editedTable.table_number}}</v-card-title>

        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12>
                <v-card-text class="text-center">
                  Se dispone a cancelar la orden de la mesa # {{editedTable.table_number}}.
                  <br />¿Confirma que desea continuar?
                </v-card-text>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            :disabled="handlingOrder"
            :color="$store.getters.getThemeColor"
            text
            @click="cancelOrder()"
          >
            <v-progress-circular
              v-if="handlingOrder"
              :size="15"
              :width="1"
              indeterminate
              class="v-icon"
            ></v-progress-circular>
            <span>Continuar</span>
          </v-btn>
          <v-btn color="error" text @click="dlgCancelOrder = false">Cancelar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)" />
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      handlingOrder: false,
      editedTable: {},
      editedTableIndex: -1,
      editedOrder: {},
      editedAssets: [],
      editedAsset: {},
      dlgTableOrder: false,
      dlgCheckout: false,
      dlgCancelOrder: false,
      validAssetForm: false,
      requiredRules: [v => !!v || "Dato obligatorio"],
      numberRules: [
        v => !!v || "Dato obligatorio",
        v => v > 0 || "Debe seleccionar al menos una unidad"
      ],
      timer: null
    };
  },
  components: {},
  props: ["tables", "assets"],
  computed: {
    calculateTotalPrice() {
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
    setEditedTable(item, index, action) {
      this.editedTable = item;
      this.editedTableIndex = index;
      this.editedOrder = item.order;
      this.editedAssets = item.assets;
      switch (action) {
        case "edit":
          this.dlgTableOrder = true;
          break;
        case "checkout":
          this.dlgCheckout = true;
          break;
        case "cancel":
          this.dlgCancelOrder = true;
          break;
      }
    },

    getTableColor(tableStatus) {
      switch (tableStatus) {
        case 0:
          return `${this.$store.getters.getThemeColor} fa`;
        case 1:
          return "warning fa";
        case -1:
          return "error fa";
        default:
          return "grey fa";
      }
    },

    getAssetById(id) {
      let result = this.assets.find(obj => {
        return obj.id === id;
      });
      return result;
    },

    getAssetPriceById(id, quantity) {
      let asset = this.getAssetById(id);
      return asset
        ? parseInt(asset.price) * (quantity ? parseInt(quantity) : 1)
        : 0;
    },

    removeAsset(index) {
      this.editedAssets.splice(index, 1);
      this.removeDuplicateAssets();
    },

    getEditedAssetIndexById(asset_id) {
      return this.editedAssets.findIndex(obj => obj.asset_id === asset_id);
    },

    removeDuplicateAssets() {
      let res = [];
      for (let i = 0; i < this.editedAssetsLength; i++) {
        this.editedAssets[i].price = this.getAssetById(
          this.editedAssets[i].asset_id
        ).price;
        let index = res.findIndex(
          obj => obj.asset_id === this.editedAssets[i].asset_id
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
      this.editedAsset = { quantity: 1 };
      this.editedAssets.push(this.editedAsset);
    },

    sendOrder() {
      this.removeDuplicateAssets();
      if (!this.handlingOrder) {
        this.handlingOrder = true;
        var config = {
          url: this.editedOrder ? "ordenes/editar" : "ordenes/crear",
          snackbar: true,
          method: "post",
          params: {
            item: {
              table_number: this.editedTable.table_number,
              id: this.editedTable.order ? this.editedTable.order.id : -1
            },
            assets: this.editedAssets,
            branch_id: this.$store.getters.getCurrBranch.id
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
            id: this.editedTable.order,
            table_number: this.editedTable.table_number,
            branch_id: this.$store.getters.getCurrBranch.id
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
            id: this.editedTable.order,
            table_number: this.editedTable.table_number,
            branch_id: this.$store.getters.getCurrBranch.id
          }
        };
        this.$refs.axios.submit(config);
      }
    },

    handleHttpResponse(event) {
      if (event.data.result.code === 200) {
        var response = event.data.result.response;

        switch (event.url.substring(event.url.lastIndexOf("/") + 1)) {
          case "editar":
          case "crear":
          case "eliminar":
          case "cerrar":
            this.handlingOrder = false;
            this.dlgTableOrder = false;
            this.dlgCheckout = false;
            this.dlgCancelOrder = false;
            if (response.code === "success") {
              this.$emit("setResponse", response);
              this.$emit("playSound");
            }
            break;
          default:
            break;
        }
      } else {
        this.handlingOrder = false;
        this.dlgTableOrder = false;
        this.dlgCheckout = false;
        this.dlgCancelOrder = false;
      }
    }
  }
};
</script>

<style scoped>
</style>
