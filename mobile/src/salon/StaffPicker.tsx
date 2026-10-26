import { Pressable, ScrollView, StyleSheet } from "react-native";

import { colors, radius, TOUCH } from "~/theme/tokens";
import { Text } from "~/ui/Text";

export type StaffOption = { id: string; display_name: string };

/**
 * Professional filter for the calendar. Members who may see every appointment get
 * "everyone" plus each professional; others only see their own profile (RLS already
 * limits their appointments — this keeps the picker honest about it).
 */
export function StaffPicker({
  staff,
  ownStaffId,
  canSeeAll,
  value,
  onChange,
  allLabel,
}: {
  staff: StaffOption[];
  ownStaffId: string | null;
  canSeeAll: boolean;
  value: string | null;
  onChange: (staffId: string | null) => void;
  allLabel: string;
}) {
  const options: { id: string | null; label: string }[] = canSeeAll
    ? [{ id: null, label: allLabel }, ...staff.map((s) => ({ id: s.id, label: s.display_name }))]
    : staff.filter((s) => s.id === ownStaffId).map((s) => ({ id: s.id, label: s.display_name }));

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="tablist"
    >
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <Pressable
            key={option.id ?? "all"}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.id)}
            style={[styles.chip, selected && styles.selected]}
          >
            <Text variant="label" color={selected ? "primary-fg" : "fg"}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8 },
  chip: {
    minHeight: TOUCH,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors["border-strong"],
    backgroundColor: colors.surface,
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
});
