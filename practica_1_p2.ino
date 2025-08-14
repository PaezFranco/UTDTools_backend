#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Adafruit_Fingerprint.h>
#include <HardwareSerial.h>

// CONFIGURACIÓN WIFI
const char* ssid = "mamisoytuvaquer";
const char* password = "nose1235";

// URL DEL BACKEND
const char* BACKEND_URL = "https://utdtoolsbackend-production.up.railway.app/api/fingerprint";

// SENSOR AS608
HardwareSerial mySerial(1);
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

WebServer server(80);

// Variables para el servidor web
bool autoMode = false;
bool scanInProgress = false;
String lastResult = "";
unsigned long lastScanTime = 0;
const unsigned long SCAN_TIMEOUT = 30000;

struct FingerprintResult {
  bool success;
  int fingerprintId;
  int confidence;
  String timestamp;
} lastFingerprintResult;

// Variables para el menú
String currentStudentId = "";
int nextAvailableId = 1;

void setup() {
  Serial.begin(115200);
  delay(2000);

  Serial.println("=== SISTEMA DE REGISTRO DE HUELLAS ===");
  
  // Inicializar sensor
  mySerial.begin(57600, SERIAL_8N1, 16, 17);
  finger.begin(57600);

  if (finger.verifyPassword()) {
    Serial.println("Sensor AS608 conectado");
    finger.getTemplateCount();
    Serial.print("Huellas registradas: ");
    Serial.println(finger.templateCount);
  } else {
    Serial.println("ERROR: Sensor AS608 no detectado");
    while (1);
  }

  // Conectar WiFi
  Serial.print("Conectando a WiFi");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("WiFi conectado");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

 
  setupWebServer();
  server.begin();
  
  Serial.println("==========================================");
  Serial.println("SERVIDOR WEB INICIADO CORRECTAMENTE");
  Serial.print("Accede desde: http://");
  Serial.println(WiFi.localIP());
  Serial.println("Endpoints:");
  Serial.println("GET  /status");
  Serial.println("POST /start-auto");
  Serial.println("POST /stop-auto");
  Serial.println("GET  /get-result");
  Serial.println("==========================================");
  
  // Mostrar menú
  showMainMenu();
}

void loop() {
  // Manejar servidor web
  server.handleClient();
  
  // Modo automático para el frontend
  if (autoMode && !scanInProgress) {
    scanForFingerprint();
  }
  
  if (autoMode && (millis() - lastScanTime > SCAN_TIMEOUT)) {
    autoMode = false;
    scanInProgress = false;
  }
  
  // Manejar menú de consola
  if (Serial.available()) {
    String input = Serial.readStringUntil('\n');
    input.trim();
    if (input.length() > 0) {
      handleMenuInput(input);
    }
  }
  
  delay(50);
}

// CONFIGURAR SERVIDOR WEB
void setupWebServer() {
  // CORS
  server.onNotFound([]() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(404, "text/plain", "Not found");
  });
  
  // GET /status
  server.on("/status", HTTP_GET, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    
    DynamicJsonDocument doc(300);
    doc["connected"] = true;
    doc["wifi_connected"] = WiFi.status() == WL_CONNECTED;
    doc["sensor_connected"] = finger.verifyPassword();
    doc["auto_mode"] = autoMode;
    doc["ip"] = WiFi.localIP().toString();
    doc["templates_count"] = finger.templateCount;
    
    String response;
    serializeJson(doc, response);
    server.send(200, "application/json", response);
    
    Serial.println("Frontend solicito /status");
  });
  
  // OPTIONS /status
  server.on("/status", HTTP_OPTIONS, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
    server.send(200);
  });
  
  // POST /start-auto
  server.on("/start-auto", HTTP_POST, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    
    Serial.println("Frontend activo modo automatico");
    autoMode = true;
    scanInProgress = false;
    lastScanTime = millis();
    lastResult = "";
    
    server.send(200, "application/json", "{\"success\":true}");
  });
  
  // OPTIONS /start-auto
  server.on("/start-auto", HTTP_OPTIONS, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
    server.send(200);
  });
  
  // POST /stop-auto
  server.on("/stop-auto", HTTP_POST, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    
    Serial.println("Frontend desactivo modo automatico");
    autoMode = false;
    scanInProgress = false;
    
    server.send(200, "application/json", "{\"success\":true}");
  });
  
  // OPTIONS /stop-auto
  server.on("/stop-auto", HTTP_OPTIONS, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
    server.send(200);
  });
  
  // GET /get-result
  server.on("/get-result", HTTP_GET, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    
    DynamicJsonDocument doc(300);
    
    if (lastResult != "") {
      doc["type"] = "fingerprint_result";
      doc["success"] = lastFingerprintResult.success;
      doc["fingerprintId"] = lastFingerprintResult.fingerprintId;
      doc["confidence"] = lastFingerprintResult.confidence;
      doc["timestamp"] = lastFingerprintResult.timestamp;
      
      lastResult = "";
    } else {
      doc["type"] = "no_result";
    }
    
    String response;
    serializeJson(doc, response);
    server.send(200, "application/json", response);
  });
}

