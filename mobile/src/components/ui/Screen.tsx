import type React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type ViewProps } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { colors, spacing } from "../../theme/editorial";

type ScreenProps = ViewProps & {
  scroll?: boolean;
  padded?: boolean;
  bottomInset?: number;
  edges?: Edge[];
  children: React.ReactNode;
};

export function Screen({
  children,
  scroll = true,
  padded = true,
  bottomInset = 36,
  edges,
  style,
  ...props
}: ScreenProps) {
  const content = scroll ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.scrollContent, padded ? styles.padded : null, { paddingBottom: bottomInset }]}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.fixedContent, padded ? styles.padded : null, { paddingBottom: bottomInset }]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, style]} edges={edges} {...props}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboard}>
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.black
  },
  keyboard: {
    flex: 1
  },
  scrollContent: {
    paddingTop: spacing.lg
  },
  fixedContent: {
    flex: 1,
    paddingTop: spacing.lg
  },
  padded: {
    paddingHorizontal: spacing.xl
  }
});
