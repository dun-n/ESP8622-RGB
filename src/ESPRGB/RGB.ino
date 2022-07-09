uint16_t red = 0;
uint16_t blue = 0;
uint16_t green = 0;

void setColor(uint16_t r, uint16_t g, uint16_t b){
  red = r;
  blue = b;
  green = g;
}


    /*struct Color3B {
      uint16_t red;
      uint16_t green;
      uint16_t blue;
    } CurrentColor;
    
    struct Palette{ 
      char paletteName[16] = "";
      uint16_t numberOfColors = 0;
      Color3B colors[MAX_COLORS];
    } currentPalette;*/


unsigned long last_update = 0;
Color3B* CurrColorPtr = NULL;
uint16_t colorIndex = 0;

void initMode(){
  if(staticData.currentPaletteNumber >= 0){
    Palette* pal = &staticData.palettes[staticData.currentPaletteNumber];
    currentPalette.numberOfColors = pal -> numberOfColors;
    for(uint16_t j = 0; j < pal->numberOfColors && j < MAX_COLORS; j++){
      Color3B color = pal->colors[j];
      Color3B* curColor = &currentPalette.colors[j];
      curColor->red = color.red;
      curColor->green = color.green;
      curColor->blue = color.blue;
    }
    last_update = millis();
    colorIndex = 0;
    CurrColorPtr = &currentPalette.colors[colorIndex];
    setColor(CurrColorPtr -> red, CurrColorPtr -> green, CurrColorPtr -> blue);
  } else {
    setColor(0, 0, 0);
  }
}


void updateRGB(){    
  unsigned long currentTime = millis();
  if(staticData.currentPaletteNumber >= 0 && currentPalette.numberOfColors > 0){
    // Static
    if(staticData.RGBmode == 0){
      if(currentTime > (last_update + staticData.duration)){
        last_update = currentTime;
        colorIndex++;
        if(colorIndex >= currentPalette.numberOfColors){
          colorIndex = 0;
        }
        CurrColorPtr = &currentPalette.colors[colorIndex];
        setColor(CurrColorPtr -> red, CurrColorPtr -> green, CurrColorPtr -> blue);
      }
    }
    // Pulse
    else if(staticData.RGBmode == 1){
      double percent = ((double)(currentTime - last_update))/((double)staticData.duration);
      if(percent > 1){
        percent = 1;
      }
      CurrColorPtr = &currentPalette.colors[colorIndex];
      uint16_t red = sin(percent*3.14)*(CurrColorPtr -> red);
      uint16_t green = sin(percent*3.14)*(CurrColorPtr -> green);
      uint16_t blue = sin(percent*3.14)*(CurrColorPtr -> blue);
      setColor(red, green, blue);
      if(currentTime > (last_update + staticData.duration)){
        last_update = currentTime;
        colorIndex++;
        if(colorIndex >= currentPalette.numberOfColors){
          colorIndex = 0;
        }
      }
    }
    // Fade
    else if(staticData.RGBmode == 2){
      double percent = ((double)(currentTime - last_update))/((double)staticData.duration);
      if(percent > 1){
        percent = 1;
      }
      uint16_t nextColorIndex = colorIndex + 1;
      if(nextColorIndex >= currentPalette.numberOfColors){
        nextColorIndex = 0;
      }
      CurrColorPtr = &currentPalette.colors[colorIndex];
      Color3B* NextColorPtr = &currentPalette.colors[nextColorIndex];
      uint16_t red = CurrColorPtr -> red + ((NextColorPtr-> red-CurrColorPtr -> red)*percent);
      uint16_t green = CurrColorPtr -> green + ((NextColorPtr-> green - CurrColorPtr -> green)*percent);
      uint16_t blue = CurrColorPtr -> blue + ((NextColorPtr-> blue - CurrColorPtr -> blue)*percent);
      setColor(red, green, blue);
      if(currentTime > (last_update + staticData.duration)){
        last_update = currentTime;
        colorIndex++;
        if(colorIndex >= currentPalette.numberOfColors){
          colorIndex = 0;
        }
      }
    }
  }
  
  analogWrite(staticData.redPin, red);
  analogWrite(staticData.greenPin, green);
  analogWrite(staticData.bluePin, blue);
}
