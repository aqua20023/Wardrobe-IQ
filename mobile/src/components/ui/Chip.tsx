import { StyleSheet } from "react-native";
import { colors, radii, spacing } from "../../theme/editorial";
import { EditorialText } from "./EditorialText";
import { PressableScale } from "./PressableScale";

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  compact?: boolean;
};

export function Chip({ label, selected, onPress, compact }: ChipProps) {
  return (
    <PressableScale
      onPress={onPress}
      style={[styles.chip, compact ? styles.compact : null, selected ? styles.selected : styles.idle]}
      accessibilityRole="button"
    >
      <EditorialText variant="caption" uppercase tone={selected ? "black" : "ivoryMuted"} style={styles.text}>
        {label}
      </EditorialText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    marginRight: spacing.sm,
    marginTop: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10
  },
  compact: {
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  selected: {
    borderColor: colors.ivory,
    backgroundColor: colors.ivory
  },
  idle: {
    borderColor: colors.border,
    backgroundColor: colors.charcoalHigh
  },
  text: {
    textAlign: "center"
  }
});
