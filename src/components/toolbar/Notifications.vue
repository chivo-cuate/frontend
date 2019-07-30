<template>
  <v-menu offset-y bottom :close-on-content-click="false">
    <template v-slot:activator="{ on }">
      <v-btn color="primary" class="white--text" text v-on="on">
        <v-badge id="badge_notif" ref="badge_notif" v-model="showNotificationsCount" color="red">
          <span slot="badge">{{ notificationsCount }}</span>
          <v-icon v-if="notificationsCount > 0" medium color="white">notifications_active</v-icon>
          <v-icon v-else medium color="white">notifications_none</v-icon>
        </v-badge>
      </v-btn>
    </template>

    <v-list class="general-notif-container">
      <v-card class="elevation-0">
        <template v-if="notifications.length === 0">
          <v-card-text class="text-center">
            <v-icon small class="info--text fa">warning</v-icon>No hay elementos
          </v-card-text>
        </template>

        <template v-else>
          <div v-for="(item, index) in notifications" :key="`notif-${index}`">
            <v-container
              class="text-xs-left notif-container"
              :class="selectedNotifications.indexOf(index) >= 0 ? 'selected' : ''"
            >
              <v-layout row wrap>
                <v-flex xs12>
                  <v-layout row wrap>
                    <v-flex xs12 @click="selectNotification(index)">
                      <span class="primary--text notif-title" v-html="item.title"></span>
                      <a class="notif-dismiss" @click="deleteNotification(index)">
                        <v-tooltip left>
                          <template v-slot:activator="{ on }">
                            <v-progress-circular
                              size="15"
                              :width="2"
                              v-if="item.deleting"
                              indeterminate
                              color="primary"
                              v-on="on"
                              class="red--text"
                            ></v-progress-circular>
                            <v-icon small v-else v-on="on" class="red--text">delete</v-icon>
                          </template>
                          <span>Remove</span>
                        </v-tooltip>
                      </a>
                      <v-tooltip
                        left
                        v-if="selectedNotifications.indexOf(index) >= 0"
                        class="red--text notif-check"
                      >
                        <template v-slot:activator="{ on }">
                          <v-icon small slot="activator" v-on="on">check_box</v-icon>
                        </template>
                        <span>Unselect</span>
                      </v-tooltip>
                      <v-tooltip left v-else class="grey--text notif-check">
                        <template v-slot:activator="{ on }">
                          <v-icon small slot="activator" v-on="on">check_box_outline_blank</v-icon>
                        </template>
                        <span>Select</span>
                      </v-tooltip>
                    </v-flex>
                  </v-layout>
                  <v-layout row wrap>
                    <v-flex xs6>
                      <span class="notif-text grey--text">
                        <v-icon small>today</v-icon>
                        <span v-html="item.created_at"></span>
                      </span>
                    </v-flex>
                    <v-flex xs6>
                      <span style="float:right;" class="notif-text grey--text">
                        <i v-html="item.headline"></i>
                        <i v-html="' ago'"></i>
                      </span>
                    </v-flex>
                  </v-layout>
                  <v-layout row wrap>
                    <v-flex xs12 class="notif-content">
                      <span v-html="item.subtitle"></span>
                    </v-flex>
                  </v-layout>
                </v-flex>
              </v-layout>
            </v-container>
            <v-divider :key="`notif-divider-${index}`"></v-divider>
          </div>

          <v-list-tile>
            <v-list-tile-content>
              <v-layout>
                <v-flex lg6>
                  <v-btn small text color="info" style="margin-top: 10px;">
                    <v-icon small>room_service</v-icon>View all
                  </v-btn>
                </v-flex>
              </v-layout>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-layout row>
                <v-flex lg12>
                  <v-btn
                    @click="deleteNotifications()"
                    small
                    :disabled="selectedNotifications.length < 1 || deletingNotifications"
                    color="error"
                  >
                    <v-progress-circular
                      size="15"
                      :width="2"
                      v-if="deletingNotifications"
                      indeterminate
                      color="gray"
                      class="white--text"
                    ></v-progress-circular>
                    <v-icon size="large" v-else>notifications_off</v-icon>
                  </v-btn>
                </v-flex>
              </v-layout>
            </v-list-tile-action>
          </v-list-tile>
        </template>
      </v-card>
    </v-list>
  </v-menu>
</template>

<script>
import classList from "classlist";

