<template>
  <v-flex>
    <VProgress v-if="loadingInitialElements" message="Cargando" class="text-center" />

    <v-layout row wrap v-else>
      <v-flex xs10 offset-xs1 class="animated fadeIn">
        <v-card>
          <v-container pa-10>
            <v-form @submit.prevent ref="form" v-model="profileValidationStatus">
              <v-layout wrap>
                <v-flex xs12 sm6>
                  <v-text-field
                    outlined
                    :autofocus="true"
                    @keyup.enter="save()"
                    v-model="userData.first_name"
                    label="Nombres"
                    :rules="nameRules"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-text-field
                    outlined
                    v-model="userData.last_name"
                    label="Apellidos"
                    :rules="nameRules"
                  ></v-text-field>
                </v-flex>
              </v-layout>

              <v-layout wrap>
                <v-flex xs12 sm6>
                  <v-text-field
                    outlined
                    v-model="userData.username"
                    label="Nombre de usuario"
                    :rules="nameRules"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-text-field
                    outlined
                    v-model="userData.email"
                    label="Correo electrónico"
                    type="email"
                    :rules="emailRules"
                  ></v-text-field>
                </v-flex>
              </v-layout>

              <v-layout wrap>
                <v-flex xs12 sm6>
                  <v-text-field outlined v-model="userData.ine" label="INE" :rules="nameRules"></v-text-field>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-text-field outlined v-model="userData.phone_number" label="Teléfono"></v-text-field>
                </v-flex>
              </v-layout>

              <v-layout wrap>
                <v-flex xs12 sm6>
                  <v-text-field
                    outlined
                    v-model="userData.address"
                    label="Dirección"
                    :rules="nameRules"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-select
                    :items="[{value:'F', text: 'Femenino'}, {value:'M', text: 'Masculino'}]"
                    outlined
                    v-model="userData.sex"
                    label="Sexo"
                    :rules="nameRules"
                  ></v-select>
                </v-flex>
              </v-layout>

              <v-divider></v-divider>

              <v-layout row wrap mt-3 ml-1>
                <v-flex xs12 mt-2>
                  <v-tooltip right :color="validationColor">
                    <template v-slot:activator="{ on }">
                      <v-btn
                        :disabled="loading"
                        @click="updateProfile()"
                        class="white--text"
                        :color="profileValidationStatus ? $store.getters.getThemeColor : 'error'"
                        v-on="on"
                      >
                        <v-progress-circular
                          v-if="loading"
                          :width="2"
                          size="18"
                          indeterminate
                          class="gray--text fa"
                        ></v-progress-circular>
                        <v-icon v-else-if="!loading && profileValidationStatus" small>check</v-icon>
                        <v-icon v-else-if="!loading && !profileValidationStatus" small>error_outline</v-icon>Actualizar perfil
                      </v-btn>
                    </template>
                    <span>{{validationMessage}}</span>
                  </v-tooltip>
                </v-flex>

                <v-flex xs12 mt-2>
                  <v-btn v-on:click="dlgChangePassword = true" class="white--text" color="warning">
                    <v-icon size="22">lock</v-icon>&nbsp;Cambiar contrase&ntilde;a
                  </v-btn>
                </v-flex>
              </v-layout>

              <v-dialog width="400" v-model="dlgChangePassword" persistent>
                <v-card>
                  <v-card-title class="headline grey lighten-2">Cambiar contrase&ntilde;a</v-card-title>
                  <v-container pt-5 pr-10 pb-5 pl-10>
                    <v-form @submit.prevent ref="passwordForm" v-model="passwordValidationStatus">
                      <v-layout row wrap>
                        <v-text-field
                          autofocus
                          v-model="userData.current_password"
                          prepend-icon="lock"
                          label="Actual"
                          :rules="nameRules"
                          type="password"
                          hint="Clave actual"
                        ></v-text-field>
                        <v-text-field
                          v-model="userData.password"
                          prepend-icon="lock"
                          label="Nueva"
                          :rules="passwordRules"
                          type="password"
                        ></v-text-field>
                        <v-text-field
                          @keyup.enter="changePassword()"
                          v-model="userData.password_confirm"
                          prepend-icon="lock"
                          label="Confirmar"
                          :rules="passwordConfirmRules"
                          type="password"
                          hint="Vuelva a escribir la clave"
                        ></v-text-field>
                      </v-layout>
                      <v-layout row wrap mt-4>
                        <v-spacer></v-spacer>
                        <v-btn
                          :disabled="loading"
                          v-on:click="changePassword()"
                          class="white--text"
                          :color="$store.getters.getThemeColor"
                          text
                        >
                          <v-progress-circular
                            v-if="loading"
                            :width="2"
                            size="18"
                            indeterminate
                            class="gray--text fa"
                          ></v-progress-circular>
                          <v-icon v-else size="22">done</v-icon>Aceptar
                        </v-btn>
                        <v-btn
                          v-on:click="closePasswordDlg()"
                          class="white--text ml-1"
                          color="error"
                          text
                        >Cancelar</v-btn>
                      </v-layout>
                    </v-form>
                  </v-container>
                </v-card>
              </v-dialog>

              <!--<v-dialog width="500" v-model="uploadDlg" persistent>
                <v-card>
                  <v-card-title class="headline grey lighten-2">
                    Upload file
                    <v-spacer></v-spacer>
                    <a @click="uploadDlg = false">
                      <v-icon small>close</v-icon>
                    </a>
                  </v-card-title>
                  <v-container>
                    
                  </v-container>
                </v-card>
              </v-dialog>-->
            </v-form>
          </v-container>
        </v-card>
      </v-flex>
    </v-layout>

    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)" />
  </v-flex>
