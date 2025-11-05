"use client";

import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { AppProvider } from "@/lib/app-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AppProvider>{children}</AppProvider>
    </Provider>
  );
}