export default {
  data() {
    return {
      loadingNotifications: false,
      deletingNotifications: false,
      showNotificationsCount: false,
      notificationsCount: 0,
      notifications: [],
      selectedNotifications: [],
      audioPlayer: null,
      axios: null
    };
  },
  props: ['axiosComp'],
  mounted() {
    /*this.toggleGetNotifications(this.$store.getters.isGuest);
    this.$store.watch(
      (state, getters) => getters.isGuest,
      (newValue, oldValue) => {
        this.toggleGetNotifications(newValue);
      }
    );*/
  },
  methods: {
    setAxios(axios){
      this.axios = axios
    },
    toggleGetNotifications(isGuest) {
      this.clearNotifications();
      if (isGuest) {
        clearInterval(this.timer);
      } else {
        this.updateNotifications();
        this.timer = setInterval(this.updateNotifications, 5000);
      }
    },
    initAudioPlayer() {
      if (!this.audioPlayer) {
        this.audioPlayer = new Audio(this.$store.getters.getBeepFile);
      }
    },
    playNotifSound() {
      this.initAudioPlayer();
      this.audioPlayer.play();
    },
    updateNotifications() {
      if (
        !this.$store.getters.isGuest &&
        !this.loadingNotifications &&
        !this.deletingNotifications
      ) {
        this.getNotifications();
      }
    },
    handleHttpResponse(event) {
      this.loading = false;

      if (event.data.result.code === 200) {
        let response = event.data.result.response;
        this.operationMessage = response.msg;
        this.operationMessageType = response.code;
        let action = event.url.substring(event.url.lastIndexOf("/") + 1);

        switch (action) {
          case "get-notifications":
            this.loadingNotifications = false;

            if (response.code === "success") {
              let newNotifications = response.data.notif.items;
              let notifsCount = response.data.notif.count;

              var newNotif = false;
              for (var i in newNotifications) {
                var newNotification = newNotifications[i];
                var notifIndex = -1;
                for (var j in this.notifications) {
                  if (this.notifications[j].id === newNotification.id) {
                    notifIndex = j;
                    break;
                  }
                }
                if (notifIndex < 0) {
                  this.notifications.push(newNotification);
                  newNotif = true;
                  this.showNotificationsCount = true;
                } else {
                  this.notifications[notifIndex].headline =
                    newNotification.headline;
                }
              }
              if (newNotif) {
                this.notifications.sort(function(a, b) {
                  return b.id - a.id;
                });
                if (!this.$store.getters.isGuest) {
                  this.playNotifSound();
                  var badge_notif = document.getElementById("badge_notif");
                  var list = classList(badge_notif);
                  list.add("animated");
                  list.add("rubberBand");
                }
              }
              this.notificationsCount = this.notifications.length;
            } else {
              this.snackbar = true;
            }
            break;
          case "delete-notifications":
            this.deletingNotifications = false;
            this.selectedNotifications = [];
            if (response.code === "success") {
              this.notifications = response.data.notif.items;
              this.notificationsCount = response.data.notif.count;
              this.showNotificationsCount = (this.notificationsCount > 0);
            } else {
              this.snackbar = true;
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
    },
    deleteNotification(index) {
      this.notifications[index].deleting = true;
      this.selectNotification(index);
      this.deleteNotifications();
    },
    deleteNotifications() {
      this.deletingNotifications = true;
      let params = [];
      this.selectedNotifications.forEach(element => {
        params.push(this.notifications[element].id);
      });
      let config = {
        method: "post",
        url: "delete-notifications",
        params: { data: params }
      };
      this.axios.submit(config);
    },
    selectNotification(index) {
      const i = this.selectedNotifications.indexOf(index);
      if (i > -1) {
        this.selectedNotifications.splice(i, 1);
      } else {
        this.selectedNotifications.push(index);
      }
    },
    getNotifications() {
      this.loadingNotifications = true;
      let config = {
        url: "get-notifications",
        params: {}
      };
      this.axios.submit(config);
    },
    clearNotifications() {
      this.notifications = [];
      this.notificationsCount = 0;
      this.showNotificationsCount = false;
      this.selectedNotifications = [];
    },
    logout() {
      clearInterval(this.timer);
      this.$store.commit("logout");
      this.$router.push("/acceso/iniciar-sesion");
    }
  },
  computed: {
    notificationsCountClass() {
      return this.showNotificationsCount ? "animated rubberBand" : "";
    }
  }
};
</script>

<style scoped>
a {
  text-decoration: none;
}
.white--text {
  margin-left: 5px;
}
.bold {
  font-weight: bold;
}
.not-bold {
  font-weight: normal;
}
.general-notif-container {
  padding: 0 7px;
  min-width: 360px;
  max-width: 360px;
  max-height: 400px;
  overflow-y: scroll;
  background-color: #fff;
  border: 4px solid #ddd;
}
.notif-container {
  padding: 5px;
  margin-bottom: 5px;
  font-size: 12px;
}
.selected {
  background-color: #fce8e6;
}
.notif-title {
  font-weight: bold;
}
.notif-title,
.notif-check {
  cursor: pointer;
}
.notif-check {
  position: absolute;
  margin-top: 3px;
  right: 5px;
}
.notif-dismiss {
  position: absolute;
  margin-top: 3px;
  right: 25px;
}
.menu-notif-container {
  margin-top: 14px;
}
</style>
