<template>
    <v-dialog v-model="visible" :width="width" persistent>
        <v-card>
            <v-card-title
            :class="`headline ${$store.getters.getThemeColor} white--text`"
            primary-title
            >{{ title }}</v-card-title>
            <v-card-text>
                <v-container grid-list-md>
                    <v-layout wrap>
                        <v-flex xs12>
                            <v-card-text>{{ question }}</v-card-text>
                            <v-card-text v-if="chip">
                            <v-chip class="error">
                                <v-icon color="white" medium left>attach_money</v-icon>
                                {{chip}}
                            </v-chip>
                            </v-card-text>
                            <v-card-text>¿Confirma que desea continuar?</v-card-text>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
                :disabled="processing"
                :color="$store.getters.getThemeColor"
                text
                @click="$emit('yes')"
            >
                <v-progress-circular
                    v-if="processing"
                    :size="15"
                    :width="1"
                    indeterminate
                    class="v-icon"
                ></v-progress-circular>
                <span>Continuar</span>
            </v-btn>
            <v-btn color="error" text @click="$emit('no')">Cancelar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>

export default {
  props: ['visible', 'width', 'title', 'question', 'chip', 'processing'],
};
</script>
