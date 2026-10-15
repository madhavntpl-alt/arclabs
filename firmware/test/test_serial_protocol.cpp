/**
 * Unit tests for Serial Protocol
 */

#include <Arduino.h>
#include <ArduinoJson.h>
#include "../src/comm/SerialProtocol.h"
#include "../src/utils/CRC.h"

void setup() {
    Serial.begin(115200);
    while (!Serial) delay(10);
    
    Serial.println("Starting Serial Protocol Tests...");
}

void loop() {
    testParseValidJSON();
    testParseInvalidJSON();
    testEncodeMessage();
    testChecksum();
    testCommandParsing();
    
    Serial.println("All tests passed!");
    while (true) delay(1000);
}

void testParseValidJSON() {
    SerialProtocol protocol;
    
    const char* json = "{\"type\":\"sensor_reading\",\"timestamp\":1234567890,\"payload\":{\"sensor\":\"water_level\",\"value\":45.2,\"unit\":\"cm\"}}";
    
    StaticJsonDocument<256> doc;
    bool result = protocol.parseLine(json, doc);
    
    assert(result == true);
    assert(strcmp(doc["type"], "sensor_reading") == 0);
    assert(doc["timestamp"] == 1234567890);
    assert(strcmp(doc["payload"]["sensor"], "water_level") == 0);
    assert(doc["payload"]["value"] == 45.2);
    assert(strcmp(doc["payload"]["unit"], "cm") == 0);
    
    Serial.println("testParseValidJSON: PASSED");
}

void testParseInvalidJSON() {
    SerialProtocol protocol;
    
    const char* json = "{\"type\":\"sensor_reading\",\"timestamp\":1234567890,\"payload\":{";
    
    StaticJsonDocument<256> doc;
    bool result = protocol.parseLine(json, doc);
    
    assert(result == false);
    
    Serial.println("testParseInvalidJSON: PASSED");
}

void testEncodeMessage() {
    SerialProtocol protocol;
    
    StaticJsonDocument<256> doc;
    doc["type"] = "command";
    doc["command"] = "pump_on";
    doc["params"]["duration"] = 30;
    
    String encoded = protocol.encodeMessage(doc);
    
    // Should contain the original data plus sequence, timestamp, checksum
    assert(encoded.indexOf("command") >= 0);
    assert(encoded.indexOf("pump_on") >= 0);
    assert(encoded.indexOf("sequence") >= 0);
    assert(encoded.indexOf("timestamp") >= 0);
    assert(encoded.indexOf("checksum") >= 0);
    assert(encoded.endsWith("\n"));
    
    // Verify it's valid JSON
    StaticJsonDocument<512> parsed;
    DeserializationError error = deserializeJson(parsed, encoded);
    assert(error == DeserializationError::Ok);
    
    Serial.println("testEncodeMessage: PASSED");
}

void testChecksum() {
    SerialProtocol protocol;
    
    const char* data = "test data";
    String checksum = CRC::toHex(CRC::crc32(data));
    
    assert(checksum.length() == 8);
    
    // Verify same data produces same checksum
    String checksum2 = CRC::toHex(CRC::crc32(data));
    assert(checksum == checksum2);
    
    // Different data produces different checksum
    String checksum3 = CRC::toHex(CRC::crc32("different"));
    assert(checksum != checksum3);
    
    Serial.println("testChecksum: PASSED");
}

void testCommandParsing() {
    SerialProtocol protocol;
    
    const char* command = "{\"type\":\"command\",\"command_id\":\"cmd_123\",\"command\":\"pump_on\",\"params\":{\"duration\":30}}";
    
    StaticJsonDocument<256> doc;
    bool result = protocol.parseLine(command, doc);
    
    assert(result == true);
    assert(strcmp(doc["type"], "command") == 0);
    assert(strcmp(doc["command_id"], "cmd_123") == 0);
    assert(strcmp(doc["command"], "pump_on") == 0);
    assert(doc["params"]["duration"] == 30);
    
    Serial.println("testCommandParsing: PASSED");
}

void assert(bool condition) {
    if (!condition) {
        Serial.println("ASSERTION FAILED!");
        while (true) delay(100);
    }
}