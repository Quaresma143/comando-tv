// app/(tabs)/index.tsx
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Buffer } from "buffer";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { TVConfig, tvService } from "../services/tvService";

global.Buffer = Buffer;

export default function HomeScreen() {
  const [ipInput, setIpInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [discoveredTVs, setDiscoveredTVs] = useState<TVConfig[]>([]);
  const [selectedTV, setSelectedTV] = useState<TVConfig | null>(null);

  const toggleDropdown = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleScan = async () => {
    setIsScanning(true);
    setDiscoveredTVs([]);
    const tvs = await tvService.scanNetwork();
    setDiscoveredTVs(tvs);
    setIsScanning(false);
    if (tvs.length > 0)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleManualConnect = async () => {
    if (!ipInput) return;
    const tv = await tvService.connectToIP(ipInput);
    if (tv) {
      setSelectedTV(tv);
      setIsDropdownOpen(false);
    } else {
      alert("IP não encontrado.");
    }
  };

  const handlePress = (btn: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedTV) tvService.sendCommand(selectedTV, btn);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.dropdownTrigger}
          onPress={toggleDropdown}
        >
          <MaterialCommunityIcons
            name={selectedTV ? "television" : ("television-off" as any)}
            size={20}
            color={selectedTV ? "#4cd964" : "#666"}
          />
          <Text style={styles.dropdownTriggerText}>
            {selectedTV ? selectedTV.name : "Selecionar Dispositivo"}
          </Text>
          <Ionicons
            name={isDropdownOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color="#666"
          />
        </TouchableOpacity>

        {isDropdownOpen && (
          <View style={styles.dropdownContent}>
            <TouchableOpacity
              style={[styles.scanBtn, isScanning && { opacity: 0.6 }]}
              onPress={handleScan}
              disabled={isScanning}
            >
              {isScanning ? (
                <ActivityIndicator color="black" />
              ) : (
                <Text style={styles.scanBtnText}>VARRER REDE (AUTO)</Text>
              )}
            </TouchableOpacity>

            <View style={styles.manualRow}>
              <TextInput
                style={styles.input}
                placeholder="IP da TV"
                placeholderTextColor="#444"
                value={ipInput}
                onChangeText={setIpInput}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={styles.connectBtn}
                onPress={handleManualConnect}
              >
                <Ionicons name="arrow-forward" size={20} color="black" />
              </TouchableOpacity>
            </View>

            {discoveredTVs.map((tv) => (
              <TouchableOpacity
                key={tv.ip}
                style={styles.tvItem}
                onPress={() => {
                  setSelectedTV(tv);
                  setIsDropdownOpen(false);
                }}
              >
                <Text style={styles.tvItemText}>{tv.name}</Text>
                <Ionicons name="checkmark-circle" size={18} color="#4cd964" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.remoteBody, !selectedTV && { opacity: 0.2 }]}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.powerBtn}
              onPress={() => handlePress("Power")}
            >
              <MaterialCommunityIcons name="power" size={32} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sourceBtn}
              onPress={() => handlePress("Source")}
            >
              <Text style={styles.sourceText}>Source</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mainControlsRow}>
            <View style={styles.pill}>
              <TouchableOpacity
                style={styles.pillBtn}
                onPress={() => handlePress("Vol+")}
              >
                <Ionicons name="add" size={28} color="white" />
              </TouchableOpacity>
              <Text style={styles.pillLabel}>VOL</Text>
              <TouchableOpacity
                style={styles.pillBtn}
                onPress={() => handlePress("Vol-")}
              >
                <Ionicons name="remove" size={28} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.centerStack}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => handlePress("Home")}
              >
                <Ionicons name="home" size={22} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => handlePress("Mute")}
              >
                <MaterialCommunityIcons
                  name="volume-mute"
                  size={22}
                  color="white"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => handlePress("Back")}
              >
                <MaterialCommunityIcons
                  name="keyboard-return"
                  size={22}
                  color="white"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.pill}>
              <TouchableOpacity
                style={styles.pillBtn}
                onPress={() => handlePress("Ch+")}
              >
                <Ionicons name="chevron-up" size={28} color="white" />
              </TouchableOpacity>
              <Text style={styles.pillLabel}>CH</Text>
              <TouchableOpacity
                style={styles.pillBtn}
                onPress={() => handlePress("Ch-")}
              >
                <Ionicons name="chevron-down" size={28} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.dpadContainer}>
            <TouchableOpacity
              style={styles.dpadSide}
              onPress={() => handlePress("Left")}
            >
              <Ionicons name="chevron-back" size={28} color="white" />
            </TouchableOpacity>
            <View style={styles.dpadCenter}>
              <TouchableOpacity
                style={styles.dpadUp}
                onPress={() => handlePress("Up")}
              >
                <Ionicons name="chevron-up" size={28} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.okBtn}
                onPress={() => handlePress("OK")}
              >
                <Ionicons name="radio-button-on" size={32} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dpadDown}
                onPress={() => handlePress("Down")}
              >
                <Ionicons name="chevron-down" size={28} color="white" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.dpadSide}
              onPress={() => handlePress("Right")}
            >
              <Ionicons name="chevron-forward" size={28} color="white" />
            </TouchableOpacity>
          </View>

          {/* NOVA ORDEM DAS APPS: Netflix, YouTube, Twitch, Spotify */}
          <View style={styles.appsRow}>
            <TouchableOpacity
              style={styles.appBtn}
              onPress={() => handlePress("Netflix")}
            >
              <MaterialCommunityIcons
                name="netflix"
                size={24}
                color="#E50914"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.appBtn}
              onPress={() => handlePress("YouTube")}
            >
              <Ionicons name="logo-youtube" size={24} color="#FF0000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.appBtn}
              onPress={() => handlePress("Twitch")}
            >
              <FontAwesome5 name="twitch" size={20} color="#9146FF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.appBtn}
              onPress={() => handlePress("Spotify")}
            >
              <FontAwesome5 name="spotify" size={26} color="#1DB954" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0F0F0F" },
  headerContainer: {
    width: "100%",
    zIndex: 10,
    backgroundColor: "#151515",
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    gap: 10,
  },
  dropdownTriggerText: { color: "white", fontWeight: "bold", fontSize: 13 },
  dropdownContent: {
    backgroundColor: "#1A1A1A",
    padding: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    gap: 15,
  },
  scanBtn: {
    backgroundColor: "#4cd964",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  scanBtnText: { color: "black", fontWeight: "bold", fontSize: 12 },
  manualRow: { flexDirection: "row", gap: 10 },
  input: {
    flex: 1,
    backgroundColor: "#000",
    color: "white",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  connectBtn: {
    backgroundColor: "#4cd964",
    width: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  tvItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#222",
  },
  tvItemText: { color: "white", fontSize: 12, fontWeight: "bold" },
  container: { flexGrow: 1, alignItems: "center", paddingVertical: 10 },
  remoteBody: {
    flex: 1,
    width: "84%",
    justifyContent: "space-around",
    minHeight: 600,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  powerBtn: {
    backgroundColor: "#FF3B30",
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  sourceBtn: {
    backgroundColor: "#1A1A1A",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#444",
  },
  sourceText: { color: "white", fontWeight: "bold" },
  mainControlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 180,
  },
  pill: {
    backgroundColor: "#1A1A1A",
    width: 70,
    borderRadius: 35,
    borderWidth: 1.5,
    borderColor: "#333",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
  },
  pillBtn: { width: "100%", alignItems: "center" },
  pillLabel: { color: "#555", fontSize: 12, fontWeight: "bold" },
  centerStack: { justifyContent: "space-between", paddingVertical: 5 },
  iconBtn: {
    backgroundColor: "#1A1A1A",
    width: 55,
    height: 55,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  dpadContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  dpadCenter: { gap: 15, alignItems: "center" },
  dpadSide: {
    backgroundColor: "#1A1A1A",
    width: 65,
    height: 65,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  dpadUp: {
    backgroundColor: "#1A1A1A",
    width: 65,
    height: 55,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  dpadDown: {
    backgroundColor: "#1A1A1A",
    width: 65,
    height: 55,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  okBtn: {
    backgroundColor: "#1A1A1A",
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1.5,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  appsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
    marginTop: 10,
  },
  appBtn: {
    backgroundColor: "#1A1A1A",
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
});
