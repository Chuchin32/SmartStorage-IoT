# SmartStorage IoT — Control de Acceso Seguro y Monitoreo Ambiental

Sistema IoT orientado a almacenes industriales e insumos críticos para prevenir accesos no autorizados y monitorear condiciones ambientales (temperatura y humedad) en tiempo real, integrando un microcontrolador **ESP32**, **Firebase Realtime Database** y una aplicación móvil en **React Native / Expo**.

## Problemática Resuelta
En bodegas e instalaciones de almacenamiento de insumos sensibles (como componentes electrónicos, piezas metálicas o sustancias críticas) existen dos riesgos principales:
- **Seguridad y control de accesos:** Falta de validación inmediata y bitácora automática ante intentos de ingreso no autorizados.
- **Riesgos ambientales:** Variaciones de temperatura o humedad que pueden degradar, oxidar o comprometer el inventario sin notificación oportuna.

## Arquitectura del Sistema
1. **Capa de Hardware / Edge (ESP32):** Lee el sensor **DHT11**, valida credenciales mediante el lector **RFID MFRC522**, acciona el **servomotor** de la puerta y emite señales auditivas diferenciadas con el **buzzer** (1 pitido corto para acceso concedido; doble pitido de advertencia para acceso denegado).
2. **Capa de Nube (Firebase Realtime Database):** Almacena y sincroniza en tiempo real los registros de clima y eventos de acceso (`CONCEDIDO` / `DENEGADO`).
3. **Capa Móvil (React Native + Expo Router + TypeScript):** Muestra la pantalla de bienvenida (`index.tsx`), la navegación (`_layout.tsx`) y el panel técnico en vivo (`dashboard.tsx`) con KPIs, alerta térmica (> 28 °C), filtros e historial.

## Mapa de Conexiones (ESP32)
| Componente | Pin / Interfaz ESP32 | Función |
| :--- | :--- | :--- |
| **RFID MFRC522 (SDA / SS)** | GPIO 5 (SPI) | Selección de esclavo SPI |
| **RFID MFRC522 (RST)** | GPIO 22 | Reset del lector RFID |
| **Sensor DHT11** | GPIO 21 | Lectura de temperatura y humedad |
| **Servomotor (Puerta)** | GPIO 4 | Apertura y cierre de compuerta |
| **Buzzer Activo** | GPIO 15 | Retroalimentación auditiva de acceso |

## Estructura del Repositorio
```text
├── firmware/               # Código del ESP32 (PlatformIO / C++)
│   └── main.cpp
├── src/
│   └── app/
│       ├── _layout.tsx     # Configuración de navegación (Stack)
│       ├── index.tsx       # Pantalla de bienvenida
│       └── dashboard.tsx   # Panel de control en tiempo real
├── firebaseConfig.ts       # Configuración de Firebase Realtime Database
└── package.json            # Dependencias de Expo / React Nativeopers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
