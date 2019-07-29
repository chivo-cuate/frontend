<template>
  <v-flex xs12>
    <FreeTables />
    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)"/>
  </v-flex>
</template>

<script>
import FreeTables from "@/components/orders/FreeTables";

export default {
  data() {
    return {
    }
  },
  components: { FreeTables },
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
