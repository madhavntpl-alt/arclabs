#include "SerialProtocol.h"
#include "utils/CRC.h"
#include "utils/TimeUtils.h"

SerialProtocol::SerialProtocol() {}

void SerialProtocol::begin() {
    Serial.begin(SERIAL_BAUDRATE);
    _bufferPos = 0;
    _sequence = 0;
}

void SerialProtocol::processIncoming() {
    while (Serial.available()) {
        char c = Serial.read();
        
        if (c == '\n' || c == '\r') {
            if (_bufferPos > 0) {
                _inputBuffer[_bufferPos] = '\0';
                processLine(_inputBuffer);
                _bufferPos = 0;
            }
        } else if (_bufferPos < SERIAL_RX_BUFFER_SIZE - 1) {
            _inputBuffer[_bufferPos++] = c;
        } else {
            // Buffer overflow, reset
            _bufferPos = 0;
        }
    }
}

void SerialProtocol::processLine(const char* line) {
    if (strlen(line) == 0) return;
    
    StaticJsonDocument<MAX_JSON_SIZE> doc;
    if (!parseLine(line, doc)) {
        return;
    }
    
    // Verify checksum if present
    if (doc.containsKey("checksum")) {
        const char* checksum = doc["checksum"];
        // Remove checksum for verification
        String jsonWithoutChecksum;
        serializeJson(doc, jsonWithoutChecksum);
        // Remove checksum field temporarily
        doc.remove("checksum");
        
        if (!verifyChecksum(line, checksum)) {
            sendCommandNack("", "CHECKSUM_ERROR", "Invalid checksum");
            return;
        }
        // Restore checksum
        doc["checksum"] = checksum;
    }
    
    const char* type = doc["type"] | "";
    
    if (strcmp(type, "command") == 0) {
        if (_commandCallback) {
            _commandCallback(doc["payload"].as<JsonObject>());
        }
    }
    // Other message types from firmware would be handled here
}

bool SerialProtocol::parseLine(const char* line, JsonDocument& doc) {
    DeserializationError error = deserializeJson(doc, line);
    if (error) {
        return false;
    }
    return true;
}

void SerialProtocol::sendMessage(const JsonDocument& doc) {
    String output;
    serializeJson(doc, output);
    Serial.println(output);
}

void SerialProtocol::sendCommandAck(const char* commandId, bool success, const char* message) {
    StaticJsonDocument<256> doc;
    doc["type"] = "command_ack";
    doc["timestamp"] = TimeUtils::getUnixTime();
    doc["sequence"] = ++_sequence;
    
    JsonObject payload = doc.createNestedObject("payload");
    payload["command_id"] = commandId;
    payload["success"] = success;
    if (message) payload["message"] = message;
    
    String output;
    serializeJson(doc, output);
    Serial.println(output);
}

void SerialProtocol::sendCommandNack(const char* commandId, const char* errorCode, const char* message) {
    StaticJsonDocument<256> doc;
    doc["type"] = "command_nack";
    doc["timestamp"] = TimeUtils::getUnixTime();
    doc["sequence"] = ++_sequence;
    
    JsonObject payload = doc.createNestedObject("payload");
    payload["command_id"] = commandId;
    payload["error_code"] = errorCode;
    payload["message"] = message;
    
    String output;
    serializeJson(doc, output);
    Serial.println(output);
}

void SerialProtocol::setCommandCallback(void (*callback)(JsonObject)) {
    _commandCallback = callback;
}

String SerialProtocol::encodeMessage(JsonDocument& doc) {
    // Add sequence and timestamp
    doc["sequence"] = ++_sequence;
    doc["timestamp"] = TimeUtils::getUnixTime();
    
    // Calculate checksum
    String jsonStr;
    serializeJson(doc, jsonStr);
    String checksum = CRC::crc32(jsonStr.c_str());
    doc["checksum"] = checksum;
    
    // Serialize final message
    String output;
    serializeJson(doc, output);
    return output + "\n";
}

bool SerialProtocol::verifyChecksum(const char* data, const char* checksum) {
    // Extract JSON without checksum field for verification
    // This is simplified - in production, parse and remove checksum field
    String calculated = CRC::crc32(data);
    return calculated == checksum;
}