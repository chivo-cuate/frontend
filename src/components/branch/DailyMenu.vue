<template>
  <v-flex xs12>
    <v-data-table
      :headers="headers"
      :items="items"
      :page.sync="page"
      :items-per-page="10"
      :loading="loadingItems"
      :footer-props="{
        itemsPerPageText: 'Elementos por página',
        itemsPerPageOptions: [
          {value: 5, text: '5'},
          {value: 10, text: '10'},
          {value: 20, text: '20'},
          {value: 9999999999, text: 'Todos'},
        ],
        showFirstLastPage: false
    }"
      class="elevation-1"
      @page-count="pageCount = $event"
      item-key="name"
    >
      <template v-slot:top>
        <v-toolbar flat color="white">
          <v-toolbar-title class="success--text">MENU DIARIO</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>

          <v-dialog v-model="dlgUpdateItem" max-width="400px" persistent>
            <template v-slot:activator="{ on }">
              <v-btn
                :disabled="loadingItems || updatingItem"
                :color="$store.getters.getThemeColor"
                dark
                class="mb-2"
                v-on="on"
                @click="addItem()"
              >
                <v-icon small>add</v-icon>Adicionar producto
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="headline">{{ formTitle }}</span>
              </v-card-title>
              <v-card-text>
                <v-container grid-list-md>
                  <v-form ref="form" v-model="validForm">
                    <v-layout wrap>
                      <v-flex xs12>
                        <v-autocomplete
                          outlined
                          :rules="requiredRules"
                          v-model="editedItem.asset_id"
                          :items="assets"
                          item-text="name"
                          item-value="id"
                          label="Producto"
                          no-data-text="No hay resultados"
                        ></v-autocomplete>
                      </v-flex>
                    </v-layout>
                    <v-layout wrap>
                      <v-flex xs12 md6>
                        <v-text-field
                          :rules="requiredRules"
                          outlined
                          v-model="editedItem.price"
                          label="Precio"
                          :hint="priceHint"
                          persistent-hint
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 md6>
                        <v-text-field
                          :rules="requiredRules"
                          outlined
                          v-model="editedItem.grams"
                          label="Gramos"
                        ></v-text-field>
                      </v-flex>
                    </v-layout>
                  </v-form>
                </v-container>
              </v-card-text>
              <v-card-actions class="mr-5">
                <v-spacer></v-spacer>
                <v-btn
                  :disabled="!validForm || updatingItem"
                  :color="$store.getters.getThemeColor"
                  text
                  @click="save()"
                >
                  <v-icon v-if="!updatingItem" small>check</v-icon>
                  <v-progress-circular
                    v-else
                    :size="15"
                    :width="1"
                    indeterminate
                    :color="$store.getters.getThemeColor"
                    class="v-icon"
                  ></v-progress-circular>
                  <span>Aceptar</span>
                </v-btn>
                <v-btn color="error" text @click="dlgUpdateItem = false">Cancelar</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="dlgDeleteItem" max-width="300px" persistent>
            <v-card>
              <v-card-title>
                <span class="headline">Eliminar elemento</span>
              </v-card-title>
              <v-card-text>
                <v-container grid-list-md>
                  <v-layout wrap>
                    <v-flex xs12>
                      <p>
                        ¿Seguro que desea eliminar
                        <b>{{ editedItem.asset_name }}</b>?
                      </p>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>
              <v-card-actions class="mr-5">
                <v-spacer></v-spacer>
                <v-btn
                  :disabled="deletingItem"
                  :color="$store.getters.getThemeColor"
                  text
                  @click="remove()"
                >
                  <v-icon v-if="!updatingItem" small>check</v-icon>
                  <v-progress-circular
                    v-else
                    :size="15"
                    :width="1"
                    indeterminate
                    :color="$store.getters.getThemeColor"
                    class="v-icon"
                  ></v-progress-circular>
                  <span>Aceptar</span>
                </v-btn>
                <v-btn color="error" text @click="dlgDeleteItem = false">Cancelar</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:item.action="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-icon
              class="mr-2"
              :color="$store.getters.getThemeColor"
              @click="editItem(item)"
              v-on="on"
            >edit</v-icon>
          </template>
          <span>Editar</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-icon color="warning" @click="deleteItem(item)" v-on="on">delete</v-icon>
          </template>
          <span>Eliminar</span>
        </v-tooltip>
      </template>
      <template v-slot:loading>
        <VProgress class="text-center" />
      </template>
      <template v-slot:no-data>No se han encontrado elementos.</template>
    </v-data-table>

    <v-snackbar
      :timeout="5000"
      :bottom="true"
      :right="true"
      :absolute="true"
      v-model="snackbar"
      :color="operationMessageType"
    >
      <v-icon small class="white--text">info</v-icon>
      {{ operationMessage }}
      <v-btn text @click="snackbar = false">
        <v-icon small>close</v-icon>
      </v-btn>
    </v-snackbar>

    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)" />
  </v-flex>
