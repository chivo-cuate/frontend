<template>
  <v-flex xs12>
    <v-layout justify-center class="animated fadeIn">
      <v-flex md5>
        <v-toolbar tabs :color="$store.getters.getThemeColor">
          <v-toolbar-title class="white--text">
            <v-icon class="white--text">lock</v-icon>Introduzca sus datos
          </v-toolbar-title>
        </v-toolbar>
        <v-card>
          <v-tabs v-model="activeTab" centered color="transparent" icons-and-text>
            <v-tabs-slider :color="$store.getters.getThemeColor"></v-tabs-slider>
            <v-tab @click="redirect('iniciar-sesion')" href="#tab-iniciar-sesion">
              Iniciar sesi&oacute;n
              <v-icon>verified_user</v-icon>
            </v-tab>
            <v-tab @click="redirect('restablecer-contrasena')" href="#tab-restablecer-contrasena">
              Restablecer contrase&ntilde;a
              <v-icon>email</v-icon>
            </v-tab>

            <v-tab-item value="tab-iniciar-sesion">
              <v-layout align-center justify-center>
                <v-flex md8 mt-3>
                  <v-card-text>
                    <v-form @submit.prevent ref="loginForm" v-model="loginValidationStatus">
                      <v-layout row>
                        <v-flex lg12>
                          <v-text-field
                            autofocus
                            @keyup.enter="login()"
                            v-model="username"
                            ref="txt_username"
                            prepend-icon="person"
                            name="username"
                            label="Nombre de usuario"
                            type="text"
                            required
                            :rules="usernameRules"
                            hint="Introduzca su nombre de usuario"
                          ></v-text-field>
                          <v-text-field
                            autocomplete="off"
                            ref="loginPassword"
                            @keyup.enter="login()"
                            v-model="password"
                            prepend-icon="lock"
                            name="password"
                            label="Contraseña"
                            type="password"
                            required
                            :rules="passwordRules"
                            hint="Introduzca su clave"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                    </v-form>
                  </v-card-text>
                  <v-card-actions class="pb-5">
                    <v-spacer></v-spacer>
                    <v-tooltip left color="grey">
                      <template v-slot:activator="{ on }">
                        <v-btn
                          :disabled="loading"
                          @click="login()"
                          class="white--text mr-3"
                          :class="loginValidationStatus ? $store.getters.getThemeColor : 'red' "
                          v-on="on"
                        >
                          <v-progress-circular
                            v-if="loading"
                            :width="2"
                            size="18"
                            indeterminate
                            class="gray--text fa"
                          ></v-progress-circular>
                          <v-icon size="22" v-if="!loading && loginValidationStatus">done</v-icon>
                          <v-icon size="22" v-if="!loading && !loginValidationStatus">error_outline</v-icon>Aceptar
                        </v-btn>
                      </template>
                      <span>{{loginValidationMessage}}</span>
                    </v-tooltip>
                  </v-card-actions>
                </v-flex>
              </v-layout>
            </v-tab-item>

            <v-tab-item value="tab-restablecer-contrasena">
              <v-layout align-center justify-center row>
                <v-flex xs8 mt-3>
                  <v-card-text>
                    <v-form
                      @submit.prevent
                      ref="resetPasswordForm"
                      v-model="resetPasswordValidationStatus"
                    >
                      <v-layout row>
                        <v-flex lg12>
                          <v-text-field
                            v-model="email"
                            ref="resetPasswordEmail"
                            @keyup.enter="requestPasswordReset()"
                            prepend-icon="email"
                            name="email"
                            label="Cuenta de correo"
                            type="email"
                            :rules="emailRules"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                    </v-form>
                  </v-card-text>
                  <v-card-actions class="pb-5">
                    <v-spacer></v-spacer>
                    <v-tooltip left color="grey">
                      <template v-slot:activator="{ on }">
                        <v-btn
                          :disabled="loading"
                          @click="requestPasswordReset()"
                          class="white--text mr-3"
                          :class="resetPasswordValidationStatus ? $store.getters.getThemeColor : 'red'"
                          v-on="on"
                        >
                          <v-progress-circular
                            v-if="loading"
                            :width="2"
                            size="18"
                            indeterminate
                            class="gray--text fa"
                          ></v-progress-circular>
                          <v-icon size="22" v-if="!loading && resetPasswordValidationStatus">done</v-icon>
                          <v-icon
                            size="22"
                            v-if="!loading && !resetPasswordValidationStatus"
                          >error_outline</v-icon>Aceptar
                        </v-btn>
                      </template>
                      <span>{{resetPasswordValidationMessage}}</span>
                    </v-tooltip>
                  </v-card-actions>
                </v-flex>
              </v-layout>
            </v-tab-item>
          </v-tabs>
        </v-card>
      </v-flex>
    </v-layout>

    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)" />
  </v-flex>
