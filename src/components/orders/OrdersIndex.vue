<template>
  <v-flex xs12>
    <VProgress
      v-if="loadingInitialData"
      message="Cargando"
      class="text-center"
    />
    <template v-else>
      <template v-if="!this.$store.getters.getCurrBranch">
        <v-container>
          <v-layout wrap>
            <v-flex xs12>
              <v-alert
                dense
                tile
                prominent
                dismissible
                dark
                color="warning"
                border="left"
                icon="warning"
                class="animated flash"
              >
                Debe seleccionar una sucursal para poder usar esta
                p&aacute;gina</v-alert
              >
            </v-flex>
          </v-layout>
        </v-container>
      </template>
      <template v-else>
        <v-container v-if="!cooksEnabled">
          <v-flex>
            <v-alert
              dense
              tile
              prominent
              dismissible
              dark
              color="warning"
              border="left"
              icon="warning"
              class="animated flash"
              >No existen elaboradores habilitados para el men&uacute; de hoy.
              Solo podr&aacute;n ser procesadas las &oacute;rdenes que no
              involucren alimentos elaborados.</v-alert
            >
          </v-flex>
        </v-container>
        <v-flex
          class="animated fadeIn"
          :style="cooksEnabled ? '' : 'margin-top: -30px;'"
        >
          <Tables
            v-if="permissions.canList"
            ref="tablesComp"
            :tables="tables"
            :takeAwayOrders="takeAwayOrders"
            :assets="assets"
            :perms="permissions"
            @setResponse="setResponse($event)"
          />
          <template v-if="permissions.canViewPending">
            <template v-if="compCooksNotChosen">
              <CookingPartners @setChosenCooks="setChosenCooks($event)" />
            </template>
            <template v-else>
              <PendingOrders :orders="pendingOrders" />
              <Cooks @setResponse="setResponse($event)" />
            </template>
          </template>
        </v-flex>
      </template>
    </template>

    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)" />
  </v-flex>
</template>

<script>
import Tables from "@/components/orders/Tables";
import PendingOrders from "@/components/orders/PendingOrders";
import Cooks from "@/components/orders/Cooks";
import CookingPartners from "@/components/orders/CookingPartners";

export default {
  data() {
    return {
      loadingInitialData: false,
      loadingData: false,
      cooksEnabled: true,
      tables: [],
      assets: [],
      takeAwayOrders: [],
      pendingOrders: [],
      cooks: [],
      timer: null,
      permissions: {
        canList: false,
        canCreateOPC: false,
        canCreateOPL: false,
        canEdit: false,
        canDelete: false,
        canViewPending: false,
        canCook: false,
        canCheckout: false
      }
    };
  },
  components: { Tables, PendingOrders, Cooks, CookingPartners },
  computed: {
    compCooksNotChosen() {
      return (this.$store.getters.getChosenCooks.length === 0)
    }
  },
  created() {
    this.$store.getters.getPermissions("Clientes").forEach(permissions => {
      permissions.perms.forEach(perm => {
        switch (perm.text) {
          case "Listar":
            this.permissions.canList = true;
            break;
          case "Crear OPC":
            this.permissions.canCreateOPC = true;
            break;
          case "Crear OPL":
            this.permissions.canCreateOPL = true;
            break;
          case "Editar":
            this.permissions.canEdit = true;
            break;
          case "Cancelar":
            this.permissions.canDelete = true;
            break;
          case "Elaborar OPC":
          case "Elaborar OPL":
            this.permissions.canCook = true;
            break;
          case "Ver pendientes":
            this.permissions.canViewPending = true;
            break;
          case "Cerrar cuenta":
            this.permissions.canCheckout = true;
            break;
          default:
            break;
        }
      });
    });
    if (!(this.permissions.canList || this.permissions.canViewPending)) {
      this.$router.push("/403");
    }
  },
  mounted() {
    this.$root.$emit("resetNotifications");
  },
  beforeRouteLeave(to, from, next) {
    this.$root.$emit("resetNotifications");
    next();
  },
  methods: {
    setResponse(response) {
      this.tables = response.data.tables;
      this.takeAwayOrders = response.data.takeaway_orders;
      this.assets = response.data.assets;
      this.pendingOrders = response.data.orders;
      this.cooks = response.data.cooks;
      this.cooksEnabled = response.data.cooks_enabled;
      this.$store.commit("setChosenCooks", this.cooks);
      this.$root.$emit("setNotifications", response.data.notifications);
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
              if (this.$refs.tablesComp) {
                this.$refs.tablesComp.updateCurrTableAndOrders(response);
              }
            }
            break;
          case "ver-pendientes":
            if (response.code === "success") {
              this.setResponse(response);
            }
            break;
          default:
            break;
        }
      }
    },

    getDataFromApi() {
      if (!this.loadingData) {
        this.loadingData = true;
        let config = {
          url: this.permissions.canList
            ? "ordenes/listar"
            : "ordenes/ver-pendientes",
          params: {
            branch_id: this.$store.getters.getCurrBranchID,
            cooks: this.$store.getters.getChosenCooksIDs.join()
          }
        };
        if (this.$refs.axios) {
          this.$refs.axios.submit(config);
        }
      }
    },

    setChosenCooks(chosenCooks) {

      this.timer = setInterval(this.getDataFromApi, 5000);

      this.$store.commit("setChosenCooks", chosenCooks);
      
      let cookIds = this.$store.getters.getChosenCooksIDs
      let config = {
        url: "auth/marcar-elaboradores-autenticados",
        snackbar: false,
        method: "post",
        params: {
          cook_ids: cookIds,
          branch_id: this.$store.getters.getCurrBranchID
        }
      };

      this.$refs.axios.submit(config);
    }
  }
};
</script>
