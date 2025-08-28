import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';

const persistedUser = JSON.parse(localStorage.getItem("user") || "null");

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
  preloadedState: {
    user: { user: persistedUser },
  },
});

store.subscribe(() => {
  const u = store.getState().user.user;
  if (u) localStorage.setItem("user", JSON.stringify(u));
  else localStorage.removeItem("user");
});

export default store;