void scanForFingerprint() {
  if (scanInProgress) return;
  
  scanInProgress = true;
  
  uint8_t p = finger.getImage();
  
  if (p == FINGERPRINT_OK) {
    Serial.println("Dedo detectado desde frontend");
    
    p = finger.image2Tz();
    if (p != FINGERPRINT_OK) {
      scanInProgress = false;
      return;
    }
    
    p = finger.fingerFastSearch();
    if (p == FINGERPRINT_OK) {
      Serial.print("Huella encontrada ID: ");
      Serial.print(finger.fingerID);
      Serial.print(", Confianza: ");
      Serial.println(finger.confidence);
      
      lastFingerprintResult = {true, finger.fingerID, finger.confidence, String(millis())};
      lastResult = "fingerprint_found";
      autoMode = false;
      
    } else if (p == FINGERPRINT_NOTFOUND) {
      Serial.println("Huella no reconocida");
      lastFingerprintResult = {false, -1, 0, String(millis())};
      lastResult = "fingerprint_not_found";
      autoMode = false;
    }
  }
  
  scanInProgress = false;
  delay(100);
}

// FUNCIONES DEL MENÚ
void showMainMenu() {
  Serial.println();
  Serial.println("==========================================");
  Serial.println("        SISTEMA DE HUELLAS DACTILARES");
  Serial.println("==========================================");
  Serial.println("1. REGISTRAR nueva huella");
  Serial.println("2. VERIFICAR huella existente");
  Serial.println("3. CONSULTAR estudiante por huella");
  Serial.println("4. LISTAR huellas registradas");
  Serial.println("5. ELIMINAR huella");
  Serial.println("6. ESTADO del sistema");
  Serial.println("10. MOSTRAR este menú");
  Serial.println("==========================================");
  Serial.println("Ingrese el número de la opción:");
}

void handleMenuInput(String input) {
  int option = input.toInt();
  
  switch (option) {
    case 1:
      startRegistration();
      break;
    case 2:
      startVerification();
      break;
    case 3:
      consultStudentByFingerprint();
      break;
    case 4:
      listfingerprint();
      break;
    case 5:
      deleteFingerprint();
      break;
    case 6:
      showSystemStatus();
      break;
    case 10:
      showMainMenu();
      break;
    default:
      Serial.println("Opción inválida");
      showMainMenu();
      break;
  }
}

void startRegistration() {
  Serial.println();
  Serial.println("=== REGISTRO DE NUEVA HUELLA ===");
  Serial.println("Ingrese la matrícula del estudiante:");
  
  while (!Serial.available()) delay(100);
  
  currentStudentId = Serial.readStringUntil('\n');
  currentStudentId.trim();
  
  if (currentStudentId.length() == 0) {
    Serial.println("Matrícula vacía. Cancelando...");
    showMainMenu();
    return;
  }
  
  Serial.print("Matrícula: ");
  Serial.println(currentStudentId);
  
  nextAvailableId = findNextAvailableId();
  Serial.print("Usando ID de huella: ");
  Serial.println(nextAvailableId);
  
  if (enrollFingerprint(nextAvailableId)) {
    if (sendFingerprintToBackend(currentStudentId, nextAvailableId)) {
      Serial.println("REGISTRO COMPLETADO EXITOSAMENTE");
    } else {
      Serial.println("Huella guardada en sensor pero error en base de datos");
    }
  } else {
    Serial.println("Error registrando huella");
  }
  
  Serial.println("Presione ENTER para continuar...");
  while (!Serial.available()) delay(100);
  Serial.readStringUntil('\n');
  showMainMenu();
}

