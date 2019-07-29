<template>
  <v-flex xs12>
    <v-data-table
      :headers="headers"
      :items="items"
      :options.sync="options"
      :server-items-length="totalItems"
      :items-per-page="10"
      :loading="loading"
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.nombre }}</td>
        <td class="text-left">
          <v-tooltip bottom color="black">
            <template v-slot:activator="{ on }">
              <v-btn
                @click="reviewForm(props.item.route)"
                :disabled="props.item.status === 3"
                small
                flat
                v-on="on"
                class="btn-sm"
                color="warning"
              >
                <v-icon small class="fa">edit</v-icon>
              </v-btn>
            </template>
            <span>Review</span>
          </v-tooltip>
        </td>
      </template>

      <v-alert
        slot="no-results"
        :value="true"
        class="black--text"
        color="default"
      >Your search for "{{ search }}" found no results.</v-alert>

      <template slot="no-data">
        <v-alert :value="true" class="black--text text-center" color="default">
          <v-progress-circular v-if="loading" :width="2" indeterminate class="primary--text"></v-progress-circular>
          <span v-else>No se han encontrado elementos.</span>
        </v-alert>
      </template>
    </v-data-table>

    <v-dialog width="500" v-model="approveDialog" persistent>
      <v-card>
        <v-card-title class="headline grey lighten-2">
          Approve Form
          <v-spacer></v-spacer>
          <a @click="approveDialog = false">
            <v-icon small class="fa">close</v-icon>
          </a>
        </v-card-title>
        <v-container>
          <h3 class="text-xs-center">Are you sure you want to approve this form?</h3>
          <div class="text-xs-center">
            <v-btn :disabled="approvingForm" @click="approveForm()" color="info">
              <v-icon v-if="!approvingForm" small class="fa">thumb_up</v-icon>
              <v-progress-circular v-else :width="2" size="18" indeterminate class="gray--text fa"></v-progress-circular>Yes
            </v-btn>
            <v-btn @click="approveDialog = false" color="error">
              <v-icon small class="fa">thumb_down</v-icon>Not yet
            </v-btn>
          </div>
        </v-container>
      </v-card>
    </v-dialog>

    <v-snackbar
      :timeout="5000"
      :bottom="true"
      :right="true"
      v-model="snackbar"
      :color="operationMessageType"
    >
      <v-icon small class="fa">info</v-icon>
      {{ operationMessage }}
      <v-btn flat @click.native="snackbar = false">
        <v-icon small class="fa">close</v-icon>
      </v-btn>
    </v-snackbar>

    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)"/>
  </v-flex>
</template>

<script>

export default {
  data() {
    return {
      options: {},
      search: "",
      formIndex: null,
      formId: null,
      totalItems: 0,
      items: [],
      loading: true,
      approvingForm: false,
      downloading: false,
      currFileName: null,
      approveDialog: false,
      operationMessage: "",
      operationMessageType: "error",
      snackbar: false,
      pagination: {},
      headers: [
        { text: "Nombre", value: "name" },
        { text: "Descripcion", value: "description" },
        { text: "Acciones", value: "acciones" }
      ]
    };
  },
  watch: {
      options: {
        handler () {
          this.getDataFromApi()
        },
        deep: true,
      }
    },
  mounted() {
    //this.getDataFromApi();
  },
  methods: {
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
    },
    approveForm() {
      if (!this.approvingForm && this.formId) {
        this.approvingForm = true;

        var config = {
          method: "post",
          url: "do-approve-form",
          params: {
            form_id: this.formId
          }
        };
        this.$refs.axios.submit(config);
      }
    },
    reviewForm(route) {
      this.$router.push(route);
    },
    showApproveDialog(formId, index) {
      this.formId = formId;
      this.formIndex = index;
      this.approveDialog = true;
    },
    searchItems() {
      if (!this.loading) {
        this.getDataFromApi();
      }
    },
    getDataFromApi() {
      this.loading = true;
      var config = {
        url: "ingredient/get-ingredients",
        params: {
          branch_id: this.$store.getters.getCurrBranch.id
        }
      };
      this.$refs.axios.submit(config);
    }
  }
};
</script>
