<template>
  <v-flex xs12>
    <v-data-table
      :headers="headers"
      :items="items"
      :page.sync="page"
      :items-per-page="10"
      :loading="loadingItems"
      :search="search"
      no-results-text="No hay resultados"
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
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Buscar"
            single-line
            hide-details
            :disabled="loadingItems"
            :clearable="true"
          ></v-text-field>

          <v-spacer></v-spacer>

          <v-dialog v-model="dlgUpdateItem" max-width="550px" persistent>
            <template v-slot:activator="{ on }">
              <v-btn
                :disabled="loadingItems || updatingItem"
                :color="$store.getters.getThemeColor"
                dark
                class="mb-2"
                v-on="on"
                @click="addItem()"
              >
                <v-icon small>add</v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="subtitle">{{ formTitle }}</span>
              </v-card-title>
              <v-card-text>
                <v-container grid-list-md>
                  <v-form @submit.prevent ref="form" v-model="validForm">
                    <v-layout wrap>
                      <v-flex xs12 sm8>
                        <v-autocomplete
                          outlined
                          :rules="requiredRules"
                          v-model="editedItem.asset_id"
                          :items="assets"
                          item-text="name"
                          item-value="id"
                          label="Recurso"
                          no-data-text="No hay resultados"
                        ></v-autocomplete>
                      </v-flex>
                      <v-flex xs12 sm4>
                        <v-text-field
                          :rules="requiredRules"
                          outlined
                          v-model="editedItem.quantity"
                          label="Cantidad"
                        ></v-text-field>
                      </v-flex>
                    </v-layout>
                    <v-layout wrap>
                      <v-flex xs12 sm8>
                        <v-autocomplete
                          outlined
                          :rules="requiredRules"
                          v-model="editedItem.measure_unit_id"
                          :items="measureUnits"
                          item-value="id"
                          item-text="name"
                          label="U/M"
                        ></v-autocomplete>
                      </v-flex>
                      <v-flex xs12 sm4>
                        <v-text-field
                          :rules="requiredRules"
                          outlined
                          v-model="editedItem.price_in"
                          label="Precio unitario"
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
                <span class="subtitle">Eliminar elemento</span>
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

    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)" />
  </v-flex>
</template>

<script>
export default {
  data() {
    return {
      search: "",
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
        { text: "Recurso", value: "asset_name", align: "left" },
        { text: "Cantidad", value: "quantity_desc", align: "left" },
        { text: "Precio ent", value: "price_in", align: "left" },
        { text: "Tipo", value: "type_name", align: "left" },
        { text: "Acciones", value: "action", align: "left", sortable: false }
      ],
      measureUnits: []
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Adicionar" : "Editar";
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

        switch (action) {
          case "crear":
          case "editar":
          case "eliminar":
            this.dlgUpdateItem = false;
            this.dlgDeleteItem = false;
            this.updatingItem = false;
            this.deletingItem = false;
            if (response.code === "success") {
              this.setScopeObjects(response);
            }
            break;
          case "listar":
            this.setScopeObjects(response);
            break;
          default:
            break;
        }
      } else {
        this.dlgUpdateItem = false;
        this.dlgDeleteItem = false;
        this.updatingItem = false;
        this.deletingItem = false;
      }
    },

    setScopeObjects(response) {
      this.items = response.data[0];
      this.assets = response.data[1];
      this.measureUnits = response.data[2];
    },

    getDataFromApi() {
      this.loadingItems = true;
      var config = {
        url: "almacen/listar",
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
        quantity: null,
        measure_unit_id: null,
        asset_id: null,
        price_in: null,
        branch_id: this.$store.getters.getCurrBranchID
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
          url: "almacen/eliminar",
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
          url: this.editedItem.id === -1 ? "almacen/crear" : "almacen/editar",
          params: {
            item: this.editedItem,
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
