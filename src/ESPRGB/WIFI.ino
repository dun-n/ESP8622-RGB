#include "Webpage.h"
#include "Secrets.h"

boolean connecting = false;

void handle_root() {
  long len = 0;
  //todo for dev only
  server.sendHeader("Access-Control-Allow-Origin", "*");
  if(connecting){
    long len = sizeof(HTML_CONNECT);
    server.sendHeader("Content-Encoding", "gzip");
    server.send_P(200, "text/html", HTML_CONNECT,len);  
  } else {
    long len = sizeof(HTML_PRESETS);
    server.sendHeader("Content-Encoding", "gzip");
    server.send_P(200, "text/html", HTML_PRESETS ,len); 
  }
}

void rest_color() {
  char* output = (char*) malloc(1024);
    if (output == NULL) {
    Serial.println("malloc failed");
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(507);
    return;
  }
  DynamicJsonDocument doc(1024);
  if (doc.capacity() != 1024) {
    free(output);
    Serial.println("DynamicJsonDocument failed");
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(507);
    return;
  }
  uint16_t r = 0;
  uint16_t g = 0;
  uint16_t b = 0;
  if (server.method() == HTTP_POST) {
    //POST
    Serial.println("GOT POST");
    StaticJsonDocument<1024> input;
    DeserializationError error = deserializeJson(input, server.arg(0));
    // Test if parsing succeeds.
    if (error) {
      Serial.print("deserializeJson() failed: ");
      Serial.println(error.f_str());
      server.send(400, "plain/text","Bad JSON String");
      return;
    }
    staticData.RGBmode = -1;
    staticData.currentPaletteNumber = -1;
    if(input.containsKey("r")){
      r = input["r"];
    }
    if(input.containsKey("b")){
      b = input["b"];
    }
    if(input.containsKey("g")){
      g = input["g"];
    }
    setColor(r,g,b);
  }
  doc["r"] = r;
  doc["g"] = g;
  doc["b"] = b;
  serializeJson(doc, output, 1024);
  //todo for dev only
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json",output);
  free(output);
  yield();
}

void rest_settings(){
  char* output = (char*) malloc(1024);
  if (output == NULL) {
    Serial.println("malloc failed");
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(507);
    return;
  }
  DynamicJsonDocument doc(1024);
  if (doc.capacity() != 1024) {
    free(output);
    Serial.println("DynamicJsonDocument failed");
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(507);
    return;
  }
  if (server.method() == HTTP_POST) {
    // POST
    Serial.println("GOT POST");
    StaticJsonDocument<1024> input;
    DeserializationError error = deserializeJson(input, server.arg(0));
    // Test if parsing succeeds.
    if (error) {
      Serial.print("deserializeJson() failed: ");
      Serial.println(error.f_str());
      server.sendHeader("Access-Control-Allow-Origin", "*");
      server.send(400, "plain/text","Bad JSON String");
      return;
    }
    if(input.containsKey("redPin")){
      staticData.redPin = input["redPin"];
    }
    if(input.containsKey("greenPin")){
      staticData.greenPin = input["greenPin"];
    }
    if(input.containsKey("bluePin")){
      staticData.bluePin = input["bluePin"];
    }
    if(input.containsKey("nodeName")){
      //Serial.println("GOT NODENAME");
      //memcpy((char *)input["nodeName"],&staticData.nodeName,64);
      const char* nodeName = input["nodeName"];
      //Serial.println(nodeName);
      //Serial.println(strlen(nodeName));
      //strcpy((char *)staticData.nodeName,(char *)nodeName);
      uint16_t i;
      for(i = 0; i < 15 && i < strlen(nodeName); i++){
        staticData.nodeName[i] = nodeName[i];
      }
      staticData.nodeName[i] = '\0';
    }
    writeEEPROM();
    initLEDS();
  }
  doc["nodeName"] = staticData.nodeName;
  doc["redPin"] = staticData.redPin;
  doc["greenPin"] = staticData.greenPin;
  doc["bluePin"] = staticData.bluePin;
  serializeJson(doc, output, 1024);
  //todo for dev only
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json",output);
  free(output);
  yield();
}