void startVerification() {
  Serial.println();
  Serial.println("=== VERIFICACIÓN DE HUELLA ===");
  Serial.println("Coloque el dedo en el sensor...");
  
  if (verifyFingerprint()) {
    getStudentInfo(finger.fingerID);
  } else {
    Serial.println("Huella no reconocida");
  }
  
  Serial.println("Presione ENTER para continuar...");
  while (!Serial.available()) delay(100);
  Serial.readStringUntil('\n');
  showMainMenu();
}

void consultStudentByFingerprint() {
  Serial.println();
  Serial.println("=== CONSULTA POR HUELLA ===");
  Serial.println("Coloque el dedo en el sensor...");
  
  if (verifyFingerprint()) {
    getStudentInfo(finger.fingerID);
  } else {
    Serial.println("Huella no reconocida");
  }
  
  Serial.println("Presione ENTER para continuar...");
  while (!Serial.available()) delay(100);
  Serial.readStringUntil('\n');
  showMainMenu();
}

bool enrollFingerprint(int id) {
  Serial.println("PASO 1: Coloque el dedo en el sensor...");
  
  int p = waitForFingerprint();
  if (p != FINGERPRINT_OK) return false;
  
  p = finger.image2Tz(1);
  if (p != FINGERPRINT_OK) {
    Serial.println("Error procesando primera imagen");
    return false;
  }
  
  Serial.println("Primera imagen capturada");
  Serial.println("PASO 2: Retire el dedo...");
  delay(2000);
  
  while (finger.getImage() != FINGERPRINT_NOFINGER) delay(100);
  
  Serial.println("PASO 3: Coloque el mismo dedo nuevamente...");
  
  p = waitForFingerprint();
  if (p != FINGERPRINT_OK) return false;
  
  p = finger.image2Tz(2);
  if (p != FINGERPRINT_OK) {
    Serial.println("Error procesando segunda imagen");
    return false;
  }
  
  Serial.println("Segunda imagen capturada");
  
  p = finger.createModel();
  if (p != FINGERPRINT_OK) {
    Serial.println("Error: Las huellas no coinciden");
    return false;
  }
  
  p = finger.storeModel(id);
  if (p == FINGERPRINT_OK) {
    Serial.println("Modelo de huella creado y guardado");
    finger.getTemplateCount();
    return true;
  } else {
    Serial.println("Error guardando modelo");
    return false;
  }
}

int waitForFingerprint() {
  int p = -1;
  unsigned long startTime = millis();
  
  while (p != FINGERPRINT_OK) {
    if (millis() - startTime > 15000) {
      Serial.println("Tiempo agotado esperando dedo");
      return FINGERPRINT_TIMEOUT;
    }
    
    p = finger.getImage();
    if (p == FINGERPRINT_NOFINGER) {
      Serial.print(".");
      delay(200);
    } else if (p != FINGERPRINT_OK) {
      Serial.println("Error capturando imagen");
      return p;
    }
  }
  
  Serial.println();
  return FINGERPRINT_OK;
}

bool verifyFingerprint() {
  int p = waitForFingerprint();
  if (p != FINGERPRINT_OK) return false;
  
  p = finger.image2Tz();
  if (p != FINGERPRINT_OK) {
    Serial.println("Error procesando imagen");
    return false;
  }
  
  p = finger.fingerFastSearch();
  if (p == FINGERPRINT_OK) {
    Serial.print("Huella encontrada - ID: ");
    Serial.print(finger.fingerID);
    Serial.print(", Confianza: ");
    Serial.println(finger.confidence);
    return true;
  } else {
    Serial.println("Huella no encontrada");
    return false;
  }
}

bool sendFingerprintToBackend(String studentId, int fingerprintId) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi no conectado");
    return false;
  }
  
  HTTPClient http;
  String url = String(BACKEND_URL) + "/register-esp32";
  
  Serial.println("Enviando datos al servidor...");
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000);
  
  StaticJsonDocument<200> doc;
  doc["student_id"] = studentId;
  doc["fingerprint_id"] = fingerprintId;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  int httpCode = http.POST(jsonString);
  
  if (httpCode > 0) {
    String response = http.getString();
    Serial.print("Respuesta del servidor: ");
    Serial.println(response);
    
    if (httpCode == 200) {
      DynamicJsonDocument responseDoc(512);
      deserializeJson(responseDoc, response);
      bool success = responseDoc["success"] | false;
      
      if (success) {
        Serial.println("Datos enviados exitosamente al servidor");
        http.end();
        return true;
      }
    }
  } else {
    Serial.print("Error HTTP: ");
    Serial.println(httpCode);
  }
  
  http.end();
  return false;
}

