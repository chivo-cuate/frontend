<template>
  <v-menu offset-y bottom :close-on-content-click="false" open-on-hover>
    <template v-slot:activator="{ on }">
      <v-btn color="primary" class="white--text" text v-on="on">
        <v-badge overlap color="red" :class="compNotifAnimation">
          <template v-if="compShowNotifBadge" v-slot:badge>{{ compNotificationsCount }}</template>
          <v-icon v-if="compShowNotifBadge" medium color="white">notifications_active</v-icon>
          <v-icon v-else medium color="white">notifications_none</v-icon>
        </v-badge>
      </v-btn>
    </template>

    <v-card class="general-notif-container pa-0">
      <v-list>
        <template v-if="compNotificationsCount > 0">
          <v-list-item v-for="(item, index) in notifications" :key="`notif-${index}`">
            <v-container>
              <v-layout row wrap>
                <v-flex>
                  <span class="success--text body-2" v-html="item.title"></span>
                </v-flex>
              </v-layout>
              <v-layout row wrap class="caption grey--text">
                <v-flex xs6>
                  <span>
                    <v-icon small>today</v-icon>
                    <span v-html="item.created_at"></span>
                  </span>
                </v-flex>
                <v-flex xs6 class="text-right">
                  <span>
                    <i v-html="'Hace '"></i>
                    <i v-html="item.headline"></i>
                  </span>
                </v-flex>
              </v-layout>
              <v-layout row wrap class="caption">
                <v-flex xs12>
                  <span v-html="item.subtitle"></span>
                </v-flex>
                <div class="divider"></div>
              </v-layout>
            </v-container>
          </v-list-item>

          <v-list-item>
            <v-container>
              <v-layout row wrap>
                <v-flex class="text-right">
                  <v-btn
                    @click="clearNotifications()"
                    text
                    small
                    :disabled="deletingNotifications"
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
                    <v-icon medium v-else>notifications_off</v-icon>
                  </v-btn>
                </v-flex>
              </v-layout>
            </v-container>
          </v-list-item>
        </template>

        <template v-else>
          <v-list-item>
            <v-container>
              <v-layout row wrap>
                <v-flex class="text-center success--text">
                  <v-icon class="success--text" small>warning</v-icon>No hay elementos.
                </v-flex>
              </v-layout>
            </v-container>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script>
import classList from "classlist";
import Speech from "speak-tts";

export default {
  data() {
    return {
      deletingNotifications: false,
      selectedNotifications: [],
      newNotifications: [],
      notifications: [],
      speech: null,
      voice: null
    };
  },
  mounted() {
    this.initSpeech();
    this.$root.$on("setNotifications", event => {
      this.setNewNotifications(event);
    });
    this.$root.$on("resetNotifications", event => {
      this.clearNotifications();
    });
  },
  /*watch: {
    notifications(newValue, oldValue) {}
  },*/
  methods: {
    setNewNotifications(receivedNotifications) {
      this.newNotifications = [];
      receivedNotifications.forEach(notification => {
        let notificationIndex = this.getNotificationIndex(notification);
        if (notificationIndex === -1) {
          this.newNotifications.push(notification);
        }
      });
      this.notifications = receivedNotifications;
      this.newNotifications.forEach(newNotification => {
        this.notifyUser(newNotification.subtitle);
      });
    },

    getNotificationIndex(notification) {
      return this.notifications.findIndex(obj => obj.id === notification.id);
    },

    initSpeech() {
      this.speech = new Speech();
      let that = this;
      if (this.speech.hasBrowserSupport()) {
        this.speech
          .init()
          .then(data => {
            let available_voices = window.speechSynthesis.getVoices();
            for (var i = 0; i < available_voices.length; i++) {
              if (available_voices[i].lang === "es-MX") {
                that.bestVoice = available_voices[i];
                break;
              }
            }
            that.bestVoice = that.bestVoice
              ? that.bestVoice
              : available_voices[0];
            that.speech.setLanguage(this.bestVoice.lang);
            that.speech.setVoice(this.bestVoice.name);
            that.speech.setRate(0.6);
            that.speech.setVolume(1);
          })
          .catch(e => {
            console.error("An error occured while initializing speech: ", e);
          });
      }
    },

    notifyUser(text) {
      let audioPlayer = new Audio("assets/snd/notif.mp3");
      let that = this;
      audioPlayer.onended = function() {
        if (that.speech.hasBrowserSupport()) {
          that.textToSpeech(text);
        }
      };
      audioPlayer.play();
    },

    textToSpeech(text) {
      this.speech.speak({ text: text });
    },

    clearNotifications() {
      this.notifications = [];
    }
  },
  computed: {
    compNotificationsCount() {
      return this.notifications.length;
    },

    compShowNotifBadge() {
      return this.notifications.length > 0;
    },

    compNotifAnimation() {
      return this.compNotificationsCount > 0 ? "animated rubberBand" : "";
    }
  }
};
</script>

<style scoped>
.white--text {
  margin-left: 5px;
}

.general-notif-container {
  min-width: 300px;
  max-width: 300px;
  max-height: 300px;
  overflow-y: scroll;
  background-color: #fff;
  border: 4px solid #ddd;
}

.divider {
  width: 100%;
  height: 1px;
  background-color: rgb(218, 218, 218);
}
</style>
