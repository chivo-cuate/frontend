<template>
  <v-flex xs12>
    <v-layout justify-center class="animated fadeIn">
      <v-flex md5>
        <v-toolbar tabs :color="$store.getters.getThemeColor">
          <v-toolbar-title class="white--text">
            <v-icon class="white--text">lock</v-icon>
            Introduzca sus datos
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
                            @input="showCapsLockMsg($event)"
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
                    <v-tooltip bottom :color="loginValidationColor">
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
            <!--
            <v-tab-item value="tab-signup">
              <v-layout justify-center>
                <v-flex xs10 mt-3>
                  <v-card-text>
                    <v-form @submit.prevent ref="signupForm" v-model="signupValidationStatus">
                      <v-layout row wrap>
                        <v-flex sm12 md11 lg6>
                          <v-text-field
                            v-model="name"
                            prepend-icon="edit"
                            name="name"
                            label="First name"
                            type="text"
                            :rules="nameRules"
                          ></v-text-field>
                          <v-text-field
                            v-model="last_name"
                            prepend-icon="edit"
                            name="last_name"
                            label="Last name"
                            type="text"
                            :rules="lastNameRules"
                          ></v-text-field>
                          <v-text-field
                            v-model="password"
                            prepend-icon="lock"
                            name="password"
                            label="Password"
                            :rules="passwordRules"
                            :append-icon="e1 ? 'visibility' : 'visibility_off'"
                            @click:append="() => (e1 = !e1)"
                            :type="e1 ? 'password' : 'text'"
                            hint="At least 6 characters"
                            min="6"
                          ></v-text-field>
                          <v-text-field
                            v-model="password_confirm"
                            prepend-icon="lock"
                            name="passwordConfirm"
                            label="Password Confirmation"
                            :rules="passwordConfirmRules"
                            :append-icon="e2 ? 'visibility' : 'visibility_off'"
                            @click:append="() => (e2 = !e2)"
                            :type="e2 ? 'password' : 'text'"
                            hint="Repita su contraseña"
                          ></v-text-field>
                        </v-flex>
                        <v-flex sm12 md11 lg6>
                          <v-text-field
                            v-model="email"
                            prepend-icon="email"
                            name="email"
                            label="Email"
                            type="email"
                            :rules="emailRules"
                          ></v-text-field>
                          <v-text-field
                            v-model="telephone"
                            prepend-icon="phone"
                            name="telephone"
                            label="Telephone"
                            single-line
                            type="text"
                          ></v-text-field>
                          <v-text-field
                            @blur="test()"
                            v-model="postcode"
                            prepend-icon="place"
                            name="postcode"
                            label="Postcode"
                            :hint="loadingPostcodeInfo ? 'Loading postcode...' : 'Enter a postcode to lookup'"
                            single-line
                            type="text"
                          ></v-text-field>
                          <v-text-field
                            v-model="address"
                            prepend-icon="fas fa-map-signs"
                            name="address"
                            label="Address"
                            type="text"
                            :rules="addressRules"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                    </v-form>
                  </v-card-text>

                  <v-card-actions class="pb-5">
                    <v-spacer></v-spacer>
                    <v-tooltip bottom :color="signupValidationColor">
                      <v-btn
                        @click="signup()"
                        :disabled="loading"
                        class="white--text mr-3"
                        :class="signupValidationStatus ? $store.getters.getThemeColor : 'red'"
                        slot="activator"
                      >
                        <v-icon size="22" v-if="!loading && signupValidationStatus">done</v-icon>
                        <v-icon size="22" v-if="!loading && !signupValidationStatus">error_outline</v-icon>
                        <v-progress-circular
                          v-if="loading"
                          :width="2"
                          size="18"
                          indeterminate
                          class="gray--text fa"
                        ></v-progress-circular>Sign up
                      </v-btn>
                      <span>{{signupValidationMessage}}</span>
                    </v-tooltip>
                    <v-btn
                      @click="resetSignupForm()"
                      class="white--text warning ml-2 mr-3"
                      slot="activator"
                    >
                      <v-icon  size="22">cancel</v-icon>Reset
                    </v-btn>
                  </v-card-actions>
                </v-flex>
              </v-layout>
            </v-tab-item>
            -->

            <v-tab-item value="tab-restablecer-contrasena">
              <v-layout align-center justify-center row>
                <v-flex xs8 mt-3>
                  <v-card-text>
                    <v-form @submit.prevent ref="resetPasswordForm" v-model="resetPasswordValidationStatus">
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
                    <v-tooltip bottom :color="resetPasswordValidationColor">
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

    <v-snackbar
      :timeout="10000"
      :bottom="true"
      :right="true"
      v-model="snackbar"
      :color="operationMessageType"
    >
      <v-icon small class="white--text fa">info</v-icon>
      {{ operationMessage }}
      <v-btn text @click.native="snackbar = false">
        <v-icon>close</v-icon>
      </v-btn>
    </v-snackbar>

    <AxiosComponent ref="axios" v-on:finish="handleHttpResponse($event)"/>
  </v-flex>
</template>

