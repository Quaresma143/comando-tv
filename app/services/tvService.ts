// app/services/tvService.ts
import { Buffer } from "buffer";
import dgram from "react-native-udp";

// Adicionamos PHILIPS, ANDROID_TV (Xiaomi) e VIDAA (Hisense)
export type TVProtocol =
  | "WEBOS"
  | "TIZEN"
  | "ROKU"
  | "PHILIPS"
  | "ANDROID_TV"
  | "VIDAA";

export interface TVConfig {
  id: string;
  ip: string;
  brand: string;
  protocol: TVProtocol;
  name: string;
}

class TVService {
  private lgWs: WebSocket | null = null;
  private samsungWs: WebSocket | null = null;

  async scanNetwork(): Promise<TVConfig[]> {
    return new Promise((resolve) => {
      const discovered: TVConfig[] = [];
      const socket = dgram.createSocket({ type: "udp4" });

      socket.on("error", (err) => {
        console.error("Erro no Socket UDP:", err);
        socket.close();
        resolve([]);
      });

      const message = Buffer.from(
        "M-SEARCH * HTTP/1.1\r\n" +
          "HOST: 239.255.255.250:1900\r\n" +
          'MAN: "ssdp:discover"\r\n' +
          "ST: ssdp:all\r\n" +
          "MX: 3\r\n" +
          "\r\n",
      );

      socket.on("message", (msg, rinfo) => {
        const response = msg.toString();
        const ip = rinfo.address;

        // Evitar duplicados
        if (discovered.find((t) => t.ip === ip)) return;

        // LG webOS
        if (response.includes("webOS") || response.includes("LG")) {
          discovered.push({
            id: `lg-${ip}`,
            ip,
            brand: "LG",
            protocol: "WEBOS",
            name: `LG Smart TV (${ip})`,
          });
        }
        // Samsung Tizen
        else if (response.includes("Samsung") || response.includes("Tizen")) {
          discovered.push({
            id: `samsung-${ip}`,
            ip,
            brand: "Samsung",
            protocol: "TIZEN",
            name: `Samsung TV (${ip})`,
          });
        }
        // Roku
        else if (response.includes("Roku")) {
          discovered.push({
            id: `roku-${ip}`,
            ip,
            brand: "Roku",
            protocol: "ROKU",
            name: `Roku TV (${ip})`,
          });
        }
        // Philips (JointSpace)
        else if (
          response.includes("Philips") ||
          response.includes("JointSpace")
        ) {
          discovered.push({
            id: `philips-${ip}`,
            ip,
            brand: "Philips",
            protocol: "PHILIPS",
            name: `Philips TV (${ip})`,
          });
        }
        // Xiaomi / Android TV
        else if (
          response.includes("Android") ||
          response.includes("Xiaomi") ||
          response.includes("MiTV")
        ) {
          discovered.push({
            id: `xiaomi-${ip}`,
            ip,
            brand: "Xiaomi",
            protocol: "ANDROID_TV",
            name: `Android TV (${ip})`,
          });
        }
        // Hisense (VIDAA)
        else if (response.includes("Hisense") || response.includes("VIDAA")) {
          discovered.push({
            id: `hisense-${ip}`,
            ip,
            brand: "Hisense",
            protocol: "VIDAA",
            name: `Hisense TV (${ip})`,
          });
        }
      });

      socket.bind(0);
      socket.send(message, 0, message.length, 1900, "239.255.255.250");

      setTimeout(() => {
        socket.close();
        resolve(discovered);
      }, 3500);
    });
  }

