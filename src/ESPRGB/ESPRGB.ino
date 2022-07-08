#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>        // Include the mDNS library
#include <EEPROM.h>
#include <avr/pgmspace.h>
#include <ArduinoJson.h>
#include <uri/UriRegex.h>

#define MAX_PALETTES 16
#define MAX_COLORS 16

ESP8266WebServer server(80);

struct Color3B {
  uint16_t red;
  uint16_t green;
  uint16_t blue;
} CurrentColor;

struct Palette{ 
  char paletteName[16] = "";
  uint16_t numberOfColors = 0;
  Color3B colors[MAX_COLORS];
} currentPalette;

struct StaticData {
  char initialized[16] = "INITIALIZED";
  char ssid[32] = "";
  char password[64] = "";
  char nodeName[16] = "ESPRGB";
  uint16_t redPin = 12;
  uint16_t bluePin = 13;
  uint16_t greenPin = 14;
  Palette palettes[MAX_PALETTES];
} staticData;



// 0 - static color
// 1 - color wheel
int16_t RGBmode = 0;
uint16_t duration = 5000;
uint16_t currentPaletteNumber = 0;


void mainUpdate(){
    updateRGB();
    server.handleClient();
    MDNS.update();
    yield();
}

void setup() {
  EEPROM.begin(4096);
  Serial.begin(115200);
  Serial.println("");
  initEEPROM(false);
  initLEDS();
  setupServer();
  setupWifi();
  setColor(255,255,255);
}
void loop() {
  //Fading the LED
  /*for(int i=0; i<255; i++){
    analogWrite(led_blue, i);
    delay(5);
  }
  for(int i=0; i<255; i++){
    analogWrite(led_red, i);
    delay(5);
  }
  for(int i=255; i>0; i--){
    analogWrite(led_blue, i);
    delay(5);
  }
   for(int i=0; i<255; i++){
    analogWrite(led_green, i);
    delay(5);
  }
  for(int i=255; i>0; i--){
    analogWrite(led_red, i);
    delay(5);
  }*/
  mainUpdate();
}
