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

          <v-dialog v-model="dlgUpdateItem" max-width="500px" persistent>
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
                      <v-flex xs12 sm6>
                        <v-text-field
                          :autofocus="true"
                          @keyup.enter="save()"
                          :rules="requiredRules"
                          outlined
                          v-model="editedItem.name"
                          label="Nombre"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm6>
                        <v-text-field
                          type="number"
                          :rules="numberRules"
                          outlined
                          v-model="editedItem.tables"
                          label="Mesas"
                        ></v-text-field>
                      </v-flex>
                    </v-layout>
                    <v-layout wrap>
                      <v-flex xs12>
                        <v-textarea outlined v-model="editedItem.description" label="Descripción"></v-textarea>
                      </v-flex>
                    </v-layout>
                    <v-layout wrap>
                      <v-flex xs12>
                        <v-autocomplete
                          outlined
                          clearable
                          v-model="editedItem.manager_id"
                          :items="managers"
                          item-text="username"
                          item-value="id"
                          label="Gerente"
                          no-data-text="No hay resultados"
                        ></v-autocomplete>
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

          <v-dialog v-model="dlgDeleteItem" max-width="500px" persistent>
            <v-card>
              <v-card-title>
                <span class="subtitle">Eliminar elemento</span>
              </v-card-title>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex xs12>
                    <v-card-text class="error uppercase white--text">Advertencia</v-card-text>
                    <v-card-text class="error--text">Se dispone a eliminar una sucursal completa.<br/>De continuar, perder&aacute; todos los registros de las operaciones realizadas en <v-chip small>{{ editedItem.name }}</v-chip>.</v-card-text>
                  </v-flex>
                </v-layout>
              </v-container>
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
      dlgUpdateItem: false,
      search: "",
      dlgDeleteItem: false,
      page: 1,
      pageCount: 0,
      loadingItems: true,
      editedIndex: -1,
      editedItem: {},
      managers: [],
      validForm: false,
      requiredRules: [v => !!v || "Dato obligatorio"],
      numberRules: [
        v => !!v || "Dato obligatorio",
        v => v > 0 || "Dato incorrecto"
      ],
      items: [],
      updatingItem: false,
      deletingItem: false,
      headers: [
        { text: "Nombre", value: "name", align: "left" },
        { text: "Mesas", value: "tables", align: "left" },
        { text: "Gerente", value: "manager_name", align: "left" },
        { text: "Acciones", value: "action", align: "left", sortable: false }
      ]
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
              this.items = response.data.items;
              this.managers = response.data.managers;
            }
            break;
          case "listar":
            this.items = response.data.items;
            this.managers = response.data.managers;
            break;
          default:
            break;
        }
      } else {
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
        url: "sucursales/listar",
        params: {}
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
        name: null,
        description: null,
        manager_id: null,
        manager_name: null
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
          url: "sucursales/eliminar",
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
        var config = {
          method: "post",
          url:
            this.editedItem.id === -1
              ? "sucursales/crear"
              : "sucursales/editar",
          params: {
            item: this.editedItem
          },
          snackbar: true
        };
        this.$refs.axios.submit(config);
      }
    }
  }
};
</script>
