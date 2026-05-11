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
import { spacing } from "../../../theme/editorial";
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
      <View style={styles.hero}>
        <EditorialText variant="label" tone="gold" uppercase>
          Private Client Setup
        </EditorialText>
        <EditorialText variant="headline" style={styles.title}>
          Create your wardrobe intelligence.
        </EditorialText>
        <EditorialText variant="body" tone="ivoryMuted" style={styles.body}>
          Start with a secure account. Your existing backend auth flow remains unchanged.
        </EditorialText>
      </View>

      <EditorialCard style={styles.form} elevated>
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
        {errors.root?.message ? (
          <EditorialText variant="caption" tone="oxblood">
            {errors.root.message}
          </EditorialText>
        ) : null}
        <Button label={isSubmitting ? "Connecting to server..." : "Sign Up"} loading={isSubmitting} onPress={onSubmit} />
        {isSubmitting ? (
          <EditorialText variant="caption" tone="dim" style={styles.center}>
            First request may take a few seconds
          </EditorialText>
        ) : null}
      </EditorialCard>

      <PressableScale style={styles.loginLink} onPress={() => navigation.navigate("Login")}>
        <EditorialText variant="caption" tone="silver" uppercase style={styles.center}>
          Already have an account? Log in
        </EditorialText>
      </PressableScale>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: spacing.xxl
  },
  title: {
    marginTop: spacing.lg
  },
  body: {
    marginTop: spacing.md
  },
  form: {
    marginTop: 38,
    padding: spacing.xl,
    gap: spacing.lg
  },
  center: {
    textAlign: "center"
  },
  loginLink: {
    marginTop: spacing.xl,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center"
  }
});