void getStudentInfo(int fingerprintId) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi no conectado");
    return;
  }
  
  HTTPClient http;
  String url = String(BACKEND_URL) + "/student/" + String(fingerprintId);
  
  Serial.println("Consultando información del estudiante...");
  
  http.begin(url);
  http.setTimeout(10000);
  
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String response = http.getString();
    
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, response);
    
    if (doc["success"]) {
      Serial.println("INFORMACIÓN DEL ESTUDIANTE:");
      Serial.println("================================");
      
      JsonObject student = doc["student"];
      
      if (student["student_id"]) {
        Serial.print("Matrícula: ");
        Serial.println(student["student_id"].as<String>());
      }
      if (student["full_name"]) {
        Serial.print("Nombre: ");
        Serial.println(student["full_name"].as<String>());
      }
      if (student["email"]) {
        Serial.print("Email: ");
        Serial.println(student["email"].as<String>());
      }
      if (student["career"]) {
        Serial.print("Carrera: ");
        Serial.println(student["career"].as<String>());
      }
      
      Serial.print("ID de Huella: ");
      Serial.println(fingerprintId);
      Serial.println("================================");
    } else {
      Serial.println("Estudiante no encontrado en la base de datos");
    }
  } else {
    Serial.print("Error consultando servidor: ");
    Serial.println(httpCode);
  }
  
  http.end();
}

void listfingerprint() {
  Serial.println();
  Serial.println("=== HUELLAS REGISTRADAS ===");
  
  finger.getTemplateCount();
  Serial.print("Total de huellas: ");
  Serial.println(finger.templateCount);
  
  if (finger.templateCount == 0) {
    Serial.println("No hay huellas registradas");
  } else {
    Serial.println("IDs ocupados:");
    int found = 0;
    for (int i = 1; i <= 127 && found < finger.templateCount; i++) {
      if (finger.loadModel(i) == FINGERPRINT_OK) {
        Serial.print("ID ");
        Serial.print(i);
        Serial.println(" - Registrada");
        found++;
      }
    }
  }
  
  Serial.println("Presione ENTER para continuar...");
  while (!Serial.available()) delay(100);
  Serial.readStringUntil('\n');
  showMainMenu();
}

void deleteFingerprint() {
  Serial.println();
  Serial.println("=== ELIMINAR HUELLA ===");
  Serial.println("Ingrese el ID de la huella a eliminar (1-127):");
  
  while (!Serial.available()) delay(100);
  
  String input = Serial.readStringUntil('\n');
  input.trim();
  int id = input.toInt();
  
  if (id < 1 || id > 127) {
    Serial.println("ID inválido");
  } else {
    if (finger.deleteModel(id) == FINGERPRINT_OK) {
      Serial.print("Huella ");
      Serial.print(id);
      Serial.println(" eliminada");
      finger.getTemplateCount();
    } else {
      Serial.println("Error eliminando huella o ID no existe");
    }
  }
  
  Serial.println("Presione ENTER para continuar...");
  while (!Serial.available()) delay(100);
  Serial.readStringUntil('\n');
  showMainMenu();
}

void showSystemStatus() {
  Serial.println();
  Serial.println("=== ESTADO DEL SISTEMA ===");
  Serial.println("WiFi: " + String(WiFi.status() == WL_CONNECTED ? "Conectado" : "Desconectado"));
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("IP: " + WiFi.localIP().toString());
    Serial.println("Servidor web: ACTIVO");
  }
  
  Serial.println("Sensor: " + String(finger.verifyPassword() ? "Conectado" : "Desconectado"));
  Serial.println("Backend: " + String(BACKEND_URL));
  
  finger.getTemplateCount();
  Serial.print("Huellas registradas: ");
  Serial.print(finger.templateCount);
  Serial.println("/127");
  
  Serial.println("Presione ENTER para continuar...");
  while (!Serial.available()) delay(100);
  Serial.readStringUntil('\n');
  showMainMenu();
}

int findNextAvailableId() {
  for (int i = 1; i <= 127; i++) {
    if (finger.loadModel(i) != FINGERPRINT_OK) {
      return i;
    }
  }
  return -1;
}