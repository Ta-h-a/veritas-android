//react-native/app/services/store.js

// Try different import methods for different zustand versions
let create;
try {
  // For zustand v4+
  const zustand = require('zustand');
  create = zustand.create || zustand.default;
} catch (e) {
  // Fallback
  const zustand = require('zustand');
  create = zustand.default || zustand;
}

const useStore = create((set) => ({
  currentDevice: null,
  setCurrentDevice: (device) => set({ currentDevice: device }),
  submissions: [],
  addSubmission: (submission) => set((state) => ({ submissions: [...state.submissions, submission] })),
  user: { id: 'temp-user-id' }, // Temporary user for testing
  setUser: (user) => set({ user }),
}));

export default useStore;