void rest_mode(){
  char* output = (char*) malloc(1024);
  if (output == NULL){
    Serial.println("malloc failed");
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(507);
    return;
  }
  DynamicJsonDocument doc(1024);
  if (doc.capacity() != 1024) {
    free(output);
    Serial.println("DynamicJsonDocument failed");
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(507);
    return;
  }
  if (server.method() == HTTP_POST) {
    // POST
    StaticJsonDocument<1024> input;
    DeserializationError error = deserializeJson(input, server.arg(0));
    // Test if parsing succeeds.
    if (error) {
      Serial.print("deserializeJson() failed: ");
      Serial.println(error.f_str());
      server.sendHeader("Access-Control-Allow-Origin", "*");
      server.send(400, "plain/text","Bad JSON String");
      return;
    }

    if(input.containsKey("off")){
      staticData.RGBmode = -1;
      staticData.currentPaletteNumber = -1;
      setColor(0,0,0);
    } else if(input.containsKey("mode")){
      staticData.RGBmode = input["mode"];
      if(input.containsKey("duration")){
        staticData.duration = input["duration"];
      }
      if(input.containsKey("palette")){
        staticData.currentPaletteNumber = input["palette"];
      }
    }
    writeEEPROM();
    initMode();
  }
  doc["mode"] = staticData.RGBmode;
  doc["duration"] = staticData.duration;
  doc["palette"] = staticData.currentPaletteNumber;
  serializeJson(doc, output, 1024);
  //todo for dev only
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json",output);
  free(output);
  yield();
}

void rest_palettes(){
  char* output = (char*) malloc(6512);
  if (output == NULL){
    Serial.println("malloc failed");
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(507);
    return;
  }
  DynamicJsonDocument doc(6512);
  if (doc.capacity() != 6512) {
    free(output);
    Serial.println("DynamicJsonDocument failed");
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(507);
    return;
  }
  JsonArray array = doc.to<JsonArray>();
  for(uint16_t i = 0; i < MAX_PALETTES; i++){
    Palette* pal = &staticData.palettes[i];
    JsonObject nested = array.createNestedObject();
    JsonArray colors = nested.createNestedArray("colors");
    for(uint16_t j = 0; j < pal->numberOfColors && j < MAX_COLORS; j++){
      JsonObject c = colors.createNestedObject();
      Color3B color = pal->colors[j];
      c["red"] = color.red;
      c["green"] = color.green;
      c["blue"] = color.blue;
    }
    nested["name"] = pal->paletteName;
    nested["palette"] = i;
    
  }
  serializeJson(doc, output, 6512);
  //todo for dev only
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", output);
  free(output);
  yield();
}

void rest_palette(){
  char* output = (char*) malloc(1024);
  if (output == NULL){
    Serial.println("malloc failed");
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(507);
    return;
  }
  DynamicJsonDocument doc(1024);
  if (doc.capacity() != 1024) {
    free(output);
    Serial.println("DynamicJsonDocument failed");
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(507);
    return;
  }
  uint16_t preset = -1;
  if (server.method() == HTTP_POST) {
    // POST
    StaticJsonDocument<1024> input;
    DeserializationError error = deserializeJson(input, server.arg(0));
    // Test if parsing succeeds.
    if (error) {
      Serial.print("deserializeJson() failed: ");
      Serial.println(error.f_str());
      server.sendHeader("Access-Control-Allow-Origin", "*");
      server.send(400, "plain/text","Bad JSON String");
      return;
    }
    preset = input["palette"];
    Palette* pal = &staticData.palettes[preset];
    int arraySize = input["colors"].size();
    pal->numberOfColors = arraySize;
    for (int i = 0; i < arraySize && i < MAX_COLORS; i++) { 
      uint16_t red = input["colors"][i]["red"];
      uint16_t green = input["colors"][i]["green"];
      uint16_t blue = input["colors"][i]["blue"];
      pal->colors[i].red = red;
      pal->colors[i].green = green;
      pal->colors[i].blue = blue;
    }
    const char* paletteName = input["name"];
    int i;
    for(i = 0; i < 15 && i < strlen(paletteName); i++){
      pal->paletteName[i] = paletteName[i];
    }
    pal->paletteName[i] = '\0';
    writeEEPROM();
  }
  if (server.method() == HTTP_GET) {
    preset = atoi(server.pathArg(0).c_str());
  }
  if(preset >= 0 ){
    Palette* pal = &staticData.palettes[preset];
    JsonArray colors = doc.createNestedArray("colors");
    for(uint16_t j = 0; j < pal->numberOfColors; j++){
      JsonObject c = colors.createNestedObject();
      Color3B color = pal->colors[j];
      c["red"] = color.red; 
      c["green"] = color.green;
      c["blue"] = color.blue;
    }
    doc["palette"] = preset;
    doc["name"] = pal->paletteName;
  }
  serializeJson(doc, output, 1024);
  //todo for dev only
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json",output);
  free(output);
  yield();
}

