import { zodResolver } from "@hookform/resolvers/zod";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { z } from "zod";
import { getApiErrorMessage } from "../../../api/client";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Screen } from "../../../components/ui/Screen";
import { useAuthStore } from "../../../stores/authStore";
import type { AuthStackParamList } from "../../../navigation/types";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required")
});

type FormValues = z.infer<typeof schema>;
type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const login = useAuthStore((state) => state.login);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values);
    } catch (error) {
      setError("root", { message: getApiErrorMessage(error) });
    }
  });

  return (
    <Screen>
      <View className="pt-10">
        <Text className="text-sm uppercase text-brass">Wardrobe IQ</Text>
        <Text className="mt-4 text-4xl font-semibold text-mist">Welcome back</Text>
        <Text className="mt-3 text-base leading-6 text-stone">Sign in to continue building your wardrobe system.</Text>
      </View>

      <View className="mt-10 gap-4">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <Input label="Email" keyboardType="email-address" autoCapitalize="none" value={value} onChangeText={onChange} error={errors.email?.message} />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <Input label="Password" secureTextEntry value={value} onChangeText={onChange} error={errors.password?.message} />
          )}
        />
        {errors.root?.message ? <Text className="text-sm text-oxblood">{errors.root.message}</Text> : null}
        <Button label="Log In" loading={isSubmitting} onPress={onSubmit} />
      </View>

      <View className="mt-6 flex-row justify-between">
        <Pressable onPress={() => navigation.navigate("ForgotPassword")}>
          <Text className="font-semibold text-stone">Forgot password?</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate("Signup")}>
          <Text className="font-semibold text-mist">Create account</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
