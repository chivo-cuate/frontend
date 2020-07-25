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
          <v-btn @click="getDataFromApi()" color="success" text><v-icon>mdi-refresh</v-icon></v-btn>

          <v-dialog v-model="dlgUpdateItem" max-width="300px" persistent>
            <v-card>
              <v-card-title>
                <span class="subtitle">Desconectar usuario</span>
              </v-card-title>
              <v-card-text>
                <v-container grid-list-md>
                  <v-layout wrap>
                    <v-flex xs12>
                      <p>¿Seguro que desea desconectar a {{ editedItem.full_name }}?</p>
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
                  @click="disconnect()"
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
        </v-toolbar>
      </template>
      <template v-slot:item.action="{ item }">
        <v-tooltip bottom v-if="item.session_id">
          <template v-slot:activator="{ on }">
            <v-icon class="mr-2" color="red" @click="showDisconnectDlg(item)" v-on="on">mdi-logout</v-icon>
          </template>
          <span>Desconectar</span>
        </v-tooltip>
      </template>
      <template v-slot:item.is_online="{ item }">
        <v-icon class="mr-2" :color="item.is_online == 'No' ? 'red' : 'green'">mdi-checkbox-blank-circle</v-icon>
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
      dlgUpdateItem: false,
      page: 1,
      pageCount: 0,
      loadingItems: true,
      editedIndex: -1,
      editedItem: {},
      validForm: false,
      items: [],
      updatingItem: false,
      headers: [
        { text: "Nombre completo", value: "full_name", align: "left" },
        { text: "Nombre de usuario", value: "username", align: "left" },
        { text: "Conectado", value: "is_online", align: "left" },
        { text: "ID de sesión", value: "session_id", align: "left" },
        { text: "Acciones", value: "action", align: "left", sortable: false }
      ]
    };
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
          case "desconectar":
            this.dlgUpdateItem = false;
            this.updatingItem = false;
            if (response.code === "success") {
              this.setScopeObjects(response);
            }
            break;
          case "listar":
            this.loadingItems = false;
            this.setScopeObjects(response);
            break;
          default:
            break;
        }
      }
    },

    setScopeObjects(response) {
      this.items = response.data;
    },

    getDataFromApi() {
      this.loadingItems = true
      this.items = []
      var config = {
        url: "usuarios-sucursal/listar",
        params: {
          branch_id: this.$store.getters.getCurrBranchID
        }
      };
      this.$refs.axios.submit(config);
    },

    showDisconnectDlg(item) {
      this.editedIndex = this.items.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dlgUpdateItem = true;
    },

    disconnect() {
      if (!this.updatingItem) {
        this.updatingItem = true;
        var config = {
          method: "post",
          url: "usuarios-sucursal/desconectar",
          params: {
            id: this.editedItem.id,
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
