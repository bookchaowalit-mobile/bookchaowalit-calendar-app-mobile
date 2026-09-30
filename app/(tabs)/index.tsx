import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  addEvent,
  addMonths,
  buildMonthGrid,
  countByDate,
  eventsOn,
  monthTitle,
  removeEvent,
  todayKey,
  validateEvent,
  weekdayLabels,
  type CalendarEvent,
} from "../../lib/calendar";

const WEEK_START = 0;

export default function CalendarScreen() {
  const now = new Date();
  const today = todayKey(now);
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selected, setSelected] = useState(today);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState<string | null>(null);

  const grid = useMemo(() => buildMonthGrid(view.year, view.month, WEEK_START), [view]);
  const counts = useMemo(() => countByDate(events), [events]);
  const dayEvents = eventsOn(events, selected);

  const shift = (delta: number) => setView(addMonths(view.year, view.month, delta));

  const submit = () => {
    const input = { date: selected, title, time: time.trim() || undefined };
    const problem = validateEvent(input);
    setError(problem);
    if (problem) return;
    setEvents(addEvent(events, input, `${Date.now()}-${events.length}`));
    setTitle("");
    setTime("");
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.monthBar}>
        <Pressable onPress={() => shift(-1)} accessibilityRole="button" accessibilityLabel="Previous month" hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color="#4A90D9" />
        </Pressable>
        <Text style={styles.monthTitle} accessibilityRole="header">
          {monthTitle(view.year, view.month)}
        </Text>
        <Pressable onPress={() => shift(1)} accessibilityRole="button" accessibilityLabel="Next month" hitSlop={12}>
          <Ionicons name="chevron-forward" size={24} color="#4A90D9" />
        </Pressable>
      </View>

      <View style={styles.grid}>
        {weekdayLabels(WEEK_START).map((d) => (
          <Text key={d} style={styles.weekday}>
            {d}
          </Text>
        ))}
        {grid.map((cell) => {
          const isSelected = cell.key === selected;
          const count = counts.get(cell.key) ?? 0;
          return (
            <Pressable
              key={cell.key}
              style={[styles.cell, isSelected && styles.cellSelected]}
              onPress={() => setSelected(cell.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${cell.key}${count ? `, ${count} event(s)` : ""}`}
            >
              <Text
                style={[
                  styles.cellText,
                  !cell.inMonth && styles.outside,
                  cell.key === today && styles.today,
                  isSelected && styles.selectedText,
                ]}
              >
                {cell.day}
              </Text>
              {count > 0 && <View style={[styles.dot, isSelected && styles.dotSelected]} />}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{selected}</Text>
        {dayEvents.length === 0 && <Text style={styles.empty}>No events.</Text>}
        {dayEvents.map((e) => (
          <View key={e.id} style={styles.eventRow}>
            <Text style={styles.eventTime}>{e.time ?? "All day"}</Text>
            <Text style={styles.eventTitle}>{e.title}</Text>
            <Pressable
              onPress={() => setEvents(removeEvent(events, e.id))}
              accessibilityRole="button"
              accessibilityLabel={`Delete ${e.title}`}
              hitSlop={10}
            >
              <Ionicons name="trash-outline" size={20} color="#B00020" />
            </Pressable>
          </View>
        ))}

        <Text style={styles.label}>Add event</Text>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          maxLength={80}
          accessibilityLabel="Event title"
        />
        <TextInput
          style={styles.input}
          placeholder="Time HH:MM (optional)"
          value={time}
          onChangeText={setTime}
          keyboardType="numbers-and-punctuation"
          maxLength={5}
          accessibilityLabel="Event time, optional, 24-hour HH:MM"
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <Pressable style={styles.button} onPress={submit} accessibilityRole="button">
          <Text style={styles.buttonText}>Add to {selected}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  monthBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  monthTitle: { fontSize: 20, fontWeight: "700", color: "#333" },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 8 },
  weekday: { width: `${100 / 7}%`, textAlign: "center", fontSize: 12, color: "#888", paddingBottom: 6 },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: "center", justifyContent: "center", borderRadius: 8 },
  cellSelected: { backgroundColor: "#4A90D9" },
  cellText: { fontSize: 16, color: "#333" },
  outside: { color: "#bbb" },
  today: { fontWeight: "800", color: "#4A90D9" },
  selectedText: { color: "#fff" },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#4A90D9", marginTop: 2 },
  dotSelected: { backgroundColor: "#fff" },
  card: { backgroundColor: "#fff", borderRadius: 12, margin: 16, padding: 16, gap: 8, elevation: 2 },
  cardTitle: { fontSize: 17, fontWeight: "600", color: "#333" },
  empty: { color: "#888" },
  eventRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  eventTime: { width: 60, color: "#4A90D9", fontWeight: "600" },
  eventTitle: { flex: 1, fontSize: 15, color: "#333" },
  label: { fontSize: 13, color: "#555", marginTop: 8 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  error: { color: "#B00020" },
  button: { backgroundColor: "#4A90D9", borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
});
