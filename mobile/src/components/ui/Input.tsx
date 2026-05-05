import { Text, TextInput, View, type TextInputProps } from "react-native";

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function Input({ label, error, className = "", placeholderTextColor = "#8f8a82", ...props }: InputProps) {
  return (
    <View className="gap-2">
      {label ? <Text className="text-sm font-medium text-stone">{label}</Text> : null}
      <TextInput
        placeholderTextColor={placeholderTextColor}
        className={`min-h-[52px] rounded-lg border border-graphite bg-charcoal px-4 text-base text-mist ${className}`}
        {...props}
      />
      {error ? <Text className="text-sm text-oxblood">{error}</Text> : null}
    </View>
  );
}
