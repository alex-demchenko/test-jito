<template>
  <div v-if="isPending">Loading...</div>
  <div v-else-if="isError" class="text-red-500">Error while receiving data</div>
  <template v-else>
    <VirtualScroller :items="scrollItems" :item-height="30" />

    <div class="flex gap-4">
      <button
        class="px-2 py-1 border border-orange-400 rounded-md hover:bg-slate-200"
        @click="onAdd"
      >
        Add
      </button>
      <button
        class="px-2 py-1 border border-orange-400 rounded-md hover:bg-slate-200"
        @click="onRefetch"
      >
        Refetch
      </button>
    </div>
  </template>
</template>

<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed } from "vue";
import { BE_URL, USER_ID } from "../constants";
import { Todo } from "../types/Todo";
import { ScrollerItem } from "../types/VirtualScroller";
import VirtualScroller from "./VirtualScroller.vue";

const QUERY_KEY = "todos";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const { isPending, isError, data } = useQuery<Todo[]>({
  queryKey: [QUERY_KEY],
  queryFn: () =>
    fetch(`${BE_URL}/todos`)
      .then((response) => response.json())
      .then((json) => {
        if (!json || !Array.isArray(json)) {
          throw new Error("Data is not in an array format");
        }

        return json;
      }),
});

const scrollItems = computed(() =>
  data.value?.map((todo: Todo) => ({ id: todo.id, content: todo.title } as ScrollerItem))
);

const queryClient = useQueryClient();

const addTodoMutation = useMutation({
  mutationFn: (newTodo: Todo) =>
    fetch(`${BE_URL}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newTodo, userId: USER_ID }),
    })
      .then((response) => response.json())
      .then((response) => {
        // Simulate long response from the server
        return sleep(2000).then(() => response);
      }),

  // Optimistic update
  onMutate: async (newTodo: Todo) => {
    await queryClient.cancelQueries({ queryKey: [QUERY_KEY] });

    const previousTodos = queryClient.getQueryData([QUERY_KEY]);

    // Update cache with a new todo
    queryClient.setQueryData([QUERY_KEY], (oldTodos: Todo[]) => [
      ...oldTodos,
      { ...newTodo, id: Date.now() },
    ]);

    return { previousTodos };
  },

  onError: (error, newTodo, context) => {
    if (context?.previousTodos) {
      // Rollback data to a state before optimistic update
      queryClient.setQueryData([QUERY_KEY], context.previousTodos);
    }
  },

  // Invalidate data to receive fresh data after optimistic update
  onSettled: () => {
    queryClient.invalidateQueries(QUERY_KEY);
  },
});

const onAdd = () => {
  addTodoMutation.mutate({ title: "New todo" });
};

const onRefetch = () => {
  queryClient.invalidateQueries(QUERY_KEY);
};
</script>
