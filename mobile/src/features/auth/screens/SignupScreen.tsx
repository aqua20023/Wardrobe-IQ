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
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters").regex(/[A-Z]/, "Add one uppercase letter").regex(/[0-9]/, "Add one number")
});

type FormValues = z.infer<typeof schema>;
type Props = NativeStackScreenProps<AuthStackParamList, "Signup">;

export function SignupScreen({ navigation }: Props) {
  const signup = useAuthStore((state) => state.signup);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", password: "" } });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signup(values);
    } catch (error) {
      setError("root", { message: getApiErrorMessage(error) });
    }
  });

  return (
    <Screen>
      <View className="pt-10">
        <Text className="text-4xl font-semibold text-mist">Create your closet</Text>
        <Text className="mt-3 text-base leading-6 text-stone">Start with a secure account and add pieces when you are ready.</Text>
      </View>

      <View className="mt-10 gap-4">
        <Controller control={control} name="name" render={({ field: { onChange, value } }) => <Input label="Name" value={value} onChangeText={onChange} error={errors.name?.message} />} />
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
        <Button label={isSubmitting ? "Connecting to server..." : "Sign Up"} loading={isSubmitting} onPress={onSubmit} />
        {isSubmitting && <Text className="mt-1 text-center text-xs text-stone">First request may take a few seconds</Text>}
      </View>

      <Pressable className="mt-6" onPress={() => navigation.navigate("Login")}>
        <Text className="text-center font-semibold text-stone">Already have an account? Log in</Text>
      </Pressable>
    </Screen>
  );
}
