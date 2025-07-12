import { create } from "zustand";

const useItemStore = create((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  addItem: (item) =>
    set((state) => ({
      items: [item, ...state.items],
    })),
}));

export default useItemStore;
