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
          <v-toolbar-title class="success--text">{{ menuDate }}</v-toolbar-title>
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
                  <v-form @submit.prevent ref="form" v-model="validForm">
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
                        >
                          <template v-slot:item="data">
                            <v-list-item-content>
                              <v-list-item-title v-html="data.item.name"></v-list-item-title>
                              <v-list-item-subtitle
                                v-html="`Precio de entrada (u): $${data.item.price_in}`"
                              ></v-list-item-subtitle>
                            </v-list-item-content>
                          </template>
                        </v-autocomplete>
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
                        <v-text-field outlined v-model="editedItem.grams" label="Cantidad"></v-text-field>
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

    <v-card v-if="canEnableCooks" class="mt-3">
      <v-container>
        <v-layout wrap>
          <v-flex xs12 lg6 offset-lg2>
            <v-autocomplete
              chips
              outlined
              multiple
              :rules="requiredRules"
              v-model="menuCooks"
              :items="allCooks"
              item-text="full_name"
              item-value="id"
              label="Elaboradores para este menú"
              no-data-text="No hay resultados"
            ></v-autocomplete>
          </v-flex>
          <v-flex xs12 lg4>
            <v-btn
              @click="saveActiveCooks()"
              :disabled="updatingItem"
              x-large
              :class="`${$store.getters.getThemeColor} white--text`"
            >
              <v-icon v-if="!updatingItem" small>check</v-icon>
              <v-progress-circular
                v-else
                :size="15"
                :width="1"
                indeterminate
                :color="$store.getters.getThemeColor"
                class="v-icon"
              ></v-progress-circular>Actualizar
            </v-btn>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card>

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
      requiredRules: [v => !!v || "Dato obligatorio"],
      items: [],
      assets: [],
      updatingItem: false,
      deletingItem: false,
      headers: [
        { text: "Producto", value: "asset_name", align: "left" },
        { text: "Precio", value: "price", align: "left" },
        { text: "Cantidad", value: "grams", align: "left" },
        { text: "Acciones", value: "action", align: "left", sortable: false }
      ],
      measureUnits: [],
      menuCooks: [],
      allCooks: [],
      canEnableCooks: false
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Adicionar" : "Editar";
    },
    priceIn() {
      if (this.editedItem.asset_id) {
        let priceIn = null;
        this.assets.forEach(element => {
          if (element.id === this.editedItem.asset_id) {
            priceIn = element.price_in;
          }
        });
        return priceIn;
      }
    },
    priceHint() {
      if (this.priceIn) {
        let difference = this.editedItem.price - this.priceIn;
        return (difference > 0 ? "Ganacia: " : "Pérdida: ") + difference;
      }
      return "Seleccione un producto";
    },
    menuDate() {
      return this.items.length > 0 ? this.items[0].date : "No hay productos";
    }
  },
  mounted() {
    this.$store.getters.getBranchPermissions.forEach(element => {
      if (element.name === "Menú diario") {
        element.perms.forEach(perm => {
          if (perm.text === "Habilitar elaboradores") {
            this.canEnableCooks = true;
          }
        });
      }
    });
    this.getDataFromApi();
  },
  methods: {
    handleHttpResponse(event) {
      this.loadingItems = false;
      this.dlgUpdateItem = false;
      this.dlgDeleteItem = false;
      this.updatingItem = false;
      this.deletingItem = false;
      this.setScopeObjects(event);
    },

    setScopeObjects(event) {
      if (event.data.result.code === 200) {
        var response = event.data.result.response;
        this.items = response.data[0];
        this.assets = response.data[1];
        this.menuCooks = response.data[2];
        this.allCooks = response.data[3];
        console.log(this.assets)
      }
    },

    getDataFromApi() {
      this.loadingItems = true;
      var config = {
        url: "menu-diario/listar",
        params: {
          branch_id: this.$store.getters.getCurrBranchID
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
            branch_id: this.$store.getters.getCurrBranchID
          },
          snackbar: true
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
            cooks: this.menuCooks,
            branch_id: this.$store.getters.getCurrBranchID
          },
          snackbar: true
        };
        this.$refs.axios.submit(config);
      }
    },

    saveActiveCooks() {
      if (!this.updatingItem) {
        this.updatingItem = true;
        var config = {
          method: "post",
          url: "menu-diario/habilitar-elaboradores",
          params: {
            cooks: this.menuCooks,
            branch_id: this.$store.getters.getCurrBranchID
          },
          snackbar: true
        };
        this.$refs.axios.submit(config);
      }
    }
  }
};
</script>
