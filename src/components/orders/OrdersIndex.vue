<template>
  <v-flex xs12>
    <VProgress v-if="loadingInitialData" message="Cargando" class="text-center" />
    <v-flex v-else class="animated fadeIn">
      <Tables :tables="tables" :assets="assets" v-on:playSound="playNotifSound()" v-on:setResponse="setResponse($event)" />
    </v-flex>

    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)" />
  </v-flex>
</template>

<script>
import Tables from "@/components/orders/Tables";

export default {
  data() {
    return {
      loadingInitialData: true,
      loadingData: false,
      tables: [],
      assets: [],
      audioPlayer: null
    };
  },
  components: { Tables },
  mounted() {
    this.timer = setInterval(this.getDataFromApi, 5000);
    this.getDataFromApi();
    this.initAudioPlayer();
  },
  methods: {
    initAudioPlayer() {
      if (!this.audioPlayer) {
        this.audioPlayer = new Audio(this.$store.getters.getBeepFile);
      }
    },

    playNotifSound() {
      this.initAudioPlayer();
      this.audioPlayer.play();
    },

    setResponse(response) {
      this.tables = response.data.tables;
      this.assets = response.data.assets;
    },

    handleHttpResponse(event) {
      this.loadingData = false;
      this.loadingInitialData = false;

      if (event.data.result.code === 200) {
        var response = event.data.result.response;
        this.operationMessage = response.msg;
        this.operationMessageType = response.code;

        switch (event.url.substring(event.url.lastIndexOf("/") + 1)) {
          case "listar":
            if (response.code === "success") {
              this.setResponse(response);
            }
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
      if (!this.loadingData) {
        this.loadingData = true;
        var config = {
          url: "ordenes/listar",
          params: {
            branch_id: this.$store.getters.getCurrBranch.id
          }
        };
        this.$refs.axios.submit(config);
      }
    }
  }
};
</script>
