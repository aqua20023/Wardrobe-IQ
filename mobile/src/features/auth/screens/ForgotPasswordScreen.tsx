import { zodResolver } from "@hookform/resolvers/zod";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { z } from "zod";
import { authApi } from "../../../api/auth";
import { getApiErrorMessage } from "../../../api/client";
import { Button } from "../../../components/ui/Button";
import { EditorialCard } from "../../../components/ui/EditorialPrimitives";
import { EditorialText } from "../../../components/ui/EditorialText";
import { Input } from "../../../components/ui/Input";
import { Screen } from "../../../components/ui/Screen";
import { spacing } from "../../../theme/editorial";
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
      <View style={styles.hero}>
        <EditorialText variant="headline">Reset password</EditorialText>
        <EditorialText variant="body" tone="ivoryMuted" style={styles.body}>
          Enter your email and the existing account recovery endpoint will prepare the reset flow.
        </EditorialText>
      </View>

      <EditorialCard style={styles.form}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <Input label="Email" keyboardType="email-address" autoCapitalize="none" value={value} onChangeText={onChange} error={errors.email?.message} />
          )}
        />
        {errors.root?.message ? (
          <EditorialText variant="caption" tone="oxblood">
            {errors.root.message}
          </EditorialText>
        ) : null}
        {isSubmitSuccessful ? (
          <EditorialText variant="bodySmall" tone="ivoryMuted">
            If an account exists, reset instructions will be sent.
          </EditorialText>
        ) : null}
        <Button label="Send Reset Link" loading={isSubmitting} onPress={onSubmit} />
        <Button label="Back to Login" variant="ghost" onPress={() => navigation.navigate("Login")} />
      </EditorialCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: 54
  },
  body: {
    marginTop: spacing.md
  },
  form: {
    marginTop: 42,
    padding: spacing.xl,
    gap: spacing.lg
  }
});
