import { reactive } from 'vue';

const state = reactive({
  items: [],
});

let nextId = 0;

function notify(type, message, title = '') {
  const id = ++nextId;
  state.items.push({ id, type, message, title });

  window.setTimeout(() => {
    const index = state.items.findIndex((item) => item.id === id);
    if (index !== -1) state.items.splice(index, 1);
  }, 4500);
}

export function useToast() {
  return {
    state,
    warning: (message, title) => notify('warning', message, title),
    error: (message, title) => notify('error', message, title),
    success: (message, title) => notify('success', message, title),
    dismiss: (id) => {
      const index = state.items.findIndex((item) => item.id === id);
      if (index !== -1) state.items.splice(index, 1);
    },
  };
}
