/**
 * Serial Protocol
 * JSON Lines encoding/decoding with checksum
 */

#ifndef SERIAL_PROTOCOL_H
#define SERIAL_PROTOCOL_H

#include <Arduino.h>
#include <ArduinoJson.h>
#include "utils/CRC.h"
#include "config/constants.h"

class SerialProtocol {
public:
    SerialProtocol();
    
    // Initialize
    void begin();
    
    // Process incoming serial data
    void processIncoming();
    
    // Send message (JSON line)
    void sendMessage(const JsonDocument& doc);
    
    // Send command acknowledgment
    void sendCommandAck(const char* commandId, bool success, const char* message = "");
    
    // Send command negative acknowledgment
    void sendCommandNack(const char* commandId, const char* errorCode, const char* message);
    
    // Set command callback
    typedef void (*CommandCallback)(JsonObject);
    void setCommandCallback(void (*callback)(JsonObject));
    
    // Parse JSON line
    bool parseLine(const char* line, JsonDocument& doc);
    
    // Encode message with checksum
    String encodeMessage(JsonDocument& doc);
    
    // Verify checksum
    bool verifyChecksum(const char* data, const char* checksum);

private:
    // Command callback
    void (*_commandCallback)(JsonObject) = nullptr;
    
    // Input buffer
    char _inputBuffer[SERIAL_RX_BUFFER_SIZE];
    size_t _bufferPos = 0;
    
    // Sequence number
    uint32_t _sequence = 0;
    
    // Process complete line
    void processLine(const char* line);
    
    // Handle command
    void handleCommand(JsonObject command);
};

#endif // SERIAL_PROTOCOL_H