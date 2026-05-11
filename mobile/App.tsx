import "react-native-gesture-handler";
import "react-native-reanimated";
import { QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { queryClient } from "./src/api/queryClient";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { AtmosphereProvider } from "./src/providers/AtmosphereProvider";

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AtmosphereProvider>
          <StatusBar style="light" translucent />
          <RootNavigator />
        </AtmosphereProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
