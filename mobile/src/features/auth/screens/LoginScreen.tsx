import { zodResolver } from "@hookform/resolvers/zod";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { z } from "zod";
import { getApiErrorMessage } from "../../../api/client";
import { Button } from "../../../components/ui/Button";
import { EditorialCard } from "../../../components/ui/EditorialPrimitives";
import { EditorialText } from "../../../components/ui/EditorialText";
import { Input } from "../../../components/ui/Input";
import { PressableScale } from "../../../components/ui/PressableScale";
import { Screen } from "../../../components/ui/Screen";
import { useAuthStore } from "../../../stores/authStore";
import { colors, spacing } from "../../../theme/editorial";
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
      <View style={styles.hero}>
        <EditorialText variant="brand" style={styles.brand}>
          WARDROBE IQ
        </EditorialText>
        <EditorialText variant="headline" style={styles.title}>
          Welcome back to the archive.
        </EditorialText>
        <EditorialText variant="body" tone="ivoryMuted" style={styles.body}>
          Sign in to continue curating your wardrobe intelligence.
        </EditorialText>
      </View>

      <EditorialCard style={styles.form} elevated>
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
        {errors.root?.message ? (
          <EditorialText variant="caption" tone="oxblood">
            {errors.root.message}
          </EditorialText>
        ) : null}
        <Button label={isSubmitting ? "Connecting to server..." : "Log In"} loading={isSubmitting} onPress={onSubmit} />
        {isSubmitting ? (
          <EditorialText variant="caption" tone="dim" style={styles.center}>
            First request may take a few seconds
          </EditorialText>
        ) : null}
      </EditorialCard>

      <View style={styles.links}>
        <PressableScale onPress={() => navigation.navigate("ForgotPassword")}>
          <EditorialText variant="caption" tone="silver" uppercase>
            Forgot password?
          </EditorialText>
        </PressableScale>
        <PressableScale onPress={() => navigation.navigate("Signup")}>
          <EditorialText variant="caption" tone="gold" uppercase>
            Create account
          </EditorialText>
        </PressableScale>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: spacing.xxl
  },
  brand: {
    textAlign: "center"
  },
  title: {
    marginTop: 42
  },
  body: {
    marginTop: spacing.md
  },
  form: {
    marginTop: 42,
    padding: spacing.xl,
    gap: spacing.lg
  },
  center: {
    textAlign: "center"
  },
  links: {
    marginTop: spacing.xl,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xl
  }
});
