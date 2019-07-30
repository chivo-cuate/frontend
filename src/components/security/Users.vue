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

          <v-dialog v-model="dlgUpdateItem" max-width="700px" persistent>
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
                      <v-flex xs12 sm4>
                        <v-text-field
                          :rules="requiredRules"
                          outlined
                          v-model="editedItem.first_name"
                          label="Nombre"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm4>
                        <v-text-field
                          :rules="requiredRules"
                          outlined
                          v-model="editedItem.last_name"
                          label="Apellidos"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm4>
                        <v-text-field
                          :rules="requiredRules"
                          outlined
                          v-model="editedItem.ine"
                          label="INE"
                        ></v-text-field>
                      </v-flex>
                    </v-layout>

                    <v-layout wrap>
                      <v-flex xs12 sm4>
                        <v-text-field
                          :rules="requiredRules"
                          outlined
                          v-model="editedItem.username"
                          label="Usuario"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm4>
                        <v-text-field
                          :rules="emailRules"
                          outlined
                          v-model="editedItem.email"
                          label="Correo"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm4>
                        <v-text-field outlined v-model="editedItem.phone_number" label="Teléfono"></v-text-field>
                      </v-flex>
                    </v-layout>

                    <v-layout wrap>
                      <v-flex xs12 sm3>
                        <v-select
                          outlined
                          :items="[{value: 'M', text: 'Masculino'}, {value: 'F', text: 'Femenino'}]"
                          v-model="editedItem.sex"
                          label="Sexo"
                        ></v-select>
                      </v-flex>
                      <v-flex xs12 sm9>
                        <v-text-field outlined v-model="editedItem.address" label="Dirección"></v-text-field>
                      </v-flex>
                    </v-layout>
                    
                    <v-layout wrap>
                      <v-flex xs12 sm6>
                        <v-text-field
                          :rules="passwordRules"
                          outlined
                          v-model="editedItem.password"
                          type="password"
                          label="Contraseña"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12 sm6>
                        <v-text-field
                          :rules="passwordConfirmRules"
                          outlined
                          v-model="editedItem.password_confirm"
                          type="password"
                          label="Confirmar contraseña"
                        ></v-text-field>
                      </v-flex>
                    </v-layout>
                    <v-layout wrap>
                      <v-flex xs12 sm6>
                        <v-select
                          outlined
                          :items="roles"
                          v-model="editedRoles"
                          item-text="name"
                          item-value="id"
                          label="Roles"
                          multiple
                        ></v-select>
                      </v-flex>
                      <v-flex xs12 sm6>
                        <v-select
                          outlined
                          :items="branches"
                          v-model="editedBranches"
                          item-text="name"
                          item-value="id"
                          label="Sucursales"
                          multiple
                        ></v-select>
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
        <template v-if="item.username !== 'admin'">
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
      page: 1,
      pageCount: 0,
      loadingItems: true,
      editedIndex: -1,
      editedItem: {},
      editedBranches: [],
      roles: [],
      branches: [],
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
      ],
      emailRules: [
        v => !!v || "Este dato es obligatorio",
        v =>
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
          "Formato incorrecto"
      ],
      passwordRules: [
        /*v => (v && v.length > 5) || "Password requires at least 6 characters",
        v => v === this.editedItem.password_confirm || "Las contraseñas no coinciden"*/
      ],
      passwordConfirmRules: [
        v => v === this.editedItem.password || "Las contraseñas no coinciden"
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
        this.operationMessage = response.msg;
        this.operationMessageType = response.code;

        switch (action) {
          case "crear":
          case "editar":
            this.snackbar = true;
            this.dlgUpdateItem = false;
            this.updatingItem = false;
            if (response.code === "success") {
              this.items = response.data[0];
              this.roles = response.data[1];
              this.branches = response.data[2];
            }
            break;
          case "eliminar":
            this.snackbar = true;
            this.dlgDeleteItem = false;
            this.deletingItem = false;
            if (response.code === "success") {
              this.items = response.data[0];
              this.roles = response.data[1];
              this.branches = response.data[2];
            }
            break;
          case "listar":
            this.items = response.data[0];
            this.roles = response.data[1];
            this.branches = response.data[2];
            break;
          default:
            this.snackbar = true;
            break;
        }
      } else {
        this.operationMessage = "Your request could not be executed.";
        this.operationMessageType = "error";
        this.snackbar = true;
        this.updatingItem = false;
        this.deletingItem = false;
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
      this.editedRoles = item.roles;
      this.editedBranches = item.branches;
      this.dlgUpdateItem = true;
    },

    showAddDlg() {
      let item = {
        id: -1
      };
      this.editedIndex = -1;
      this.editedItem = Object.assign({}, item);
      this.editedRoles = [];
      this.editedBranches = [];
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
            item: this.editedItem,
            roles: this.editedRoles,
            branches: this.editedBranches
          }
        };
        this.$refs.axios.submit(config);
      }
    }
  }
};
</script>
