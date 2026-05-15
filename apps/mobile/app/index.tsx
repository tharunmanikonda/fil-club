import { View, Text } from "react-native";

export default function Home() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20, backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 12 }}>NIL Club</Text>
      <Text style={{ fontSize: 16, color: "#666", textAlign: "center" }}>
        Smoke test — app booted successfully
      </Text>
    </View>
  );
}
