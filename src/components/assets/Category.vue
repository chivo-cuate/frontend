<template>
  <v-flex xs12>
    <v-data-table
      :headers="headers"
      :items="items"
      :search="search"
      :page.sync="page"
      :items-per-page="10"
      :loading="loadingItems"
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
          ></v-text-field>

          <v-spacer></v-spacer>

          <v-dialog v-model="dlgUpdateItem" max-width="500px" persistent>
            <template v-slot:activator="{ on }">
              <v-btn
                small
                :disabled="loadingItems || updatingItem"
                :color="$store.getters.getThemeColor"
                dark
                class="mb-2"
                v-on="on"
                @click="showDlgAddEdit(null)"
              >
                <v-icon small class="ml-1">add</v-icon>
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
                      <v-flex xs12>
                        <v-text-field
                          :rules="requiredRules"
                          outlined
                          v-model="editedItem.name"
                          label="Nombre"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12>
                        <v-autocomplete
                          outlined
                          :rules="requiredRules"
                          v-model="editedItem.measure_unit_type_id"
                          :items="measureUnitTypes"
                          item-text="name"
                          item-value="id"
                          label="Se mide en"
                          no-data-text="No hay resultados"
                        ></v-autocomplete>
                      </v-flex>
                    </v-layout>
                    <v-layout wrap>
                      <v-flex xs12>
                        <v-checkbox v-model="editedItem.needs_cooking" label="Se elabora"></v-checkbox>
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

          <v-dialog v-model="dlgDeleteItem" max-width="400px" persistent>
            <v-card>
              <v-card-title>
                <span class="subtitle">Eliminar elemento</span>
              </v-card-title>
              <v-card-text>
                <v-container grid-list-md>
                  <v-layout wrap>
                    <v-flex xs12>
                      <p>¿Seguro que desea eliminar el elemento {{ editedItem.name }}?</p>
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

          <v-dialog v-model="dlgIngredients" max-width="700px" persistent>
            <v-card>
              <v-card-text>
                <v-container grid-list-md>
                  <v-layout wrap>
                    <v-flex xs12>
                      <v-data-table
                        :items="editedIngredients"
                        :headers="ingredientsHeaders"
                        class="elevation-1"
                        :items-per-page="5"
                        :footer-props="{
                          itemsPerPageText: 'Elementos por página',
                          showFirstLastPage: false
                        }"
                        item-key="index"
                      >
                        <template v-slot:top>
                          <v-toolbar flat color="white">
                            <v-toolbar-title class="success--text">Ingredientes</v-toolbar-title>
                            <v-divider class="mx-4" inset vertical></v-divider>
                            <v-spacer></v-spacer>

                            <v-dialog v-model="dlgEditIngredient" max-width="350px" persistent>
                              <template v-slot:activator="{ on }">
                                <v-btn
                                  @click="showDlgEditIngredient(null)"
                                  color="success"
                                  dark
                                  class="mb-2"
                                  v-on="on"
                                >Adicionar</v-btn>
                              </template>
                              <v-card>
                                <v-card-title>
                                  <span
                                    class="subtitle"
                                  >{{ `${editedIngredientIndex >= 0 ? 'Editar' : 'Adicionar'} ingrediente` }}</span>
                                </v-card-title>
                                <v-card-text>
                                  <v-container>
                                    <v-form
                                      @submit.prevent
                                      ref="ingredientForm"
                                      v-model="validIngredientForm"
                                    >
                                      <v-layout wrap>
                                        <v-flex xs12>
                                          <v-autocomplete
                                            outlined
                                            :rules="requiredRules"
                                            v-model="editedIngredient.component_id"
                                            :items="ingredients"
                                            item-value="id"
                                            item-text="name"
                                            label="Ingrediente"
                                            no-data-text="No hay resultados"
                                          ></v-autocomplete>
                                        </v-flex>
                                      </v-layout>
                                      <v-layout>
                                        <v-flex xs12 sm6>
                                          <v-text-field
                                            outlined
                                            :rules="numberRules"
                                            v-model="editedIngredient.quantity"
                                            label="Cantidad"
                                            type="number"
                                          ></v-text-field>
                                        </v-flex>
                                        <v-flex xs12 sm6>
                                          <v-autocomplete
                                            outlined
                                            :rules="requiredRules"
                                            v-model="editedIngredient.measure_unit_id"
                                            :items="measureUnitTypes"
                                            item-value="id"
                                            item-text="name"
                                            label="U/M"
                                            no-data-text="No hay resultados"
                                          ></v-autocomplete>
                                        </v-flex>
                                      </v-layout>
                                    </v-form>
                                  </v-container>
                                </v-card-text>

                                <v-card-actions>
                                  <v-spacer></v-spacer>
                                  <v-btn
                                    :disabled="!validIngredientForm"
                                    color="green darken-1"
                                    text
                                    @click="saveIngredient()"
                                  >Aceptar</v-btn>
                                  <v-btn
                                    color="red darken-1"
                                    text
                                    @click="dlgEditIngredient = false"
                                  >Cancelar</v-btn>
                                </v-card-actions>
                              </v-card>
                            </v-dialog>
                          </v-toolbar>
                        </template>
                        <template v-slot:item.action="{ item }">
                          <v-icon
                            :color="$store.getters.getThemeColor"
                            class="mr-2"
                            @click="showDlgEditIngredient(item)"
                          >edit</v-icon>
                          <v-icon color="warning" @click="removeIngredient(item)">delete</v-icon>
                        </template>
                        <template v-slot:no-data>
                          <v-card-text class="text-center">No hay elementos para mostrar</v-card-text>
                        </template>
                      </v-data-table>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>
              <v-card-actions class="mr-5">
                <v-spacer></v-spacer>
                <v-btn
                  :disabled="updatingItem"
                  :color="$store.getters.getThemeColor"
                  text
                  @click="updateIngredients()"
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
                <v-btn color="error" text @click="dlgIngredients = false">Cancelar</v-btn>
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
              @click="showDlgAddEdit(item)"
              v-on="on"
            >edit</v-icon>
          </template>
          <span>Editar</span>
        </v-tooltip>

        <v-tooltip bottom v-if="apiUrl === 'productos' && item.category_needs_cooking">
          <template v-slot:activator="{ on }">
            <v-icon color="info" @click="showDlgIngredients(item)" v-on="on">local_library</v-icon>
          </template>
          <span>Ingredientes</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-icon color="warning" @click="showDlgDelete(item)" v-on="on">delete</v-icon>
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
      validIngredientForm: false,
      dlgUpdateItem: false,
      dlgDeleteItem: false,
      dlgIngredients: false,
      dlgEditIngredient: false,
      page: 1,
      pageCount: 0,
      loadingItems: true,
      editedIndex: -1,
      editedItem: {},
      editedIngredients: [],
      editedIngredientIndex: -1,
      editedIngredient: {},
      validForm: false,
      search: "",
      requiredRules: [v => !!v || "Dato obligatorio"],
      numberRules: [
        v => !!v || "Dato obligatorio",
        v => v > 0 || "Dato incorrecto"
      ],
      items: [],
      ingredients: [],
      categories: [],
      measureUnitTypes: [],
      updatingItem: false,
      deletingItem: false,
      headers: [
        { text: "Nombre", value: "name", align: "left" },
        { text: "Se mide en", value: "measure_unit_type", align: "left" },
        { text: "Se elabora", value: "needs_cooking_desc", align: "left" },
        { text: "Acciones", value: "action", align: "left", sortable: false }
      ]
    };
  },
  props: ["apiUrl"],
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Adicionar" : "Editar";
    }
  },
  mounted() {
    this.getDataFromApi();
  },
  watch: {
    $route(to, from) {
      this.getDataFromApi();
    }
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
              this.updateScopeObjects(response);
            }
            break;
          case "listar":
            this.updateScopeObjects(response);
            break;
          case "editar-ingredientes":
            this.dlgIngredients = false;
            this.updatingItem = false;
            if (response.code === "success") {
              this.updateScopeObjects(response);
            }
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

    updateScopeObjects(response) {
      this.items = response.data[0];
      this.measureUnitTypes = response.data[1];
    },

    getDataFromApi() {
      this.loadingItems = true;
      this.items = [];
      var config = {
        url: `${this.apiUrl}/listar`,
        params: {}
      };
      this.$refs.axios.submit(config);
    },

    showDlgIngredients(item) {
      this.editedIndex = this.items.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.editedIngredients = this.editedItem.components.slice();
      this.dlgIngredients = true;
    },

    showDlgAddEdit(item) {
      if (item) {
        this.editedIndex = this.items.indexOf(item);
        this.editedItem = Object.assign({}, item);
      } else {
        this.editedIndex = -1;
        this.editedItem = Object.assign(
          {},
          {
            id: -1,
            name: null
          }
        );
      }
      this.dlgUpdateItem = true;
    },

    showDlgDelete(item) {
      this.editedIndex = this.items.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dlgDeleteItem = true;
    },

    remove() {
      if (!this.deletingItem) {
        this.deletingItem = true;
        var config = {
          method: "post",
          url: `${this.apiUrl}/eliminar`,
          params: {
            id: this.editedItem.id
          },
          snackbar: true
        };
        this.$refs.axios.submit(config);
      }
    },

    save() {
      if (!this.updatingItem) {
        this.updatingItem = true;
        this.editedItem.needs_cooking = this.editedItem.needs_cooking ? 1 : 0;

        var config = {
          method: "post",
          url:
            this.editedItem.id === -1
              ? `${this.apiUrl}/crear`
              : `${this.apiUrl}/editar`,
          params: {
            item: this.editedItem
          },
          snackbar: true
        };

        this.$refs.axios.submit(config);
      }
    },

    updateIngredients() {
      if (!this.updatingItem) {
        this.updatingItem = true;
        var config = {
          method: "post",
          url: `${this.apiUrl}/editar-ingredientes`,
          params: {
            id: this.editedItem.id,
            ingredients: this.editedIngredients
          },
          snackbar: true
        };
        this.$refs.axios.submit(config);
      }
    },

    showDlgEditIngredient(item) {
      if (item) {
        this.editedIngredientIndex = this.editedIngredients.indexOf(item);
        this.editedIngredient = Object.assign({}, item);
      } else {
        this.editedIngredientIndex = -1;
        this.editedIngredient = {
          measure_unit_name: null,
          name: null
        };
      }
      this.dlgEditIngredient = true;
    },

    removeIngredient(item) {
      this.editedIngredientIndex = this.editedIngredients.indexOf(item);
      this.editedIngredients.splice(this.editedIngredientIndex, 1);
    },

    getMeasureUnitById(itemId) {
      return this.measureUnitTypes.find(obj => obj.id === itemId);
    }
  }
};
</script>
