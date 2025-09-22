import create from 'zustand';

const useStore = create((set) => ({
  currentDevice: null,
  setCurrentDevice: (device) => set({ currentDevice: device }),
  submissions: [],
  addSubmission: (submission) => set((state) => ({ submissions: [...state.submissions, submission] })),
  user: null,
  setUser: (user) => set({ user }),
}));

export default useStore;