<script>
import { setTimeout } from 'timers';

export default {
  data() {
    return {
      operationMessage: "",
      operationMessageType: "error",
      snackbar: false,
      e1: true,
      e2: true,
      capsLockAlert: false,
      loading: false,
      loadingPostcodeInfo: false,
      operationMessage: null,
      operationMessageType: null,
      name: "",
      last_name: "",
      password: "",
      password_confirm: "",
      email: "",
      username: "",
      telephone: "",
      address: "",
      postcode: "",
      loginValidationStatus: false,
      signupValidationStatus: false,
      resetPasswordValidationStatus: false,
      nameRules: [v => !!v || "Dato obligatorio"],
      lastNameRules: [v => !!v || "Dato obligatorio"],
      passwordRules: [
        v => !!v || "Dato obligatorio"
        //v => (v && v.length > 5) || "Password requires at least 6 characters"
      ],
      usernameRules: [
        v => !!v || "Dato obligatorio",
        v => (v && v.length > 1) || "Debe introducir al menos 2 caracteres"
      ],
      passwordConfirmRules: [
        v => !!v || "Dato obligatorio",
        v => v === this.password || "Las contraseñas no coinciden"
      ],
      emailRules: [
        v => !!v || "Dato obligatorio",
        v =>
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
          "Introduzca una dirección válida"
      ],
      addressRules: [v => !!v || "Dato obligatorio"],
      activeTab: null,
      apiUrls: {
        login: 'auth/login',
        resetPassword: 'acceso/restablecer-contrasena'
      },
    }
  },
  mounted() {
    this.activeTab = `tab-${this.$route.params.action}`;
  },
  afterRouteUpdate() {
    this.activeTab = `tab-${this.$route.params.action}`;
  },
  methods: {
    redirect(action) {
      this.$router.push(`/acceso/${action}`)
    },
    handleHttpResponse(event) {
      this.loading = false;
      if (event.data.result.code !== 500) {
        var response = event.data.result.response
        this.operationMessage = response.msg
        this.operationMessageType = response.code
        if (response.code === "success") {
            this.$store.commit("updatePayload", response.data)
            var redirect = this.$store.getters.getAuthRouteRequested
            this.$store.commit('setAuthRouteRequested', null)
            this.$router.push(redirect ? redirect : "/inicio")
          } else {
            this.snackbar = true
            this.$store.commit("logout")
          }
      } else {
        this.snackbar = true;
        this.operationMessage = event.data.result.response.message;
        this.operationMessageType = 'error';
      }
    },
    showCapsLockMsg(e) {
      var lastChar = e.substring(e.length - 1);
      this.capsLockAlert =
        lastChar.toUpperCase() === lastChar &&
        lastChar.toLowerCase() !== lastChar;
    },
    login() {
      if (this.$refs.loginForm.validate()) {
        this.loading = true;

        var config = {
          url: this.apiUrls.login,
          method: "post",
          params: {
            username: this.username,
            password: this.password,
          }
        };
        this.$refs.axios.submit(config);
      }
    },/*
    signup() {
      if (this.$refs.signupForm.validate()) {
        this.loading = true;
        var activationUrl = window.location.href.replace(
          this.$route.path,
          "/activate-account"
        );
        var homeUrl = window.location.href.replace(
          this.$route.path,
          `${this.$store.getters.getHomeUrl}/index`
        );
        var config = {
          url: this.apiUrls.signup,
          method: "post",
          params: {
            name: this.name,
            last_name: this.last_name,
            email: this.email,
            username: this.username,
            telephone: this.telephone,
            password: this.password,
            address: this.address,
            postcode: this.postcode,
            activation_url: activationUrl,
            home_url: homeUrl,
            redirect_url: this.$store.getters.getAuthRouteRequested
              ? this.$store.getters.getAuthRouteRequested
              : homeUrl,
          }
        };
        this.$refs.axios.submit(config);
      }
    },*/
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
          params: {
            email: this.email,
            activation_url: activationUrl,
            home_url: window.location.href
          }
        };
        this.$refs.axios.submit(config);
      }
    },
    resetSignupForm() {
      this.$refs.signupForm.reset();
    },
    test() {
      console.log("Looking up postcode...");
    }
  },
  computed: {
    loginValidationMessage: function() {
      return this.loginValidationStatus
        ? "¡Todo listo!"
        : "Verifique sus datos";
    },
    loginValidationColor: function() {
      return this.loginValidationStatus ? this.$store.getters.getColorTheme : "red";
    },
    signupValidationMessage: function() {
      return this.signupValidationStatus ? "¡Todo listo!" : "Verifique los datos";
    },
    signupValidationColor: function() {
      return this.signupValidationStatus ? "indigo" : "red";
    },
    resetPasswordValidationMessage: function() {
      return this.resetPasswordValidationStatus
        ? "¡Todo listo!"
        : "Verifique los datos";
    },
    resetPasswordValidationColor: function() {
      return this.resetPasswordValidationStatus ? "indigo" : "red";
    }
  }
};
</script>

<style scoped>
  .v-tab--active {
    color: #689F38!important;
}
</style>
