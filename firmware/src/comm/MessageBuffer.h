/**
 * Message Buffer
 * Ring buffer for incoming serial messages
 */

#ifndef MESSAGE_BUFFER_H
#define MESSAGE_BUFFER_H

#include <Arduino.h>
#include "config/constants.h"

class MessageBuffer {
public:
    MessageBuffer();
    
    // Add character to buffer
    bool addChar(char c);
    
    // Get next complete line (null-terminated)
    // Returns nullptr if no complete line available
    const char* getLine();
    
    // Check if buffer has data
    bool hasData() const { return _count > 0; }
    
    // Get available space
    size_t available() const { return MESSAGE_BUFFER_SIZE - _count; }
    
    // Clear buffer
    void clear();
    
    // Get current count
    size_t count() const { return _count; }

private:
    char _buffer[MESSAGE_BUFFER_SIZE];
    size_t _head = 0;
    size_t _tail = 0;
    size_t _count = 0;
};

#endif // MESSAGE_BUFFER_H