import type React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View, type ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = ViewProps & {
  scroll?: boolean;
  padded?: boolean;
  children: React.ReactNode;
};

export function Screen({ children, scroll = true, padded = true, className = "", ...props }: ScreenProps) {
  const content = scroll ? (
    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 32 }}>
      <View className={padded ? "px-5" : ""}>{children}</View>
    </ScrollView>
  ) : (
    <View className={`flex-1 ${padded ? "px-5" : ""}`}>{children}</View>
  );

  return (
    <SafeAreaView className={`flex-1 bg-ink ${className}`} {...props}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
