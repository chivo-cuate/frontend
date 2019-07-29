<template>
  <v-flex>
    <VProgress v-if="loadingInitialElements" message="Cargando" class="text-center"/>

    <v-layout row wrap v-else>
      <v-flex xs12 class="animated fadeIn">
        <v-card>
          <v-container pa-10>
            <v-form v-model="profileValidationStatus" ref="form">
              <v-layout row wrap>
                <v-flex sm5 md5>
                  <v-text-field
                    v-model="userData.first_name"
                    name="name"
                    label="Nombres"
                    type="text"
                    :rules="nameRules"
                  ></v-text-field>
                  <v-text-field
                    v-model="userData.last_name"
                    name="last_name"
                    label="Apellidos"
                    type="text"
                    :rules="lastNameRules"
                  ></v-text-field>
                </v-flex>
                <v-flex offset-sm2 sm5>
                  <v-text-field
                    v-model="userData.email"
                    name="email"
                    label="Correo electrónico"
                    type="email"
                    :rules="emailRules"
                  ></v-text-field>
                  <v-text-field
                    v-model="userData.username"
                    name="address"
                    label="Nombre de usuario"
                    type="text"
                    :rules="nameRules"
                  ></v-text-field>
                </v-flex>
              </v-layout>

              <v-layout row wrap mt-5>
                <v-flex xs12 mt-2>
                  <v-tooltip bottom :color="validationColor">
                    <template v-slot:activator="{ on }">
                    <v-btn
                      :disabled="loading"
                      @click="updateProfile()"
                      class="white--text"
                      :class="{ red: !profileValidationStatus, indigo: profileValidationStatus }"
                      v-on="on"
                    >
                      <v-progress-circular
                        v-if="loading"
                        :width="2"
                        size="18"
                        indeterminate
                        class="gray--text fa"
                      ></v-progress-circular>
                      <v-icon
                        v-else-if="!loading && profileValidationStatus"
                        small
                        class="fa"
                      >check</v-icon>
                      <v-icon
                        v-else-if="!loading && !profileValidationStatus"
                        small
                        class="fa"
                      >error_outline</v-icon>Actualizar perfil
                    </v-btn>
                    </template>
                    <span>{{validationMessage}}</span>
                  </v-tooltip>
                </v-flex>

                <v-flex xs12 mt-2>
                  <v-btn
                    v-on:click="dlgChangePassword = true"
                    class="white--text"
                    color="warning"
                  >
                    <v-icon size="22">lock</v-icon>&nbsp;Cambiar contrase&ntilde;a
                  </v-btn>
                </v-flex>
              </v-layout>

              <v-dialog width="400" v-model="dlgChangePassword" persistent>
                <v-card>
                  <v-card-title class="headline grey lighten-2">Cambiar contrase&ntilde;a</v-card-title>
                  <v-container pt-5 pr-10 pb-5 pl-10>
                    <v-form v-model="passwordValidationStatus" ref="passwordForm">
                      <v-layout row wrap>
                        <v-text-field
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
                          hint="Al menos 6 caracteres"
                        ></v-text-field>
                        <v-text-field
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
                          color="info"
                        >
                          <v-progress-circular
                            v-if="loading"
                            :width="2"
                            size="18"
                            indeterminate
                            class="gray--text fa"
                          ></v-progress-circular>
                          <v-icon v-else size="22" class="fa">done</v-icon>Aceptar
                        </v-btn>
                        <v-btn
                          v-on:click="closePasswordDlg()"
                          class="white--text ml-1"
                          color="error"
                        >
                          <v-icon class="fa" size="22">cancel</v-icon>Cancelar
                        </v-btn>
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
                      <v-icon small class="fa">close</v-icon>
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

    <v-snackbar
      :timeout="5000"
      :bottom="true"
      :right="true"
      v-model="snackbar"
      :color="operationMessageType"
    >
      <v-icon small class="white--text fa">info</v-icon>
      {{ operationMessage }}
      <v-btn text @click.native="snackbar = false">
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
      dlgChangePassword: false,
      dlgCancelReg: false,
      uploadDialog: false,
      uploadingImage: false,
      loadingInitialElements: true,
      snackbar: false,
      nameRules: [v => !!v || "Este dato es obligatorio"],
      lastNameRules: [v => !!v || "Este dato es obligatorio"],
      dsaLetterRules: [v => !!v || "Este dato es obligatorio"],
      passwordRules: [
        v => !!v || "Este dato es obligatorio",
        v => (v && v.length > 5) || "Al menos 6 caracteres"
      ],
      passwordConfirmRules: [
        v => !!v || "Este dato es obligatorio",
        v => v === this.userData.password || "Los valores no coinciden"
      ],
      emailRules: [
        v => !!v || "Este dato es obligatorio",
        v =>
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
          "El formato no es correcto"
      ],
      postcodeRules: [v => !!v || "Este dato es obligatorio"],
      addressRules: [v => !!v || "Este dato es obligatorio"],
      operationMessage: "Introduzca sus credenciales",
      operationMessageType: "warning",
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
      return this.profileValidationStatus ? "indigo" : "red";
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
          url: "auth/update-profile",
          params: new FormData(),
          headers: {
            "Content-Type": "multipart/form-data"
          }
        };
        config.params.append("user_data", JSON.stringify(this.userData));
        if (this.userData.dsa_letter) {
          config.params.append("dsa_letter", this.userData.dsa_letter);
        }
        this.$refs.axios.submit(config);
      }
    },
    changePassword() {
      if (this.$refs.passwordForm.validate()) {
        this.loading = true;
        var config = {
          url: "auth/change-password",
          method: "post",
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
        this.operationMessage = response.msg;
        this.operationMessageType = response.code;

        switch (event.url.substring(event.url.lastIndexOf("/") + 1)) {
          case "upload-signature":
            this.snackbar = true;
            this.uploadingImage = false;
            break;
          case "get-profile":
            if (response.code === "success") {
              this.userData = response.data;
            } else {
              this.snackbar = true;
            }
            break;
          case "change-password":
            this.snackbar = true;
            if (response.code === "success") {
              this.dlgChangePassword = false;
            }
            break;
          default:
            this.snackbar = true;
            break;
        }
      } else {
        this.operationMessage = "La solicitud no pudo ser procesada.";
        this.operationMessageType = "error";
        this.snackbar = true;
      }
    }
  }
};
</script>
