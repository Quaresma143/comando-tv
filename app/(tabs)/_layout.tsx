// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Esconde o cabeçalho no topo (se houver)
        tabBarStyle: { display: "none" }, // ISTO ESCONDE A BARRA DE BAIXO!
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Comando",
        }}
      />
    </Tabs>
  );
}
