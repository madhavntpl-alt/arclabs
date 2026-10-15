/**
 * RFID Reader (RC522)
 */

#ifndef RFID_READER_H
#define RFID_READER_H

#include <Arduino.h>
#include <SPI.h>
#include <MFRC522.h>
#include "config/pins.h"

class RFIDReader {
public:
    RFIDReader(uint8_t ssPin, uint8_t rstPin);
    
    void begin();
    void check();
    
    // Callback for card detected
    typedef void (*CardCallback)(const char* uid);
    void setCardCallback(void (*callback)(const char*));
    
    // Get last UID
    String getLastUID() const { return _lastUID; }
    
    // Check if card is present
    bool isCardPresent() const { return _cardPresent; }

private:
    MFRC522 _mfrc522;
    void (*_cardCallback)(const char*) = nullptr;
    String _lastUID = "";
    bool _cardPresent = false;
    unsigned long _lastRead = 0;
    const unsigned long _readInterval = 500;  // Minimum interval between reads
};

#endif // RFID_READER_H