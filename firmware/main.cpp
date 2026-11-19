#include <Arduino.h>
#include <SPI.h>
#include <MFRC522.h>
#include <DHT.h>
#include <ESP32Servo.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

#define SS_PIN 5
#define RST_PIN 22
#define DHTPIN 21
#define DHTTYPE DHT11
#define SERVO_PIN 4
#define BUZZER_PIN 15

MFRC522 rfid(SS_PIN, RST_PIN);
DHT dht(DHTPIN, DHTTYPE);
Servo puertaServo;

unsigned long tiempoAnterior = 0;
byte tarjetaMaestra[4] = {0xA1, 0x9D, 0x15, 0xA4};

// Credenciales de la red Wi-Fi actual
const char* ssid = "TU_RED_WIFI";
const char* password = "TU_PASSWORD"; 
String urlFirebase = "https://smartstorage-iot-default-rtdb.firebaseio.com/registros.json";

void mandarAFirebase(String jsonPayload) {
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print(" => Negociando con Firebase... ");
    
    WiFiClientSecure client;
    client.setInsecure();    
    client.setTimeout(5000); 
    
    HTTPClient http;
    http.setTimeout(5000);   
    
    if (http.begin(client, urlFirebase)) {
      http.addHeader("Content-Type", "application/json");
      int codigoRespuesta = http.POST(jsonPayload); 
      
      if (codigoRespuesta > 0) {
        Serial.print("Sincronizado! (HTTP ");
        Serial.print(codigoRespuesta);
        Serial.println(")");
      } else {
        Serial.print("Error de Red (Codigo: ");
        Serial.print(codigoRespuesta);
        Serial.println(")");
      }
      http.end();
    } else {
      Serial.println("URL invalida o bloqueada.");
    }
    client.stop();
  } else {
    Serial.println(" => Error: No hay conexion WiFi.");
  }
}

void setup() {
  Serial.begin(115200);

  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  delay(100);
  
  Serial.print("\nConectando a WiFi...");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\n[WiFi] Conexion exitosa.");

  SPI.begin();
  rfid.PCD_Init();
  dht.begin();
  puertaServo.attach(SERVO_PIN);
  puertaServo.write(0);
  
  Serial.println("\n======================================");
  Serial.println("SmartStorage: Conectado a Firebase");
  Serial.println("======================================");
}

void loop() {
  if (millis() - tiempoAnterior >= 10000) {
    tiempoAnterior = millis();
    float humedad = dht.readHumidity();
    float temp = dht.readTemperature();
    
    if (!isnan(humedad) && !isnan(temp)) {
      Serial.print("Temp: "); Serial.print(temp);
      Serial.print(" C | Humedad: "); Serial.print(humedad); Serial.println(" %");

      String jsonClima = "{\"tipo\":\"clima\", \"temperatura\":" + String(temp) + ", \"humedad\":" + String(humedad) + "}";
      mandarAFirebase(jsonClima);
    }
  }

  if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
    String uidLeido = "";
    Serial.print("\nUID leido: ");
    for (byte i = 0; i < rfid.uid.size; i++) {
      Serial.print(rfid.uid.uidByte[i] < 0x10 ? " 0" : " ");
      Serial.print(rfid.uid.uidByte[i], HEX);
      uidLeido += String(rfid.uid.uidByte[i] < 0x10 ? " 0" : " ");
      uidLeido += String(rfid.uid.uidByte[i], HEX);
    }
    Serial.println();
    uidLeido.trim();

    bool autorizado = true;
    for (byte i = 0; i < 4; i++) {
      if (rfid.uid.uidByte[i] != tarjetaMaestra[i]) {
        autorizado = false; break;
      }
    }
    
    String estadoAcceso = "";
    if (autorizado) {
      estadoAcceso = "CONCEDIDO";
      Serial.println("[+] Acceso CONCEDIDO. Abriendo...");
      
      // 🟢 ACCESO CONCEDIDO: 1 pitido corto (150 ms)
      digitalWrite(BUZZER_PIN, HIGH);
      delay(150);
      digitalWrite(BUZZER_PIN, LOW);
      
      puertaServo.write(90);
    } else {
      estadoAcceso = "DENEGADO";
      Serial.println("[!] Acceso DENEGADO. ¡Alarma!");
      
      // 🔴 ACCESO DENEGADO: Doble pitido de advertencia (Beep - Pausa - Beep)
      digitalWrite(BUZZER_PIN, HIGH);
      delay(150);
      digitalWrite(BUZZER_PIN, LOW);
      delay(100);
      digitalWrite(BUZZER_PIN, HIGH);
      delay(150);
      digitalWrite(BUZZER_PIN, LOW);
    }

    String jsonAcceso = "{\"tipo\":\"acceso\", \"uid\":\"" + uidLeido + "\", \"estado\":\"" + estadoAcceso + "\"}";
    mandarAFirebase(jsonAcceso);

    if (autorizado) {
      delay(3000);
      puertaServo.write(0);
    }
    
    rfid.PICC_HaltA();
  }
}
