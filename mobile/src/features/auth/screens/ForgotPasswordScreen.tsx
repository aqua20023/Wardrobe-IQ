import { zodResolver } from "@hookform/resolvers/zod";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { z } from "zod";
import { authApi } from "../../../api/auth";
import { getApiErrorMessage } from "../../../api/client";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Screen } from "../../../components/ui/Screen";
import type { AuthStackParamList } from "../../../navigation/types";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type FormValues = z.infer<typeof schema>;
type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

export function ForgotPasswordScreen({ navigation }: Props) {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitSuccessful, isSubmitting }
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  const onSubmit = handleSubmit(async ({ email }) => {
    try {
      await authApi.forgotPassword(email);
    } catch (error) {
      setError("root", { message: getApiErrorMessage(error) });
    }
  });

  return (
    <Screen>
      <View className="pt-10">
        <Text className="text-4xl font-semibold text-mist">Reset password</Text>
        <Text className="mt-3 text-base leading-6 text-stone">Enter your email and we will prepare a reset flow for your account.</Text>
      </View>

      <View className="mt-10 gap-4">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <Input label="Email" keyboardType="email-address" autoCapitalize="none" value={value} onChangeText={onChange} error={errors.email?.message} />
          )}
        />
        {errors.root?.message ? <Text className="text-sm text-oxblood">{errors.root.message}</Text> : null}
        {isSubmitSuccessful ? <Text className="text-sm leading-5 text-stone">If an account exists, reset instructions will be sent.</Text> : null}
        <Button label="Send Reset Link" loading={isSubmitting} onPress={onSubmit} />
        <Button label="Back to Login" variant="ghost" onPress={() => navigation.navigate("Login")} />
      </View>
    </Screen>
  );
}
