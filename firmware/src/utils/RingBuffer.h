/**
 * Ring Buffer
 * Circular buffer for data storage
 */

#ifndef RING_BUFFER_H
#define RING_BUFFER_H

#include <Arduino.h>

template<typename T, size_t SIZE>
class RingBuffer {
public:
    RingBuffer() : _head(0), _tail(0), _count(0) {}
    
    // Add element
    bool push(const T& item) {
        if (_count >= SIZE) {
            return false;  // Buffer full
        }
        
        _buffer[_head] = item;
        _head = (_head + 1) % SIZE;
        _count++;
        return true;
    }
    
    // Add element, overwriting oldest if full
    void pushForce(const T& item) {
        if (_count >= SIZE) {
            _tail = (_tail + 1) % SIZE;
            _count--;
        }
        push(item);
    }
    
    // Remove and return oldest element
    bool pop(T& item) {
        if (_count == 0) {
            return false;
        }
        
        item = _buffer[_tail];
        _tail = (_tail + 1) % SIZE;
        _count--;
        return true;
    }
    
    // Peek at oldest element without removing
    bool peek(T& item) const {
        if (_count == 0) {
            return false;
        }
        
        item = _buffer[_tail];
        return true;
    }
    
    // Get element at index (0 = oldest)
    bool get(size_t index, T& item) const {
        if (index >= _count) {
            return false;
        }
        
        size_t idx = (_tail + index) % SIZE;
        item = _buffer[idx];
        return true;
    }
    
    // Clear buffer
    void clear() {
        _head = 0;
        _tail = 0;
        _count = 0;
    }
    
    // Get count
    size_t count() const { return _count; }
    
    // Check if empty
    bool isEmpty() const { return _count == 0; }
    
    // Check if full
    bool isFull() const { return _count >= SIZE; }
    
    // Get available space
    size_t available() const { return SIZE - _count; }
    
    // Get capacity
    static constexpr size_t capacity() { return SIZE; }

private:
    T _buffer[SIZE];
    size_t _head = 0;
    size_t _tail = 0;
    size_t _count = 0;
};

// String-specific ring buffer with dynamic allocation
class StringRingBuffer {
public:
    StringRingBuffer(size_t capacity = 32) : _capacity(capacity), _head(0), _tail(0), _count(0) {
        _buffer = new String[_capacity];
    }
    
    ~StringRingBuffer() {
        delete[] _buffer;
    }
    
    bool push(const String& item) {
        if (_count >= _capacity) return false;
        _buffer[_head] = item;
        _head = (_head + 1) % _capacity;
        _count++;
        return true;
    }
    
    void pushForce(const String& item) {
        if (_count >= _capacity) {
            _tail = (_tail + 1) % _capacity;
            _count--;
        }
        push(item);
    }
    
    bool pop(String& item) {
        if (_count == 0) return false;
        item = _buffer[_tail];
        _tail = (_tail + 1) % _capacity;
        _count--;
        return true;
    }
    
    bool peek(String& item) const {
        if (_count == 0) return false;
        item = _buffer[_tail];
        return true;
    }
    
    void clear() {
        _head = 0;
        _tail = 0;
        _count = 0;
    }
    
    size_t count() const { return _count; }
    bool isEmpty() const { return _count == 0; }
    bool isFull() const { return _count >= _capacity; }
    size_t available() const { return _capacity - _count; }
    size_t capacity() const { return _capacity; }
    
private:
    String* _buffer;
    size_t _capacity;
    size_t _head = 0;
    size_t _tail = 0;
    size_t _count = 0;
};

#endif // RING_BUFFER_H