import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  setAuthUser: (userData) => set({ user: userData }),
}));

export default useAuthStore;
