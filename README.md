# 📱 Comando TV Universal

Uma aplicação móvel elegante, minimalista e poderosa, desenvolvida em **React Native (Expo)**, que transforma o teu smartphone num comando universal para Smart TVs.

Em vez de depender de infravermelhos (IR), esta app comunica diretamente com as TVs através da tua rede Wi-Fi local (WLAN), suportando múltiplos protocolos e marcas num único ecrã.

## ✨ Funcionalidades Principais

* 🚫 **Zero Anúncios :** Esquece os pop-ups a meio da mudança de canal. Esta app é 100% limpa, open-source e focada no que interessa.
* 📡 **Radar de Rede (Auto-Scan):** Utiliza pacotes UDP (SSDP) para varrer a rede Wi-Fi e detetar Smart TVs automaticamente em poucos segundos.
* 🎯 **Design Premium & Minimalista:** Interface focada na ergonomia com *Haptic Feedback* (vibração tátil) em cada toque, D-pad central com espaçamento otimizado e layout desmaiado enquanto não há TV conectada.
* 🚀 **Lançamento Direto de Apps:** Botões dedicados com os IDs internos de cada sistema operativo para abrir instantaneamente a Netflix, YouTube, Twitch e Spotify.
* 🔌 **Fallback de IP Manual:** Opção para introduzir o IP da TV manualmente caso a rede local bloqueie pings de broadcast.
* 🧠 **Motor Universal Inteligente:** Um único serviço de comandos que traduz os teus toques para o "dialeto" específico de cada marca de TV.

## 📺 Marcas e Protocolos Suportados

A base da aplicação está preparada para as seguintes plataformas:

* **LG (webOS):** WebSockets (Porta 3000)
* **Samsung (Tizen):** WebSockets + Base64 Auth (Porta 8001)
* **Roku:** REST API HTTP POST (Porta 8060)
* **Philips:** JointSpace API v6 (Porta 1925)
* **Android TV / Xiaomi:** (Base estrutural preparada)
* **Hisense (VIDAA):** MQTT (Base estrutural preparada)

## 🛠️ Tecnologias Utilizadas

* [React Native](https://reactnative.dev/)
* [Expo](https://expo.dev/) (Expo Router)
* [TypeScript](https://www.typescriptlang.org/)
* `react-native-udp` (Para o scanner SSDP na rede local)
* `expo-haptics` (Para o feedback tátil dos botões)
* `@expo/vector-icons` (Interface e logos das apps)
