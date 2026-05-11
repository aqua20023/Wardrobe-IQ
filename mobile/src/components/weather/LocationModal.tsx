import React, { useState } from "react";
import { 
  Modal, 
  View, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  Pressable, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { locationApi, type GeoLocation } from "../../api/location";
import { useWeatherStore } from "../../stores/weatherStore";
import { EditorialText } from "../ui/EditorialText";
import { colors, radii, spacing, fonts } from "../../theme/editorial";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function LocationPickerModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { isGpsEnabled, setManualLocation, useGps } = useWeatherStore();
  
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.trim().length < 3) {
      setResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const data = await locationApi.searchLocations(text);
      setResults(data);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = async (loc: GeoLocation) => {
    await setManualLocation(loc);
    onClose();
    setQuery("");
    setResults([]);
  };

  const handleEnableGps = async () => {
    await useGps();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill}>
          <View style={[styles.overlay, { paddingTop: insets.top + 40 }]}>
            <View style={styles.content}>
              <View style={styles.header}>
                <EditorialText variant="headlineSmall">Set Destination</EditorialText>
                <Pressable onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={22} color={colors.ivory} />
                </Pressable>
              </View>

              <View style={styles.searchBox}>
                <Ionicons name="search-outline" size={20} color={colors.dim} />
                <TextInput
                  placeholder="Search city... e.g. Paris"
                  placeholderTextColor={colors.dim}
                  style={styles.input}
                  value={query}
                  onChangeText={handleSearch}
                  autoFocus
                />
                {isSearching && <ActivityIndicator size="small" color={colors.gold} />}
              </View>

              {!query && (
                <Pressable 
                  style={[styles.actionRow, isGpsEnabled && styles.activeRow]} 
                  onPress={handleEnableGps}
                >
                  <Ionicons 
                    name="navigate" 
                    size={18} 
                    color={isGpsEnabled ? colors.gold : colors.ivory} 
                  />
                  <EditorialText 
                    variant="body" 
                    style={{ marginLeft: 12, flex: 1 }}
                    tone={isGpsEnabled ? "gold" : "ivory"}
                  >
                    Use Current Location (GPS)
                  </EditorialText>
                  {isGpsEnabled && <Ionicons name="checkmark-circle" size={18} color={colors.gold} />}
                </Pressable>
              )}

              <FlatList
                data={results}
                keyExtractor={(item, i) => `${item.latitude}-${i}`}
                contentContainerStyle={styles.list}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <Pressable 
                    style={styles.resultItem}
                    onPress={() => handleSelectLocation(item)}
                  >
                    <Ionicons name="location-outline" size={18} color={colors.silverSoft} />
                    <View style={{ marginLeft: 12 }}>
                      <EditorialText variant="body">{item.city}</EditorialText>
                      {item.country && (
                        <EditorialText variant="caption" tone="dim">{item.country}</EditorialText>
                      )}
                    </View>
                  </Pressable>
                )}
                ListEmptyComponent={
                  query.length > 2 && !isSearching ? (
                    <EditorialText variant="caption" tone="dim" style={styles.empty}>
                      No matching locations found.
                    </EditorialText>
                  ) : null
                }
              />
            </View>
          </View>
        </BlurView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  content: {
    backgroundColor: colors.charcoal,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: "70%",
    overflow: "hidden"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  closeBtn: {
    padding: 4
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    height: 54,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  input: {
    flex: 1,
    marginLeft: 12,
    color: colors.ivory,
    fontFamily: fonts.sans,
    fontSize: 16,
  },
  list: {
    paddingBottom: spacing.xl
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.02)"
  },
  activeRow: {
    backgroundColor: "rgba(212, 175, 55, 0.05)"
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border
  },
  empty: {
    textAlign: "center",
    padding: spacing.xl
  }
});
