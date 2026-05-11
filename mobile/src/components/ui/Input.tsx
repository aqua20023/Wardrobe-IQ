import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { colors, fonts, radii, spacing } from "../../theme/editorial";
import { EditorialText } from "./EditorialText";

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function Input({ label, error, placeholderTextColor = colors.dim, style, ...props }: InputProps) {
  return (
    <View style={styles.wrapper}>
      {label ? (
        <EditorialText variant="label" tone="stone" uppercase>
          {label}
        </EditorialText>
      ) : null}
      <TextInput
        placeholderTextColor={placeholderTextColor}
        selectionColor={colors.gold}
        style={[styles.input, props.multiline ? styles.multiline : null, style]}
        {...props}
      />
      {error ? (
        <EditorialText variant="caption" tone="oxblood">
          {error}
        </EditorialText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm
  },
  input: {
    minHeight: 52,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.charcoal,
    paddingHorizontal: spacing.lg,
    color: colors.ivory,
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 22
  },
  multiline: {
    minHeight: 96,
    paddingTop: spacing.lg,
    textAlignVertical: "top"
  }
});