</template>

<script>
import { setTimeout } from "timers";

export default {
  data() {
    return {
      e1: true,
      e2: true,
      capsLockAlert: false,
      loading: false,
      email: "",
      password: "",
      username: "",
      loginValidationStatus: false,
      resetPasswordValidationStatus: false,
      nameRules: [v => !!v || "Dato obligatorio"],
      lastNameRules: [v => !!v || "Dato obligatorio"],
      passwordRules: [v => !!v || "Dato obligatorio"],
      usernameRules: [
        v => !!v || "Dato obligatorio",
        v => (v && v.length > 1) || "Debe introducir al menos 2 caracteres"
      ],
      emailRules: [
        v => !!v || "Dato obligatorio",
        v =>
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
          "Introduzca una dirección válida"
      ],
      activeTab: null,
      apiUrls: {
        login: "auth/login",
        resetPassword: "acceso/restablecer-contrasena"
      }
    };
  },
  mounted() {
    this.activeTab = `tab-${this.$route.params.action}`;
  },
  afterRouteUpdate() {
    this.activeTab = `tab-${this.$route.params.action}`;
  },
  methods: {
    redirect(action) {
      this.$router.push(`/acceso/${action}`);
    },

    handleHttpResponse(event) {
      this.loading = false;
      if (event.data.result.code !== 500) {
        var response = event.data.result.response;
        if (response.code === "success") {
          this.$store.commit("updatePayload", response.data);
          var redirect = this.$store.getters.getAuthRouteRequested;
          this.$store.commit("setAuthRouteRequested", null);
          this.$router.push(
            redirect
              ? redirect
              : response.data.redirect
              ? response.data.redirect
              : "/inicio"
          );
        } else {
          this.$store.commit("logout");
        }
      }
    },

    login() {
      if (this.$refs.loginForm.validate()) {
        this.loading = true;
        var config = {
          url: this.apiUrls.login,
          method: "post",
          snackbar: true,
          params: {
            username: this.username,
            password: this.password
          }
        };
        this.$refs.axios.submit(config);
      }
    },

    requestPasswordReset() {
      if (this.$refs.resetPasswordForm.validate()) {
        this.loading = true;
        var activationUrl = window.location.href.replace(
          this.$route.path,
          "/restablecer-contrasena"
        );
        var config = {
          url: this.apiUrls.resetPassword,
          method: "post",
          snackbar: true,
          params: {
            email: this.email,
            activation_url: activationUrl,
            home_url: window.location.href
          }
        };
        this.$refs.axios.submit(config);
      }
    }
  },
  computed: {
    loginValidationMessage: function() {
      return this.loginValidationStatus
        ? "¡Todo listo!"
        : "Verifique sus datos";
    },
    resetPasswordValidationMessage: function() {
      return this.resetPasswordValidationStatus
        ? "¡Todo listo!"
        : "Verifique los datos";
    }
  }
};
</script>
