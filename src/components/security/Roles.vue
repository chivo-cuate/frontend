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
          <v-toolbar-title class="success--text">ROLES</v-toolbar-title>
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
                @click="showAddDlg()"
              >
                <v-icon small>add</v-icon>Adicionar
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
                        <v-text-field
                          autofocus
                          @keyup.enter="save()"
                          :rules="requiredRules"
                          outlined
                          v-model="editedItem.name"
                          label="Nombre"
                        ></v-text-field>
                      </v-flex>
                    </v-layout>
                    <v-layout wrap>
                      <v-flex xs12>
                        <v-textarea outlined v-model="editedItem.description" label="Descripción"></v-textarea>
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
                <v-btn color="error" text @click="dlgUpdateItem = false">
                  <v-icon>close</v-icon>Cancelar
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="dlgPermissions" max-width="700px" persistent>
            <v-card>
              <v-card-title>
                <span class="headline">Permisos de {{ editedItem.name }}</span>
              </v-card-title>
              <v-card-text>
                <v-container grid-list-md>
                  <v-layout row wrap>
                    <v-expansion-panels>
                      <v-expansion-panel
                        v-for="(module, moduleIndex) in editedPermissions"
                        :key="`module-${moduleIndex}`"
                      >
                        <v-expansion-panel-header>{{ module.name }}</v-expansion-panel-header>
                        <v-expansion-panel-content>
                          <v-layout wrap>
                            <v-flex
                              sm6
                              v-for="(subModule, subModuleIndex) in module.subModules"
                              :key="`sad-${subModuleIndex}`"
                            >
                              <span v-html="subModule.name" class="success--text"></span>
                              <v-autocomplete
                                outlined
                                :items="subModule.perms"
                                v-model="subModule.active"
                                item-text="name"
                                item-value="id"
                                :menu-props="{ maxHeight: '400' }"
                                multiple
                              >
                                <template v-slot:selection="{ item, index }">
                                  <v-chip v-if="index === 0">
                                    <span>{{ item.name }}</span>
                                  </v-chip>
                                  <span
                                    v-if="index === 1"
                                    class="grey--text caption"
                                  >({{ subModule.active.length - 1 }} m&aacute;s)</span>
                                </template>
                              </v-autocomplete>
                            </v-flex>
                          </v-layout>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </v-layout>
                </v-container>
              </v-card-text>
              <v-card-actions class="mr-5">
                <v-spacer></v-spacer>
                <v-btn
                  :disabled="updatingItem"
                  :color="$store.getters.getThemeColor"
                  text
                  @click="savePermissions()"
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
                <v-btn color="error" text @click="dlgPermissions = false">
                  <v-icon>close</v-icon>Cancelar
                </v-btn>
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
                      <p>¿Seguro que desea eliminar el elemento {{ editedItem.name }}?</p>
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
                <v-btn color="error" text @click="dlgDeleteItem = false">
                  <v-icon>close</v-icon>Cancelar
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:item.action="{ item }">
        <template v-if="item.name !== 'Administrador del Sistema'">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-icon
                class="mr-2"
                :color="$store.getters.getThemeColor"
                @click="showEditDlg(item)"
                v-on="on"
              >edit</v-icon>
            </template>
            <span>Editar</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-icon :color="'success'" @click="showPermissionsDlg(item)" v-on="on">security</v-icon>
            </template>
            <span>Permisos</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-icon color="warning" @click="deleteItem(item)" v-on="on">delete</v-icon>
            </template>
            <span>Eliminar</span>
          </v-tooltip>
        </template>
      </template>
      <template v-slot:loading>
        <VProgress class="text-center" />
      </template>
      <template v-slot:no-data>No se han encontrado elementos.</template>
    </v-data-table>

    <!--<div class="text-center pt-2">
      <v-pagination v-model="page" :length="pageCount" :color="$store.getters.getThemeColor" next-icon="chevron_right" prev-icon="chevron_left" class="mt-2"></v-pagination>
      <v-flex lg2 offset-lg5>
      </v-flex>
    </div>-->

    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)" />
  </v-flex>
</template>

<script>
export default {
  data() {
    return {
      dlgUpdateItem: false,
      dlgDeleteItem: false,
      dlgPermissions: false,
      page: 1,
      pageCount: 0,
      loadingItems: true,
      editedIndex: -1,
      editedItem: {},
      managers: [],
      validForm: false,
      requiredRules: [v => !!v || "Dato obligatorio"],
      items: [],
      editedPermissions: [],
      updatingItem: false,
      headers: [
        { text: "Nombre", value: "name", align: "left" },
        { text: "Descripción", value: "description", align: "left" },
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
      if (event.data.result.code === 200) {
        var response = event.data.result.response;

        switch (event.url.substring(event.url.lastIndexOf("/") + 1)) {
          case "editar-permisos":
            this.dlgPermissions = false;
            this.updatingItem = false;
            if (response.code === "success") {
              this.items = response.data;
            }
            break;
          case "crear":
          case "editar":
          case "eliminar":
            this.dlgUpdateItem = false;
            this.dlgDeleteItem = false;
            this.updatingItem = false;
            if (response.code === "success") {
              this.items = response.data;
            }
            break;
          case "listar":
            this.items = response.data;
            break;
          default:
            break;
        }
      }
    },

    getDataFromApi() {
      this.loadingItems = true;
      var config = {
        url: "roles/listar",
        params: {}
      };
      this.$refs.axios.submit(config);
    },

    showEditDlg(item) {
      this.editedIndex = this.items.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dlgUpdateItem = true;
    },

    showAddDlg() {
      let item = {
        id: -1,
        name: null,
        description: null,
        manager_id: null,
        manager_name: null
      };
      this.editedIndex = -1;
      this.editedItem = Object.assign({}, item);
      this.dlgUpdateItem = true;
    },

    showPermissionsDlg(item) {
      this.editedIndex = this.items.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.editedPermissions = Object.assign({}, item.modules);
      this.dlgPermissions = true;
    },

    deleteItem(item) {
      this.editedIndex = this.items.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dlgDeleteItem = true;
    },

    remove() {
      if (!this.updatingItem) {
        this.updatingItem = true;
        var config = {
          method: "post",
          url: "roles/eliminar",
          params: {
            id: this.editedItem.id
          },
          snackbar: true,
        };
        this.$refs.axios.submit(config);
      }
    },

    save() {
      if (!this.updatingItem) {
        this.updatingItem = true;
        let config = {
          method: "post",
          url: this.editedItem.id === -1 ? "roles/crear" : "roles/editar",
          params: {
            item: this.editedItem
          },
          snackbar: true,
        };
        this.$refs.axios.submit(config);
      }
    },

    savePermissions() {
      if (!this.updatingItem) {
        this.updatingItem = true;
        let activePerms = [];

        for (let i in this.editedPermissions) {
          this.editedPermissions[i].subModules.forEach(element => {
            if (element.active.length > 0) {
              activePerms.push(element.active);
            }
          });
        }

        let config = {
          method: "post",
          url: "roles/editar-permisos",
          params: {
            id: this.editedItem.id,
            items: activePerms
          },
          snackbar: true,
        };
        this.$refs.axios.submit(config);
      }
    }
  }
};
</script>
