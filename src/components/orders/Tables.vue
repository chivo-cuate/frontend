<template>
  <v-container>
    <v-card class="pb-7">
      <v-card-title
        :class="`title ${$store.getters.getThemeColor} white--text`"
        primary-title
      >Mesas disponibles</v-card-title>

      <v-layout wrap text-center mt-2>
        <v-flex
          v-for="(item, index) in tables"
          :key="`table-${index}`"
          class="animated fadeIn mt-5 mr-2 text-center"
        >
          <v-menu dark offset-y transition="fade-transition" bottom open-on-hover>
            <template v-slot:activator="{ on }">
              <v-flex class="text-center align-center">
                <v-btn text disabled>
                  <template v-if="item.ordersByCategory">
                    <v-badge
                      v-for="(badge, badgeIndex) in item.ordersByCategory"
                      :key="`badge-${badgeIndex}`"
                      :color="badge.badge_color"
                      overlap
                      class="animated slideInDown"
                      :style="`bottom: 32px; left: ${59 - (20 * badgeIndex)}px;`"
                    >
                      <template v-slot:badge>
                        <span>{{ badge.badge_icon }}</span>
                      </template>
                    </v-badge>
                  </template>
                  <v-img :src="require(`../../assets/img/table${item.status_id}.png`)" width="70px"></v-img>
                </v-btn>
              </v-flex>
              <v-flex mb-3>
                <v-chip v-on="on" class="table-number-menu">Mesa {{item.table_number}}</v-chip>
              </v-flex>
            </template>
            <v-list>
              <v-list-item class="dropdown-menu-item" @click="setEditedTable(item, index, 'add')">
                <v-icon>local_dining</v-icon>
                <span>Agregar orden</span>
              </v-list-item>

              <v-list-item
                class="dropdown-menu-item"
                v-if="item.status_id !== -1"
                @click="setEditedTable(item, index, 'edit')"
              >
                <v-icon>local_dining</v-icon>
                <span>Ver &oacute;rdenes</span>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-flex>
      </v-layout>

      <v-navigation-drawer
        v-model="drwOrders"
        absolute
        temporary
        :permanent="drwOrders"
        right
        bottom
      >
        <template v-if="drwOrders">
          <v-list-item class="grey">
            <v-list-item-content>
              <v-list-item-title
                class="uppercase"
              >&Oacute;rdenes - Mesa {{ editedTable.table_number }}</v-list-item-title>
            </v-list-item-content>
            <v-list-item-icon>
              <v-icon @click="drwOrders = false">close</v-icon>
            </v-list-item-icon>
          </v-list-item>

          <v-divider></v-divider>

          <v-list
            dense
            v-for="(ordersList, ordersListIndex) in editedOrdersByCategory"
            :key="`order-${ordersListIndex}`"
          >
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title :class="`uppercase ${ordersList.badge_color}--text`">
                  <v-icon
                    small
                    :class="`${ordersList.badge_color}--text`"
                  >{{ ordersList.list_icon }}</v-icon>
                  {{ ordersList.list_name }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              v-for="(order, orderIndex) in ordersList.orders"
              :key="`order-${orderIndex}`"
            >
              <v-list-item-content>
                <v-layout wrap>
                  <v-flex xs6>
                    <v-chip small>Orden #{{ orderIndex + 1 }}</v-chip>
                  </v-flex>
                  <v-flex xs2 v-if="order.attribs.edit">
                    <v-btn text x-small @click="showDlgEditOrder(ordersListIndex, orderIndex)">
                      <v-icon class="warning--text">edit</v-icon>
                    </v-btn>
                  </v-flex>
                  <v-flex xs2 v-if="order.attribs.delete">
                    <v-btn text x-small @click="showDlgCancelOrder(ordersListIndex, orderIndex)">
                      <v-icon class="error--text">delete</v-icon>
                    </v-btn>
                  </v-flex>
                  <v-flex v-if="order.attribs.close" xs2>
                    <v-btn text x-small>
                      <v-icon class="success--text">attach_money</v-icon>
                    </v-btn>
                  </v-flex>
                </v-layout>
              </v-list-item-content>
            </v-list-item>
            <v-divider></v-divider>
          </v-list>
        </template>
      </v-navigation-drawer>

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
                    <v-icon>mdi-food</v-icon>Nuevo producto
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
                      clearable
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
                      :readonly="editedAssetAux.finished === '1'"
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
              <span v-html="`${editedOrder.id ? 'Editar' : 'Agregar'}`"></span>
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
                    Se dispone a cancelar la orden # {{this.editedOrderIndex + 1}} de la mesa # {{editedTable.table_number}}.
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
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      handlingOrder: false,
      editedTable: {},
      editedTableIndex: -1,
      editedOrdersByCategory: [],
      editedOrdersListIndex: -1,
      editedOrder: {},
      editedOrderIndex: {},
      editedAssets: [],
      editedAsset: {},
      drwOrders: false,
      dlgTableOrder: false,
      dlgCheckout: false,
      dlgCancelOrder: false,
      validAssetForm: false,
      requiredRules: [v => !!v || "Dato obligatorio"],
      numberRules: [
        v => !!v || "Dato obligatorio",
        v => v > 0 || "Dato incorrecto"
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
    setEditedAssets() {
      this.editedAssets = [];
      this.editedOrder.assets.forEach(element => {
        element.price = this.getAssetById(element.asset_id).price;
        this.editedAssets.push(element);
      });
    },

    setEditedOrder(ordersListIndex, ordersIndex) {
      this.editedOrdersListIndex = ordersListIndex;
      this.editedOrderIndex = ordersIndex;
      let order = this.editedOrdersByCategory[ordersListIndex].orders[
        ordersIndex
      ];
      this.editedOrder = Object.assign({}, order);
    },

    showDlgEditOrder(ordersListIndex, ordersIndex) {
      this.setEditedOrder(ordersListIndex, ordersIndex);
      this.setEditedAssets();
      this.dlgTableOrder = true;
    },

    showDlgCancelOrder(ordersListIndex, ordersIndex) {
      this.setEditedOrder(ordersListIndex, ordersIndex);
      this.dlgCancelOrder = true;
    },

    setEditedTable(item, index, action, orderIndex = null) {
      this.editedTable = item;
      this.editedTableIndex = index;

      switch (action) {
        case "add":
          this.editedOrder = {};
          this.editedAssets = [];
          this.dlgTableOrder = true;
          break;
        case "edit":
          this.editedOrdersByCategory = this.editedTable.ordersByCategory;
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
          obj => obj.asset_id === this.editedAssets[i].asset_id && obj.finished === '0'
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
              id: this.editedOrder.id
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
            id: this.editedOrder.id,
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
        this.handlingOrder = false;
        this.dlgTableOrder = false;
        this.dlgCheckout = false;
        this.dlgCancelOrder = false;
        if (response.code === "success") {
          this.$emit("setResponse", response);
          this.$emit("playSound");
        }
        let action = event.url.substring(event.url.lastIndexOf("/") + 1);
        switch (action) {
          case "eliminar":
            this.editedOrdersByCategory[this.editedOrdersListIndex].orders.splice(
              this.editedOrderIndex,
              1
            );
            break;
          case "editar":
            this.editedOrdersByCategory[this.editedOrdersListIndex].orders[this.editedOrderIndex].assets = this.editedAssets;
            break;
          default:
            break;
        }
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
