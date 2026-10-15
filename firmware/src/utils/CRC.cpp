#include "CRC.h"

uint32_t CRC::_crc32Table[256];
uint16_t CRC::_crc16Table[256];
bool CRC::_tablesInitialized = false;

void CRC::initTables() {
    if (_tablesInitialized) return;
    
    // CRC32 table
    for (uint32_t i = 0; i < 256; i++) {
        uint32_t crc = i;
        for (int j = 0; j < 8; j++) {
            crc = (crc >> 1) ^ (CRC32_POLY & -(crc & 1));
        }
        _crc32Table[i] = crc;
    }
    
    // CRC16 table
    for (uint16_t i = 0; i < 256; i++) {
        uint16_t crc = i << 8;
        for (int j = 0; j < 8; j++) {
            crc = (crc << 1) ^ (CRC16_POLY & -(crc & 0x8000));
        }
        _crc16Table[i] = crc;
    }
    
    _tablesInitialized = true;
}

void CRC::initTables() {
    if (!_tablesInitialized) {
        initTables();
    }
}

uint32_t CRC::crc32(const char* data, size_t length) {
    initTables();
    
    if (length == 0) {
        length = strlen(data);
    }
    
    uint32_t crc = 0xFFFFFFFF;
    for (size_t i = 0; i < length; i++) {
        crc = _crc32Table[(crc ^ data[i]) & 0xFF] ^ (crc >> 8);
    }
    return crc ^ 0xFFFFFFFF;
}

uint32_t CRC::crc32(const String& data) {
    return crc32(data.c_str(), data.length());
}

uint16_t CRC::crc16(const char* data, size_t length) {
    initTables();
    
    if (length == 0) {
        length = strlen(data);
    }
    
    uint16_t crc = 0xFFFF;
    for (size_t i = 0; i < length; i++) {
        crc = (crc << 8) ^ _crc16Table[((crc >> 8) ^ data[i]) & 0xFF];
    }
    return crc;
}

uint16_t CRC::crc16(const String& data) {
    return crc16(data.c_str(), data.length());
}

String CRC::toHex(uint32_t value) {
    char buf[9];
    sprintf(buf, "%08lX", value);
    return String(buf);
}

String CRC::toHex(uint16_t value) {
    char buf[5];
    sprintf(buf, "%04X", value);
    return String(buf);
}