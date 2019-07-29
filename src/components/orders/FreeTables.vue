<template>
  <v-flex xs12>
    
      <v-container>
        
        <v-layout row wrap>
          <v-flex xs12>
          Mesas disponibles
          </v-flex>
          <v-flex xs6 sm3 md1 v-for="item in $store.getters.getCurrBranch.tables" :key="`table-${item}`" class="table-container text-center animated fadeIn error" mr-1 mb-2 pt-3>
            <div class="table-container text-center">
              <p class="white--text">{{ item }}</p>
            </div>
          </v-flex>
        </v-layout>
      </v-container>
    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)"/>
    
  </v-flex>
</template>

<script>

export default {
  data() {
    return {
    }
  },
  mounted() {

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

<style scoped>
.table-container {
}
</style>
