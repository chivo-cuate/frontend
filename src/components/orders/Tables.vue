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
                  <v-btn
                    color="primary"
                    :class="(item.free === 1 ? `${$store.getters.getThemeColor}` : 'red') + ' fa'"
                    text
                    v-on="on"
                  >
                    <span class="white--text">{{ item.table_number }}</span>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item
                    v-if="item.free === 1"
                    class="dropdown-menu-item"
                    link
                    @click="setEditedTable(item, index)"
                  >
                    <v-icon>local_dining</v-icon>
                    <span>Nueva orden</span>
                  </v-list-item>
                  <v-list-item v-else>
                    <v-icon>local_dining</v-icon>
                    <span>La atiende {{item.waiter}}</span>
                  </v-list-item>
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
            <v-form ref="form" v-model="validAssetForm">
              <v-layout wrap>
                <v-flex xs12 sm8>
                  <v-autocomplete
                    outlined
                    :rules="requiredRules"
                    v-model="editedProduct.asset_id"
                    :items="assets"
                    item-text="name"
                    item-value="id"
                    label="Producto"
                    no-data-text="No hay resultados"
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

                <v-flex xs12 sm2>
                  <v-text-field
                    :rules="requiredRules"
                    outlined
                    v-model="editedProduct.quantity"
                    label="Unidades"
                    type="number"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm2>
                  <v-btn
                    @click="addProduct()"
                    x-large
                    :disabled="!validAssetForm"
                    :color="$store.getters.getThemeColor"
                    class="white--text"
                  >
                    <v-icon>add</v-icon>
                  </v-btn>
                </v-flex>
              </v-layout>

              <v-layout wrap>
                <v-flex xs12>
                  <v-simple-table>
                    <thead>
                      <tr>
                        <th class="text-left">Producto</th>
                        <th class="text-left">Cantidad</th>
                        <th class="text-left">Precio</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in editedProducts" :key="item.name">
                        <td>{{ item.name }}</td>
                        <td>{{ item.quantity }}</td>
                        <td>{{ item.price }}</td>
                      </tr>
                      <tr>
                        <td><b>Total</b></td>
                        <td></td>
                        <td><v-chip>{{ calculateTotalPrice }}</v-chip></td>
                      </tr>
                    </tbody>
                  </v-simple-table>
                </v-flex>
              </v-layout>
            </v-form>
          </v-container>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :color="$store.getters.getThemeColor" text @click="dlgTableOrder = false">Aceptar</v-btn>
          <v-btn color="error" text @click="dlgTableOrder = false">Cancelar</v-btn>
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
      editedTable: {},
      editedTableIndex: -1,
      editedOrder: {},
      editedProducts: [],
      editedProduct: {},
      dlgTableOrder: false,
      validAssetForm: false,
      requiredRules: [v => !!v || "Dato obligatorio"],
      timer: null
    };
  },
  components: {},
  props: ["tables", "assets"],
  computed: {
    calculateTotalPrice() {
      let res = 0;
      this.editedProducts.forEach(element => {
        res += (parseInt(element.price) * parseInt(element.quantity));
      });
      return res;
    }
  },
  methods: {
    setEditedTable(item, index) {
      this.editedTable = item;
      this.editedTableIndex = index;
      this.dlgTableOrder = true;
    },

    getProductById(id) {
      let result = this.assets.find(obj => {
        return obj.id === id
      });
      return result;
    },

    addProduct() {
      let asset = this.getProductById(this.editedProduct.asset_id);
      this.editedProduct.name = asset.name;
      this.editedProduct.price = asset.price;
      this.editedProducts.push(this.editedProduct);
      this.editedProduct = {};
    },

    handleHttpResponse(event) {
      this.loading = false;

      if (event.data.result.code === 200) {
        var response = event.data.result.response;
        this.operationMessage = response.msg;
        this.operationMessageType = response.code;

        switch (event.url.substring(event.url.lastIndexOf("/") + 1)) {
          case "do-some":
            this.snackbar = true;
            this.approvingForm = false;
            this.approveDialog = false;
            if (response.code === "success") {
              this.items[this.formIndex].status = response.data;
              this.items[this.formIndex].filename = response.filename;
            }
            break;
          case "get-ingredients":
            const { sortBy, descending, page, rowsPerPage } = this.pagination;
            this.items = response.data;
            this.totalItems = response.data.length;
            break;
          default:
            this.snackbar = true;
            break;
        }
      } else {
        this.operationMessage = "Your request could not be executed.";
        this.operationMessageType = "error";
        this.snackbar = true;
      }
    }
  }
};
</script>

<style scoped>
</style>
