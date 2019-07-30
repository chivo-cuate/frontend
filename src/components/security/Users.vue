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
          <v-toolbar-title class="success--text uppercase">Usuarios</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>

          <v-dialog v-model="dlgUpdateItem" max-width="500px" persistent>
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
                  <v-form ref="form" v-model="validForm">
                    <v-layout wrap>
                      <v-flex xs12>
                        <v-text-field
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

          <v-dialog v-model="dlgRoles" max-width="500px" persistent>
            <v-card>
              <v-card-title>
                <span class="headline">Roles de {{ editedItem.username }}</span>
              </v-card-title>
              <v-card-text>
                <v-container grid-list-md>
                  <v-layout row wrap>
                    <v-select
                      outlined
                      :items="roles"
                      v-model="editedRoles"
                      item-text="name"
                      item-value="id"
                      :menu-props="{ maxHeight: '400' }"
                      multiple
                    ></v-select>
                  </v-layout>
                </v-container>
              </v-card-text>
              <v-card-actions class="mr-5">
                <v-spacer></v-spacer>
                <v-btn
                  :disabled="deletingItem"
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
                <v-btn color="error" text @click="dlgRoles = false">
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
                      <p>¿Seguro que desea eliminar el elemento {{ editedItem.username }}?</p>
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
              <v-icon :color="'success'" @click="showRolesDlg(item)" v-on="on">assignment_ind</v-icon>
            </template>
            <span>Roles</span>
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
      dlgRoles: false,
      page: 1,
      pageCount: 0,
      loadingItems: true,
      editedIndex: -1,
      editedItem: {},
      roles: [],
      validForm: false,
      requiredRules: [v => !!v || "Este dato es obligatorio"],
      items: [],
      editedRoles: [],
      updatingItem: false,
      deletingItem: false,
      operationMessage: "",
      operationMessageType: "error",
      snackbar: false,
      headers: [
        { text: "Nombre", value: "first_name", align: "left" },
        { text: "Apellidos", value: "last_name", align: "left" },
        { text: "Nombre de usuario", value: "username", align: "left" },
        { text: "Email", value: "email", align: "left" },
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
        this.operationMessage = response.msg;
        this.operationMessageType = response.code;

        switch (event.url.substring(event.url.lastIndexOf("/") + 1)) {
          case "editar-permisos":
            this.snackbar = true;
            this.dlgRoles = false;
            this.updatingItem = false;
            if (response.code === "success") {
              this.items = response.data;
            }
            break;
          case "eliminar":
          case "editar":
            this.snackbar = true;
            this.dlgUpdateItem = false;
            this.dlgDeleteItem = false;
            this.updatingItem = false;
            this.deletingItem = false;
            if (response.code === "success") {
              this.items = response.data[0];
              this.roles = response.data[1];
            }
            break;
          case "listar":
            this.items = response.data[0];
            this.roles = response.data[1];
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
    },

    getDataFromApi() {
      this.loadingItems = true;
      var config = {
        url: "usuarios/listar",
        params: {}
      };
      this.$refs.axios.submit(config);
    },

    showEditDlg(item) {
      this.editedIndex = this.items.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dlgUpdateItem = true;
      console.log(this.editedItem);
    },

    showAddDlg() {
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

    showRolesDlg(item) {
      this.editedIndex = this.items.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.editedRoles = Object.assign({}, item.roles);
      this.editedRoles = [1, 2, 3];
      console.log(this.editedRoles);
      this.dlgRoles = true;
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
          url: "usuarios/eliminar",
          params: {
            id: this.editedItem.id
          }
        };
        this.$refs.axios.submit(config);
      }
    },

    save() {
      if (!this.updatingItem) {
        this.updatingItem = true;
        let config = {
          method: "post",
          url: this.editedItem.id === -1 ? "usuarios/crear" : "usuarios/editar",
          params: {
            item: this.editedItem
          }
        };
        this.$refs.axios.submit(config);
      }
    },

    savePermissions() {
      if (!this.updatingItem) {
        this.updatingItem = true;
        let activePerms = [];

        /*for (let i in this.editedRoles) {
          this.editedRoles[i].subModules.forEach(element => {
            if (element.active.length > 0) {
              activePerms.push(element.active);
            }
          });
        }*/

        let config = {
          method: "post",
          url: "usuarios/editar-permisos",
          params: {
            id: this.editedItem.id,
            items: editedRoles
          }
        };
        this.$refs.axios.submit(config);
      }
    }
  }
};
</script>
