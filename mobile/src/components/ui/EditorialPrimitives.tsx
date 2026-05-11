import { Ionicons } from "@expo/vector-icons";
import type React from "react";
import { Image, StyleSheet, View, type DimensionValue, type ImageSourcePropType, type StyleProp, type ViewStyle } from "react-native";
import { colors, radii, shadows, spacing } from "../../theme/editorial";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EditorialText } from "./EditorialText";
import { PressableScale } from "./PressableScale";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  action?: string;
  onAction?: () => void;
};

export function SectionHeader({ eyebrow, title, action, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        {eyebrow ? (
          <EditorialText variant="label" tone="gold" uppercase>
            {eyebrow}
          </EditorialText>
        ) : null}
        <EditorialText variant="headlineSmall" style={{ marginTop: eyebrow ? 5 : 0 }}>
          {title}
        </EditorialText>
      </View>
      {action && onAction ? (
        <PressableScale onPress={onAction} accessibilityRole="button">
          <EditorialText variant="label" tone="silver" uppercase>
            {action}
          </EditorialText>
        </PressableScale>
      ) : null}
    </View>
  );
}

type EditorialCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
};

export function EditorialCard({ children, style, elevated }: EditorialCardProps) {
  return <View style={[styles.card, elevated ? shadows.soft : null, style]}>{children}</View>;
}

type IconButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  tone?: "light" | "gold" | "muted";
  label?: string;
};

export function IconButton({ icon, onPress, tone = "light", label }: IconButtonProps) {
  const iconColor = tone === "gold" ? colors.gold : tone === "muted" ? colors.silverSoft : colors.ivory;
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <View style={styles.iconButton}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
    </PressableScale>
  );
}

type AppHeaderProps = {
  onMenuPress?: () => void;
  onBellPress?: () => void;
  onProfilePress?: () => void;
};

export function AppHeader({ onMenuPress, onBellPress, onProfilePress }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12); // Ensure at least small safe spacing

  return (
    <View style={[styles.header, { paddingTop: topPadding }]}>
      <IconButton icon="menu-outline" onPress={onMenuPress} tone="muted" label="Open menu" />
      <EditorialText variant="brand" numberOfLines={1} style={{ flex: 1, textAlign: "center" }}>
        WARDROBE IQ
      </EditorialText>
      <IconButton icon={onProfilePress ? "person-circle-outline" : "notifications-outline"} onPress={onProfilePress ?? onBellPress} tone="muted" label="Open profile" />
    </View>
  );
}

type StatTileProps = {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  detail?: string;
};

export function StatTile({ label, value, icon, detail }: StatTileProps) {
  return (
    <EditorialCard style={styles.statTile}>
      {icon ? <Ionicons name={icon} size={18} color={colors.gold} /> : null}
      <EditorialText variant="headlineSmall" style={{ marginTop: 10 }}>
        {value}
      </EditorialText>
      <EditorialText variant="label" tone="stone" uppercase style={{ marginTop: 4 }}>
        {label}
      </EditorialText>
      {detail ? (
        <EditorialText variant="caption" tone="dim" style={{ marginTop: 8 }}>
          {detail}
        </EditorialText>
      ) : null}
    </EditorialCard>
  );
}

type ProgressBarProps = {
  value: number;
  label?: string;
  detail?: string;
};

export function ProgressBar({ value, label, detail }: ProgressBarProps) {
  const width = `${Math.max(0, Math.min(100, value))}%` as DimensionValue;
  return (
    <View style={{ gap: 7 }}>
      <View style={styles.progressMeta}>
        {label ? (
          <EditorialText variant="caption" tone="ivoryMuted">
            {label}
          </EditorialText>
        ) : null}
        <EditorialText variant="caption" tone="gold">
          {Math.round(value)}%
        </EditorialText>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width }]} />
      </View>
      {detail ? (
        <EditorialText variant="caption" tone="dim">
          {detail}
        </EditorialText>
      ) : null}
    </View>
  );
}

type PaletteDotsProps = {
  colors: string[];
};

export function PaletteDots({ colors: palette }: PaletteDotsProps) {
  return (
    <View style={styles.paletteRow}>
      {palette.map((color, index) => (
        <View key={`${color}-${index}`} style={[styles.paletteDot, { backgroundColor: color }]} />
      ))}
    </View>
  );
}

type EditorialImageCardProps = {
  source: ImageSourcePropType;
  label?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  onPress?: () => void;
};

export function EditorialImageCard({ source, label, title, subtitle, badge, onPress }: EditorialImageCardProps) {
  return (
    <PressableScale onPress={onPress} accessibilityRole={onPress ? "button" : undefined} style={styles.imageCard}>
      <Image source={source} style={styles.imageCardImage} resizeMode="cover" />
      {badge ? (
        <View style={styles.imageBadge}>
          <Ionicons name="sparkles-outline" size={13} color={colors.gold} />
          <EditorialText variant="caption">{badge}</EditorialText>
        </View>
      ) : null}
      <View style={styles.imageShade} />
      <View style={styles.imageCardText}>
        {label ? (
          <EditorialText variant="label" tone="gold" uppercase>
            {label}
          </EditorialText>
        ) : null}
        <EditorialText variant="headline" style={{ marginTop: 8 }} numberOfLines={2}>
          {title}
        </EditorialText>
        {subtitle ? (
          <EditorialText variant="bodySmall" tone="ivoryMuted" style={{ marginTop: 10 }} numberOfLines={3}>
            {subtitle}
          </EditorialText>
        ) : null}
      </View>
    </PressableScale>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  header: {
    minHeight: 58,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.black,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center"
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.lg
  },
  card: {
    backgroundColor: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    overflow: "hidden"
  },
  statTile: {
    flex: 1,
    padding: spacing.lg,
    minHeight: 128
  },
  progressMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  progressTrack: {
    height: 5,
    borderRadius: radii.round,
    backgroundColor: colors.graphite,
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    borderRadius: radii.round,
    backgroundColor: colors.gold
  },
  paletteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  paletteDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)"
  },
  imageCard: {
    minHeight: 430,
    borderRadius: radii.lg,
    overflow: "hidden",
    backgroundColor: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.border
  },
  imageCardImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%"
  },
  imageShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)"
  },
  imageCardText: {
    marginTop: "auto",
    padding: spacing.xxl,
    paddingTop: 120
  },
  imageBadge: {
    position: "absolute",
    right: spacing.md,
    top: spacing.md,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    backgroundColor: "rgba(11,11,10,0.72)",
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.lg
  }
});
