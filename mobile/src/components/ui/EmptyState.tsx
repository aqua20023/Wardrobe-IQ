import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { colors, radii, spacing } from "../../theme/editorial";
import { Button } from "./Button";
import { EditorialText } from "./EditorialText";

type EmptyStateProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon = "shirt-outline", title, body, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={28} color={colors.gold} />
      </View>
      <EditorialText variant="headlineSmall" style={styles.title}>
        {title}
      </EditorialText>
      {body ? (
        <EditorialText variant="bodySmall" tone="stone" style={styles.body}>
          {body}
        </EditorialText>
      ) : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.charcoal,
    paddingHorizontal: spacing.xl,
    paddingVertical: 44
  },
  icon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderWarm,
    backgroundColor: "rgba(228,191,114,0.08)"
  },
  title: {
    marginTop: spacing.lg,
    textAlign: "center"
  },
  body: {
    marginTop: spacing.sm,
    textAlign: "center"
  },
  action: {
    marginTop: spacing.xl,
    width: "100%"
  }
});