</template>

<script>
export default {
  data() {
    return {
      dlgChangePassword: false,
      uploadDialog: false,
      loadingInitialElements: true,
      nameRules: [v => !!v || "Dato obligatorio"],
      passwordRules: [
        v => !!v || "Dato obligatorio",
        v => (v && v.length > 2) || "Al menos 3 caracteres"
      ],
      passwordConfirmRules: [
        v => !!v || "Dato obligatorio",
        v => v === this.userData.password || "Los valores no coinciden"
      ],
      emailRules: [
        v => !!v || "Dato obligatorio",
        v =>
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
          "El formato no es correcto"
      ],
      uploadDlg: false,
      profileValidationStatus: false,
      passwordValidationStatus: false,
      loading: false,
      userData: {}
    };
  },
  computed: {
    validationMessage: function() {
      return this.profileValidationStatus
        ? "Todo listo!"
        : "Verifique sus datos";
    },
    validationColor: function() {
      return this.profileValidationStatus ? "grey" : "red";
    }
  },
  mounted() {
    this.getProfileInfo();
  },
  methods: {
    updateProfile() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        let config = {
          method: "form",
          snackbar: true,
          url: "auth/update-profile",
          params: new FormData(),
          headers: {
            "Content-Type": "multipart/form-data"
          }
        };
        config.params.append("item", JSON.stringify(this.userData));
        /*if (this.userData.dsa_letter) {
          config.params.append("dsa_letter", this.userData.dsa_letter);
        }*/
        this.$refs.axios.submit(config);
      }
    },

    changePassword() {
      if (this.$refs.passwordForm.validate()) {
        this.loading = true;
        var config = {
          url: "auth/change-password",
          method: "post",
          snackbar: true,
          params: {
            current_password: this.userData.current_password,
            password: this.userData.password,
            password_confirm: this.userData.password_confirm
          }
        };
        this.$refs.axios.submit(config);
      }
    },

    closePasswordDlg() {
      this.userData.current_password = null;
      this.userData.password = null;
      this.userData.password_confirm = null;
      this.dlgChangePassword = false;
    },

    getProfileInfo() {
      this.loadingInitialElements = true;
      let config = {
        url: "auth/get-profile",
        params: {}
      };
      this.$refs.axios.submit(config);
    },

    setDSALetter(event) {
      this.userData.dsa_letter = event;
      if (event) {
        this.userData.dsa_letter_name = event.name;
        this.uploadDlg = false;
      } else {
        this.userData.dsa_letter_name = null;
      }
    },
    
    showUpload() {
      this.uploadDialog = true;
    },

    handleHttpResponse(event) {
      this.loading = false;
      this.loadingInitialElements = false;

      if (event.data.result.code === 200) {
        var response = event.data.result.response;

        switch (event.url.substring(event.url.lastIndexOf("/") + 1)) {
          case "get-profile":
            if (response.code === "success") {
              this.userData = response.data;
            }
            break;
          case "change-password":
            if (response.code === "success") {
              this.dlgChangePassword = false;
            }
            break;
          default:
            break;
        }
      }
    }
  }
};
</script>
