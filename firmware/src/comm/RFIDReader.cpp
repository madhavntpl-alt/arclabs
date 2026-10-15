#include "RFIDReader.h"

RFIDReader::RFIDReader(uint8_t ssPin, uint8_t rstPin) : _mfrc522(ssPin, rstPin) {}

void RFIDReader::begin() {
    SPI.begin();
    _mfrc522.PCD_Init();
    // Optional: set antenna gain
    // _mfrc522.PCD_SetAntennaGain(MFRC522::RxGain_max);
}

void RFIDReader::check() {
    unsigned long now = millis();
    if (now - _lastRead < 500) return;  // Debounce
    
    // Look for new cards
    if (!_mfrc522.PICC_IsNewCardPresent()) {
        _cardPresent = false;
        return;
    }
    
    // Select one of the cards
    if (!_mfrc522.PICC_ReadCardSerial()) {
        _cardPresent = false;
        return;
    }
    
    // Get UID
    String uid = "";
    for (byte i = 0; i < _mfrc522.uid.size; i++) {
        if (_mfrc522.uid.uidByte[i] < 0x10) uid += "0";
        uid += String(_mfrc522.uid.uidByte[i], HEX);
    }
    uid.toUpperCase();
    
    _lastUID = uid;
    _cardPresent = true;
    _lastRead = millis();
    
    // Call callback
    if (_cardCallback) {
        _cardCallback(uid.c_str());
    }
    
    // Halt PICC
    _mfrc522.PICC_HaltA();
    _mfrc522.PCD_StopCrypto1();
}

void RFIDReader::setCardCallback(void (*callback)(const char*)) {
    _cardCallback = callback;
}