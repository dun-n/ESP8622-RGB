
void initLEDS(){
  pinMode(staticData.redPin, OUTPUT);
  pinMode(staticData.bluePin, OUTPUT);
  pinMode(staticData.greenPin, OUTPUT);
}


void initEEPROM(boolean fource){
  struct { 
    char initialized[16] = "";
    char ssid[32]     = "";
    char password[64] = "";
    char nodeName[16] = "ESP-RGB";
    uint16_t redPin = 12;
    uint16_t bluePin = 13;
    uint16_t greenPin = 14;
    uint16_t numberOfPresets = 0;
    Palette palettes[16];
    int RGBmode = -1;
    uint16_t duration = 5000;
    int currentPaletteNumber = -1;
  } staticDataTemp;
  uint addr = 0;
  EEPROM.get(addr,staticDataTemp);
  if(fource || strcmp(staticDataTemp.initialized,"INITIALIZED") != 0){
    writeEEPROM();
  } else {
    readEEPROM();
  }
}

void readEEPROM(){
  uint addr = 0;
  EEPROM.get(addr,staticData);
}

void writeEEPROM(){
  uint addr = 0;
  EEPROM.put(addr,staticData);
  EEPROM.commit(); 
}
