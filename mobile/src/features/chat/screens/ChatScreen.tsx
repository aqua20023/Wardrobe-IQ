import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { chatApi } from "../../../api/chat";
import { getApiErrorMessage } from "../../../api/client";
import { Chip } from "../../../components/ui/Chip";
import { Screen } from "../../../components/ui/Screen";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const prompts = ["Suggest a casual outfit", "What should I wear today?", "Suggest formal look"];

export function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Ask for outfit ideas here. NLP is not enabled yet, but the API contract is ready."
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
    <Screen scroll={false}>
      <View className="flex-1 pt-3">
        <Text className="text-3xl font-semibold text-mist">Style chat</Text>
        <Text className="mt-2 text-base leading-6 text-stone">Prompt surface for future NLP recommendations.</Text>

        <View className="mt-4 flex-row flex-wrap">
          {prompts.map((prompt) => (
            <Chip key={prompt} label={prompt} onPress={() => send(prompt)} />
          ))}
        </View>

        <FlatList
          className="mt-5 flex-1"
          data={messages}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View className={`mb-3 max-w-[86%] rounded-lg px-4 py-3 ${item.role === "user" ? "self-end bg-mist" : "self-start bg-charcoal"}`}>
              <Text className={`text-base leading-6 ${item.role === "user" ? "text-ink" : "text-mist"}`}>{item.content}</Text>
            </View>
          )}
        />

        <View className="mb-3 flex-row items-center gap-3 rounded-full border border-graphite bg-charcoal px-4 py-2">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask what to wear..."
            placeholderTextColor="#8f8a82"
            className="min-h-[44px] flex-1 text-base text-mist"
            returnKeyType="send"
            onSubmitEditing={() => send()}
          />
          <Pressable onPress={() => send()} className="h-10 w-10 items-center justify-center rounded-full bg-mist" disabled={sending}>
            <Ionicons name="send" color="#0b0b0c" size={18} />
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