</template>

<script>
export default {
  data() {
    return {
      dlgUpdateItem: false,
      dlgDeleteItem: false,
      page: 1,
      pageCount: 0,
      loadingItems: true,
      editedIndex: -1,
      editedItem: {},
      validForm: false,
      requiredRules: [v => !!v || "Este dato es obligatorio"],
      items: [],
      assets: [],
      updatingItem: false,
      deletingItem: false,
      operationMessage: "",
      operationMessageType: "error",
      snackbar: false,
      headers: [
        { text: "Activo desde", value: "date", align: "left" },
        { text: "Producto", value: "asset_name", align: "left" },
        { text: "Precio", value: "price", align: "left" },
        { text: "Gramos", value: "grams", align: "left" },
        { text: "Acciones", value: "action", align: "left", sortable: false }
      ],
      measureUnits: []
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Adicionar" : "Editar";
    },
    priceHint() {
      if (this.editedItem.asset_id) {
        let priceIn = 0;
        this.assets.forEach(element => {
          if (element.id === this.editedItem.asset_id) {
            priceIn = element.price_in;
          }
        });
        let difference = this.editedItem.price - priceIn
        return (difference > 0 ? 'Ganacia: ': 'Pérdida: ') + difference;
      }
      return 'Seleccione un producto';
    }
  },
  mounted() {
    this.getDataFromApi();
  },
  methods: {
    handleHttpResponse(event) {
      this.loadingItems = false;
      let action = event.url.substring(event.url.lastIndexOf("/") + 1);

      if (event.data.result.code === 200) {
        var response = event.data.result.response;
        this.operationMessage = response.msg;
        this.operationMessageType = response.code;

        switch (action) {
          case "crear":
          case "editar":
          case "eliminar":
            this.snackbar = true;
            this.dlgUpdateItem = false;
            this.dlgDeleteItem = false;
            this.updatingItem = false;
            this.deletingItem = false;
            if (response.code === "success") {
              this.items = response.data[0];
              this.assets = response.data[1];
            }
            break;
          case "listar":
            this.items = response.data[0];
            this.assets = response.data[1];
            break;
          default:
            this.snackbar = true;
            break;
        }
      } else {
        this.operationMessage =
          event.data.result.response.response.data.message;
        this.operationMessageType = "error";
        this.snackbar = true;
        this.dlgUpdateItem = false;
        this.dlgDeleteItem = false;
        this.updatingItem = false;
        this.deletingItem = false;
      }
    },

    getDataFromApi() {
      this.loadingItems = true;
      var config = {
        url: "menu-diario/listar",
        params: {
          branch_id: this.$store.getters.getCurrBranch.id
        }
      };
      this.$refs.axios.submit(config);
    },

    editItem(item) {
      this.editedIndex = this.items.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dlgUpdateItem = true;
    },

    addItem() {
      let item = {
        id: -1,
        asset_id: null,
        price: null,
        grams: null
      };
      this.editedItem = Object.assign({}, item);
      this.dlgUpdateItem = true;
    },

    deleteItem(item) {
      this.editedIndex = this.items.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dlgDeleteItem = true;
    },

    remove() {
      if (!this.deletingItem) {
        this.deletingItem = true;
        var config = {
          method: "post",
          url: "menu-diario/eliminar",
          params: {
            id: this.editedItem.id,
            branch_id: this.$store.getters.getCurrBranch.id
          }
        };
        this.$refs.axios.submit(config);
      }
    },

    save() {
      if (!this.updatingItem) {
        this.updatingItem = true;
        var config = {
          method: "post",
          url:
            this.editedItem.id === -1
              ? "menu-diario/crear"
              : "menu-diario/editar",
          params: {
            item: this.editedItem,
            branch_id: this.$store.getters.getCurrBranch.id
          }
        };
        this.$refs.axios.submit(config);
      }
    }
  }
};
</script>
