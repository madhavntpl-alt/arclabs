#include "MessageBuffer.h"

MessageBuffer::MessageBuffer() : _head(0), _tail(0), _count(0) {}

bool MessageBuffer::addChar(char c) {
    if (_count >= MESSAGE_BUFFER_SIZE) {
        return false;  // Buffer full
    }
    
    _buffer[_head] = c;
    _head = (_head + 1) % MESSAGE_BUFFER_SIZE;
    _count++;
    return true;
}

const char* MessageBuffer::getLine() {
    if (_count == 0) return nullptr;
    
    // Look for newline
    size_t pos = _tail;
    for (size_t i = 0; i < _count; i++) {
        if (_buffer[pos] == '\n' || _buffer[pos] == '\r') {
            // Found line ending
            size_t lineLength = i;
            
            // Create line string
            static char line[MESSAGE_BUFFER_SIZE];
            for (size_t j = 0; j < lineLength; j++) {
                line[j] = _buffer[(_tail + j) % MESSAGE_BUFFER_SIZE];
            }
            line[lineLength] = '\0';
            
            // Skip line ending characters
            size_t skip = 1;
            if (lineLength > 0 && _buffer[(_tail + lineLength - 1) % MESSAGE_BUFFER_SIZE] == '\r' && 
                _buffer[(_tail + lineLength) % MESSAGE_BUFFER_SIZE] == '\n') {
                skip = 2;
            }
            
            // Update tail and count
            _tail = (_tail + lineLength + skip) % MESSAGE_BUFFER_SIZE;
            _count -= lineLength + skip;
            
            return line;
        }
        
        pos = (pos + 1) % MESSAGE_BUFFER_SIZE;
    }
    
    return nullptr;  // No complete line yet
}

void MessageBuffer::clear() {
    _head = 0;
    _tail = 0;
    _count = 0;
}