void handle_settings(){
  long len = sizeof(HTML_SETTINGS);
  //todo for dev only
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Content-Encoding", "gzip");
  server.send_P(200, "text/html", HTML_SETTINGS ,len); 
  yield();
}


void handle_wheel(){
  long len = sizeof(HTML_WHEEL);
  //todo for dev only
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Content-Encoding", "gzip");
  server.send_P(200, "text/html", HTML_WHEEL ,len);
  yield(); 
}

void handle_iro_js(){
  long len = sizeof(JS_IRO);
  //todo for dev only
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Content-Encoding", "gzip");
  server.send_P(200, "text/javascript", JS_IRO ,len);
  yield(); 
}

void handle_env_js(){
  long len = sizeof(JS_ENV);
  //todo for dev only
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Content-Encoding", "gzip");
  server.send_P(200, "text/javascript", JS_ENV ,len);
  yield(); 
}

void handle_ee3_js(){
  long len = sizeof(JS_EE3);
  //todo for dev only
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Content-Encoding", "gzip");
  server.send_P(200, "text/javascript", JS_EE3 ,len);
  yield();
}

void handle_wheel_js(){
  long len = sizeof(JS_WHEEL);
  //todo for dev only
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Content-Encoding", "gzip");
  server.send_P(200, "text/javascript", JS_WHEEL ,len);
  yield();
}

void handle_settings_js(){
  long len = sizeof(JS_SETTINGS);
  //todo for dev only
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Content-Encoding", "gzip");
  server.send_P(200, "text/javascript", JS_SETTINGS ,len);
  yield();
}

void handle_presets_js(){
  long len = sizeof(JS_PRESETS);
  //todo for dev only
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Content-Encoding", "gzip");
  server.send_P(200, "text/javascript", JS_PRESETS ,len);
  yield();
}

void handle_toastify_js(){
  long len = sizeof(JS_TOASTIFY);
  //todo for dev only
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Content-Encoding", "gzip");
  server.send_P(200, "text/javascript", JS_TOASTIFY ,len);
  yield();
}

void handle_rest_js(){
  long len = sizeof(JS_REST);
  //todo for dev only
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Content-Encoding", "gzip");
  server.send_P(200, "text/javascript", JS_REST ,len);
  yield();
}


void handle_skeleton_css(){
  long len = sizeof(CSS_SKELETON);
  //todo for dev only
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Content-Encoding", "gzip");
  server.send_P(200, "text/css", CSS_SKELETON ,len);
  yield();
}

void handle_toastify_css(){
  long len = sizeof(CSS_TOASTIFY);
  //todo for dev only
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Content-Encoding", "gzip");
  server.send_P(200, "text/css", CSS_TOASTIFY ,len);
  yield();
}

void handle_normalize_css(){
  long len = sizeof(CSS_NORMALIZE);
  //todo for dev only
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Content-Encoding", "gzip");
  server.send_P(200, "text/css", CSS_NORMALIZE ,len);
  yield();
}

void handle_style_css(){
  long len = sizeof(CSS_STYLE);
  //todo for dev only
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Content-Encoding", "gzip");
  server.send_P(200, "text/css", CSS_STYLE ,len);
  yield();
}

void rest_credentials(){
    //todo for dev only
  server.sendHeader("Access-Control-Allow-Origin", "*");
  if(connecting){
    if (server.method() != HTTP_POST) {
      server.send(405, "text/plain", "Method Not Allowed");
    } else {
      for (uint8_t i = 0; i < server.args(); i++) {
        if(server.argName(i).equals("ssid")){
          server.arg(i).toCharArray(staticData.ssid,32);
        } else if(server.argName(i).equals("password")){
          server.arg(i).toCharArray(staticData.password,64);
        }
      }
      //todo check both are set
      connecting = false;
      writeEEPROM();
      server.send(200, "text/plain", "Device connecting. You may reconnect to your normal wifi network. After your device is finished connecting to the network you may find its IP address on the status page found in the devices main menu.");
    } 
  } else {
    server.send(404, "text/plain", "Resouce Not Found");
  }
  yield();
}

