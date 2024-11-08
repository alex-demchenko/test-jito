<template>
  <div><button v-for="button in buttons"></button></div>
</template>

<script setup lang="ts">
import { debounce } from "lodash";
import { ref } from "vue";

const buttons = ref([]);

const updateButtons = debounce((newButtons) => {
  buttons.value = newButtons;
}, 100);

ws.on("message", (update) => {
  updateButtons(update.buttons);
});
</script>
