import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import { chatApi } from "../../../api/chat";
import { getApiErrorMessage } from "../../../api/client";
import { Chip } from "../../../components/ui/Chip";
import { AppHeader } from "../../../components/ui/EditorialPrimitives";
import { EditorialText } from "../../../components/ui/EditorialText";
import { Screen } from "../../../components/ui/Screen";
import type { RootStackParamList } from "../../../navigation/types";
import { colors, fonts, radii, shadows, spacing } from "../../../theme/editorial";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const prompts = [
  "Explain why my cold-weather look works",
  "Improve my black blazer outfit",
  "Suggest a silver accessory",
  "What colors balance espresso tones?"
];

export function ChatScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Welcome. Ask me to refine an outfit, explain color harmony, or identify the missing piece in a silhouette."
    }
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  async function send(text = input) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const userMessage: Message = { id: `${Date.now()}-user`, role: "user", content: trimmed };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setSending(true);

    try {
      const response = await chatApi.message(trimmed);
      setMessages((current) => [...current, { id: response.id, role: "assistant", content: response.content }]);
    } catch (error) {
      setMessages((current) => [...current, { id: `${Date.now()}-error`, role: "assistant", content: getApiErrorMessage(error) }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={styles.root}>
      <AppHeader onMenuPress={() => navigation.navigate("Settings")} onProfilePress={() => navigation.navigate("Profile")} />
      <Screen scroll={false} edges={["bottom", "left", "right"]}>
        <View style={styles.hero}>
          <EditorialText variant="label" tone="gold" uppercase>
            AI Stylist Assistant
          </EditorialText>
          <EditorialText variant="headline" style={styles.title}>
            Your fashion concierge.
          </EditorialText>
          <EditorialText variant="bodySmall" tone="ivoryMuted" style={styles.subtitle}>
            Ask for proportion, color, layering, and styling intelligence through the existing chat endpoint.
          </EditorialText>
        </View>

        <View style={styles.prompts}>
          {prompts.map((prompt) => (
            <Chip key={prompt} label={prompt} onPress={() => send(prompt)} />
          ))}
        </View>

        <FlatList
          style={styles.messages}
          data={messages}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messageContent}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.role === "user" ? styles.userBubble : styles.assistantBubble]}>
              <EditorialText variant="bodySmall" tone={item.role === "user" ? "black" : "ivory"}>
                {item.content}
              </EditorialText>
            </View>
          )}
        />

        <View style={styles.inputBar}>
          <Ionicons name="sparkles-outline" color={colors.gold} size={20} />
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask what to wear..."
            placeholderTextColor={colors.dim}
            style={styles.input}
            returnKeyType="send"
            onSubmitEditing={() => send()}
          />
          <Pressable onPress={() => send()} style={styles.sendButton} disabled={sending}>
            <Ionicons name="send" color={colors.black} size={18} />
          </Pressable>
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.black
  },
  hero: {
    paddingTop: spacing.md
  },
  title: {
    marginTop: spacing.sm
  },
  subtitle: {
    marginTop: spacing.sm
  },
  prompts: {
    marginTop: spacing.xl,
    flexDirection: "row",
    flexWrap: "wrap"
  },
  messages: {
    flex: 1,
    marginTop: spacing.xl
  },
  messageContent: {
    paddingBottom: spacing.xl
  },
  bubble: {
    maxWidth: "88%",
    marginBottom: spacing.md,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.ivory,
    borderColor: colors.ivory
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.charcoal,
    borderColor: colors.border
  },
  inputBar: {
    marginBottom: spacing.md,
    minHeight: 60,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    backgroundColor: colors.glass,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    ...shadows.soft
  },
  input: {
    flex: 1,
    minHeight: 48,
    color: colors.ivory,
    fontFamily: fonts.sans,
    fontSize: 16
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gold
  }
});

