/**
 * CRC Utilities
 * Checksum for serial communication
 */

#ifndef CRC_H
#define CRC_H

#include <Arduino.h>

class CRC {
public:
    // CRC32 (Ethernet polynomial)
    static uint32_t crc32(const char* data, size_t length = 0);
    static uint32_t crc32(const String& data);
    
    // CRC16 (CCITT)
    static uint16_t crc16(const char* data, size_t length = 0);
    static uint16_t crc16(const String& data);
    
    // Convert to hex string
    static String toHex(uint32_t value);
    static String toHex(uint16_t value);

private:
    static const uint32_t CRC32_POLY = 0xEDB88320;
    static const uint16_t CRC16_POLY = 0x1021;
    
    static uint32_t _crc32Table[256];
    static uint16_t _crc16Table[256];
    static bool _tablesInitialized;
    
    static void initTables();
};

#endif // CRC_H