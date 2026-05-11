import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { colors, radii, spacing } from "../../theme/editorial";
import { EditorialText } from "./EditorialText";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
};

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Ionicons name={icon} size={18} color={colors.gold} />
      <EditorialText variant="headlineSmall" style={styles.value}>
        {value}
      </EditorialText>
      <EditorialText variant="label" tone="stone" uppercase>
        {label}
      </EditorialText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.charcoal,
    padding: spacing.lg,
    minHeight: 124
  },
  value: {
    marginTop: spacing.md
  }
});
