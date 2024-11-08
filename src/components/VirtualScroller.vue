<template>
  <div ref="scrollContainer" class="scroll-container" @scroll="onScroll">
    <div :style="{ height: `${paddingTop}px` }"></div>

    <div
      v-for="item in visibleItems"
      :key="item.id"
      class="item"
      :style="{ height: `${itemHeight}px` }"
    >
      {{ item.id }} - {{ item.content }}
    </div>

    <div :style="{ height: `${paddingBottom}px` }"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, PropType, ref } from "vue";
import { ScrollerItem } from "../types/VirtualScroller";

const props = defineProps({
  items: {
    type: Array as PropType<ScrollerItem[]>,
    required: true,
  },
  itemHeight: {
    type: Number,
    required: true,
  },
  buffer: {
    type: Number,
    default: 5,
  },
});

const scrollContainer = ref<HTMLDivElement | null>(null);
const scrollTop = ref(0);
let animationFrameId: number | null = null;

const containerHeight = ref(0);
const visibleItemCount = computed(() => {
  return Math.ceil(containerHeight.value / props.itemHeight) + props.buffer * 2;
});

const startIndex = computed(() =>
  Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.buffer)
);

const visibleItems = computed(() => {
  return props.items.slice(startIndex.value, startIndex.value + visibleItemCount.value);
});

const paddingTop = computed(() => startIndex.value * props.itemHeight);
const paddingBottom = computed(() => {
  const totalItemsHeight = props.items.length * props.itemHeight;
  const visibleItemsHeight = (startIndex.value + visibleItemCount.value) * props.itemHeight;
  return Math.max(0, totalItemsHeight - visibleItemsHeight);
});

const onScroll = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  animationFrameId = requestAnimationFrame(() => {
    scrollTop.value = scrollContainer.value!.scrollTop;
  });
};

const updateContainerHeight = () => {
  containerHeight.value = scrollContainer.value!.clientHeight;
};

onMounted(() => {
  updateContainerHeight();
  window.addEventListener("resize", updateContainerHeight);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateContainerHeight);

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<style scoped>
.scroll-container {
  overflow-y: auto;
  height: 400px;

  border: 1px solid black;
}

.item {
  border-bottom: 1px solid #eee;
  box-sizing: border-box;
}
</style>