void setupServer(){
  if (!MDNS.begin(staticData.nodeName)) {             // Start the mDNS responder for .local
    Serial.println("Error setting up MDNS responder!");
  } else {
    Serial.print("mDNS responder started: "); 
    Serial.print(staticData.nodeName); 
    Serial.println(".local"); 
  }
  server.on("/", handle_root);
  server.on("/settings", handle_settings);
  server.on("/wheel", handle_wheel);
  server.on("/env.js", handle_env_js);
  server.on("/iro.js", handle_iro_js);
  server.on("/wheel.js", handle_wheel_js);
  server.on("/presets.js", handle_presets_js);
  server.on("/settings.js", handle_settings_js);
  server.on("/rest.js", handle_rest_js);
  server.on("/ee3.js", handle_ee3_js);
  server.on("/toastify.js", handle_toastify_js);
  server.on("/toastify.css", handle_toastify_css);  
  server.on("/style.css", handle_style_css);
  server.on("/skeleton.css", handle_skeleton_css);
  server.on("/normalize.css", handle_normalize_css);
  server.on("/api/v1/color", rest_color);
  server.on("/api/v1/mode", rest_mode);
  server.on("/api/v1/settings", rest_settings);
  server.on("/api/v1/palettes", rest_palettes);
  server.on("/api/v1/palette", rest_palette);
  server.on(UriRegex("^\\/api\\/v1\\/palette\\/([0-9]+)$"), rest_palette);
  server.on("/api/v1/connect", rest_credentials);
  server.begin();
}


void setupWifi(){
  char* ssid = staticData.ssid;
  char* pass = staticData.password;
  if(strlen(SECRET_SSID) > 0 && strlen(SECRET_PASS) > 0) {
    ssid = SECRET_SSID;
    pass = SECRET_PASS;
  }
  if(strlen(ssid) > 0 && strlen(pass) > 0){
    WiFi.begin(ssid, pass);
    Serial.println("Connecting to WIFI");
    Serial.print("ssid ");
    Serial.println(ssid);
    Serial.print("password ");
    Serial.println(pass);
    // Wait for connection
    boolean connecting = true;
    while(connecting){  
      // yellow blue
      if(millis()% 1000 < 500){
        setColor(255,255,0);
      } else {
        setColor(0,0,0);
      }
      mainUpdate();
      if(WiFi.status() == WL_CONNECTED){
        connecting = false;
        Serial.println("WIFI Connected ");
        setColor(0,255,0);
        mainUpdate();
        delay(400);
        setColor(0,0,0);
      } else if(WiFi.status() == WL_NO_SSID_AVAIL){
        connecting = false;
        Serial.println("Connection failed");
        Serial.println("SSID could not be reached");
        setColor(255,0,0);
      } else if(WiFi.status() == WL_CONNECT_FAILED){
        connecting = false;
        Serial.println("Connection failed");
        setColor(255,0,0);
      } else if(WiFi.status() == WL_WRONG_PASSWORD){
        connecting = false;
        Serial.println("Connection failed");
        Serial.println("Wrong password");
        setColor(255,0,0);
      }
    }
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    setupAccessPoint();
  }
}


const char *apssid = "ESP8266 RGB"; // The name of the Wi-Fi network that will be created
const char *appassword = "goodrgb4u";   // The password required to connect to it, leave blank for an open network

// this has problems on phones!!!!
void setupAccessPoint(){
    connecting = true;
    WiFi.softAP(apssid, appassword);             // Start the access point
    Serial.print("Access Point \"");
    Serial.print(apssid);
    Serial.println("\" started");
    Serial.print("Password: ");
    Serial.println(appassword);
    Serial.print("IP address:\t");
    Serial.println(WiFi.softAPIP());         // Send the IP address of the ESP8266 to the computer
    
    while(connecting){
      mainUpdate();
      // blink blue
      if(millis()% 1000 < 500){
        setColor(0,0,255);
      } else {
        setColor(0,0,0);
      }
    }
    setupWifi();
}
