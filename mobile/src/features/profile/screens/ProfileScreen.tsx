import { useState } from "react";
import { Switch, Text, View } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { getApiErrorMessage } from "../../../api/client";
import { usersApi } from "../../../api/users";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Screen } from "../../../components/ui/Screen";
import { useAuthStore } from "../../../stores/authStore";

export function ProfileScreen() {
  const { user, logout, refreshProfile } = useAuthStore();
  const [name, setName] = useState(user?.name ?? "");
  const [preferredColors, setPreferredColors] = useState(user?.preferences?.preferredColors?.join(", ") ?? "");
  const [climate, setClimate] = useState(user?.preferences?.climate ?? "");
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.preferences?.notificationsEnabled ?? true);
  const [message, setMessage] = useState<string | null>(null);

  const updateProfile = useMutation({
    mutationFn: async () => {
      await usersApi.updateProfile({ name });
      await usersApi.updatePreferences({
        preferredColors: preferredColors.split(",").map((color) => color.trim()).filter(Boolean),
        climate,
        notificationsEnabled
      });
    },
    onSuccess: async () => {
      await refreshProfile();
      setMessage("Profile updated.");
    },
    onError: (error) => setMessage(getApiErrorMessage(error))
  });

  return (
    <Screen>
      <Text className="text-3xl font-semibold text-mist">Profile</Text>
      <Text className="mt-2 text-base leading-6 text-stone">{user?.email}</Text>

      <View className="mt-7 rounded-lg border border-graphite bg-charcoal p-5">
        <Text className="text-xs uppercase text-stone">Account</Text>
        <Text className="mt-2 text-2xl font-semibold text-mist">{user?.name}</Text>
      </View>

      <View className="mt-6 gap-4">
        <Input label="Name" value={name} onChangeText={setName} />
        <Input label="Preferred colors" value={preferredColors} onChangeText={setPreferredColors} placeholder="black, ivory, olive" />
        <Input label="Climate" value={climate} onChangeText={setClimate} placeholder="warm, rainy, mixed" />
        <View className="flex-row items-center justify-between rounded-lg border border-graphite bg-charcoal px-4 py-4">
          <View>
            <Text className="font-semibold text-mist">Notifications</Text>
            <Text className="mt-1 text-sm text-stone">Daily outfit jobs are API-ready.</Text>
          </View>
          <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ false: "#2a2a2d", true: "#b59b68" }} thumbColor="#f4f4f1" />
        </View>
        {message ? <Text className="text-sm text-stone">{message}</Text> : null}
        <Button label="Save Preferences" loading={updateProfile.isPending} onPress={() => updateProfile.mutate()} />
        <Button label="Logout" variant="secondary" icon="log-out-outline" onPress={logout} />
      </View>
    </Screen>
  );
}