  async connectToIP(ip: string): Promise<TVConfig | null> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      // Fallback manual assume LG por defeito, mas idealmente testaria várias portas
      const res = await fetch(`http://${ip}:3000`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res)
        return {
          id: `manual-${ip}`,
          ip,
          brand: "LG",
          protocol: "WEBOS",
          name: `Smart TV (${ip})`,
        };
    } catch {
      return null;
    }
    return null;
  }

  // O CÉREBRO UNIVERSAL ATUALIZADO
  async sendCommand(tv: TVConfig, command: string) {
    if (!tv) return;

    switch (tv.protocol) {
      case "WEBOS":
        this.sendLG(tv.ip, command);
        break;
      case "TIZEN":
        this.sendSamsung(tv.ip, command);
        break;
      case "ROKU":
        this.sendRoku(tv.ip, command);
        break;
      case "PHILIPS":
        this.sendPhilips(tv.ip, command);
        break;
      case "ANDROID_TV":
        this.sendAndroidTV(tv.ip, command);
        break;
      case "VIDAA":
        this.sendVidaa(tv.ip, command);
        break;
    }
  }

  // --- IMPLEMENTAÇÃO LG (webOS) ---
  private sendLG(ip: string, btn: string) {
    const wsUrl = `ws://${ip}:3000`;
    if (!this.lgWs || this.lgWs.url !== wsUrl) this.lgWs = new WebSocket(wsUrl);
    this.lgWs.onopen = () =>
      this.lgWs?.send(
        JSON.stringify({
          type: "register",
          payload: { manifest: { appName: "Comando JS" } },
        }),
      );

    const cmdMap: any = {
      "Vol+": "VOLUMEUP",
      "Vol-": "VOLUMEDOWN",
      "Ch+": "CHANNELUP",
      "Ch-": "CHANNELDOWN",
      Power: "POWER",
      OK: "ENTER",
      Mute: "MUTE",
      Home: "HOME",
      Back: "BACK",
      Up: "UP",
      Down: "DOWN",
      Left: "LEFT",
      Right: "RIGHT",
      Source: "INPUT",
    };
    const appMap: any = {
      Netflix: "netflix",
      YouTube: "youtube.leanback.v4",
      Twitch: "tv.twitch",
      Spotify: "spotify-beehive",
    };

    if (this.lgWs.readyState === WebSocket.OPEN) {
      if (appMap[btn])
        this.lgWs.send(
          JSON.stringify({
            type: "request",
            uri: "ssap://system.launcher/launch",
            payload: { id: appMap[btn] },
          }),
        );
      else
        this.lgWs.send(
          JSON.stringify({
            type: "button",
            name: cmdMap[btn] || btn.toUpperCase(),
          }),
        );
    }
  }

  // --- IMPLEMENTAÇÃO SAMSUNG (Tizen) ---
  private sendSamsung(ip: string, btn: string) {
    const appNameBase64 = Buffer.from("Comando JS").toString("base64");
    const wsUrl = `ws://${ip}:8001/api/v2/channels/samsung.remote.control?name=${appNameBase64}`;
    if (!this.samsungWs || this.samsungWs.url !== wsUrl)
      this.samsungWs = new WebSocket(wsUrl);

    const cmdMap: any = {
      "Vol+": "KEY_VOLUP",
      "Vol-": "KEY_VOLDOWN",
      "Ch+": "KEY_CHUP",
      "Ch-": "KEY_CHDOWN",
      Power: "KEY_POWER",
      OK: "KEY_ENTER",
      Mute: "KEY_MUTE",
      Home: "KEY_HOME",
      Back: "KEY_RETURN",
      Up: "KEY_UP",
      Down: "KEY_DOWN",
      Left: "KEY_LEFT",
      Right: "KEY_RIGHT",
      Source: "KEY_SOURCE",
    };
    const appMap: any = {
      Netflix: "11101200001",
      YouTube: "111299001912",
      Twitch: "3201907018807",
      Spotify: "3201606009684",
    };

    if (appMap[btn]) {
      fetch(`http://${ip}:8001/api/v2/applications/${appMap[btn]}`, {
        method: "POST",
      }).catch(() => {});
      return;
    }
    const sendKey = () =>
      this.samsungWs?.send(
        JSON.stringify({
          method: "ms.remote.control",
          params: {
            Cmd: "Click",
            DataOfCmd: cmdMap[btn] || btn,
            Option: "false",
            TypeOfRemote: "SendRemoteKey",
          },
        }),
      );
    if (this.samsungWs.readyState === WebSocket.OPEN) sendKey();
    else this.samsungWs.onopen = () => sendKey();
  }

  // --- IMPLEMENTAÇÃO ROKU ---
  private sendRoku(ip: string, btn: string) {
    const cmdMap: any = {
      "Vol+": "VolumeUp",
      "Vol-": "VolumeDown",
      "Ch+": "ChannelUp",
      "Ch-": "ChannelDown",
      Power: "Power",
      OK: "Select",
      Mute: "VolumeMute",
      Home: "Home",
      Back: "Back",
      Up: "Up",
      Down: "Down",
      Left: "Left",
      Right: "Right",
      Source: "InputTuner",
    };
    const appMap: any = {
      Netflix: "12",
      YouTube: "837",
      Twitch: "119302",
      Spotify: "22297",
    };
    const endpoint = appMap[btn]
      ? `/launch/${appMap[btn]}`
      : `/keypress/${cmdMap[btn]}`;
    fetch(`http://${ip}:8060${endpoint}`, { method: "POST" }).catch(() => {});
  }

  // --- IMPLEMENTAÇÃO PHILIPS (JointSpace API) ---
  private sendPhilips(ip: string, btn: string) {
    // API v6 (usada na maioria das Philips Android TV recentes) - Porta 1925
    const cmdMap: any = {
      "Vol+": "VolumeUp",
      "Vol-": "VolumeDown",
      "Ch+": "ChannelStepUp",
      "Ch-": "ChannelStepDown",
      Power: "Standby",
      OK: "Confirm",
      Mute: "Mute",
      Home: "Home",
      Back: "Back",
      Up: "CursorUp",
      Down: "CursorDown",
      Left: "CursorLeft",
      Right: "CursorRight",
      Source: "Source",
    };
    // Philips usa intents Android para apps, mas os botões base vão por aqui:
    if (cmdMap[btn]) {
      fetch(`http://${ip}:1925/6/input/key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: cmdMap[btn] }),
      }).catch((err) => console.log("Erro Philips:", err));
    }
  }

  // --- IMPLEMENTAÇÃO ANDROID TV (XIAOMI, etc.) ---
  private sendAndroidTV(ip: string, btn: string) {
    console.log(`[Android TV / Xiaomi] Comando ${btn} preparado para ${ip}`);
    // Nota Técnica: Android TV exige emparelhamento (Pairing com código PIN no ecrã)
    // A fundação está aqui. Em produção, usar-se-ia a biblioteca 'android-tv-remote'
    // ou comandos ADB sobre rede (Porta 5555).
  }

  // --- IMPLEMENTAÇÃO HISENSE (VIDAA) ---
  private sendVidaa(ip: string, btn: string) {
    console.log(`[Hisense VIDAA] Comando ${btn} preparado para ${ip}`);
    // Nota Técnica: Hisense VIDAA usa MQTT na porta 1883 com certificados SSL.
    // O radar já a deteta! A estrutura está pronta para receber o cliente MQTT.
  }
}

export const tvService = new TVService();
