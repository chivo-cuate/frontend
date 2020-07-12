<template>
  <!-- <v-snackbar
    :timeout="5000"
    :right="true"
    :bottom="true"
    v-model="snackbar"
    :color="operationMessageType"
  >
    <v-icon small class="white--text fa">info</v-icon>
    {{ operationMessage }}
    <v-btn text @click.native="snackbar = false">
      <v-icon small>close</v-icon>
    </v-btn>
  </v-snackbar>-->

  <v-snackbar
    v-model="snackbar"
    :timeout="7000"
    :right="true"
    :bottom="true"
    :color="operationMessageType"
  >
    <v-icon small class="white--text fa">info</v-icon>
    {{ operationMessage }}
    <template v-slot:action="{ attrs }">
      <v-btn x-small color="white" text v-bind="attrs" @click="snackbar = false">
        <v-icon small>close</v-icon>
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      snackbar: false,
      operationMessage: null,
      operationMessageType: null,
      requestInfo: {}
    };
  },
  methods: {
    submit(config) {
      this.requestInfo = config;
      this.requestInfo.url = `${process.env.VUE_APP_BASE_API}${encodeURI(
        this.requestInfo.url
      )}`;

      if (!this.requestInfo.headers) {
        this.requestInfo.headers = {};
      }
      if (process.env.NODE_ENV === "development") {
        if (this.requestInfo.method !== "form") {
          this.requestInfo.params.XDEBUG_SESSION_START = "phpstorm-xdebug";
        } else {
          this.requestInfo.params.append(
            "XDEBUG_SESSION_START",
            "phpstorm-xdebug"
          );
        }
      }
      this.requestInfo.headers[
        "Authorization"
      ] = `Bearer ${this.$store.getters.getJWT}`;

      this.requestInfo.headers["Content-Type"] = "application/json";
      this.requestInfo.headers["Access-Control-Allow-Credentials"] = "*";

      //this.requestInfo.onUploadProgress = function(progressEvent) {}

      let that = this;
      switch (this.requestInfo.method) {
        case "form":
        case "post":
          this.post().then(result => {
            this.showSnackbar(
              this.requestInfo.snackbar,
              result.result.response
            );
            this.$emit("finish", { data: result, url: this.requestInfo.url });
          });
          break;
        default:
          this.get().then(result => {
            this.showSnackbar(
              this.requestInfo.snackbar,
              result.result.response
            );
            this.$emit("finish", { data: result, url: this.requestInfo.url });
          });
          break;
      }
    },

    get() {
      return new Promise((resolve, reject) => {
        axios
          .get(this.requestInfo.url, this.requestInfo)
          .then(function(response) {
            let result = { code: 200, response: response.data };
            resolve({ result });
          })
          .catch(function(error) {
            let result = { code: 500, response: error };
            resolve({ result });
          });
      });
    },

    post() {
      return new Promise((resolve, reject) => {
        var fullUrl = `${this.requestInfo.url}${
          this.requestInfo.params.XDEBUG_SESSION_START
            ? "&XDEBUG_SESSION_START=phpstorm-xdebug"
            : ""
        }`;

        axios
          .post(fullUrl, this.requestInfo.params, {
            headers: this.requestInfo.headers
          })
          .then(function(response) {
            let result = { code: 200, response: response.data };
            resolve({ result });
          })
          .catch(function(error) {
            let result = { code: 500, response: error };
            resolve({ result });
          });
      });
    },

    showSnackbar(snackbar, response) {
      if (snackbar) {
        this.operationMessage = response.msg;
        this.operationMessageType = response.code;
      }
      this.snackbar = snackbar;
    }
  }
};
</script>
