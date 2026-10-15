#include "TimeUtils.h"

int TimeUtils::_timezoneOffset = 0;
bool TimeUtils::_timeSet = false;

void TimeUtils::begin() {
    _timeSet = false;
}

void TimeUtils::setTime(time_t t) {
    setTime(t);
    _timeSet = true;
}

void TimeUtils::setTime(int hour, int minute, int second, int day, int month, int year) {
    setTime(hour, minute, second, day, month, year);
    _timeSet = true;
}

time_t TimeUtils::getUnixTime() {
    return now();
}

unsigned long TimeUtils::getMillis() {
    return millis();
}

unsigned long TimeUtils::getMicros() {
    return micros();
}

int TimeUtils::getHour() {
    return hour();
}

int TimeUtils::getMinute() {
    return minute();
}

int TimeUtils::getSecond() {
    return second();
}

int TimeUtils::getDay() {
    return day();
}

int TimeUtils::getMonth() {
    return month();
}

int TimeUtils::getYear() {
    return year();
}

int TimeUtils::getWeekday() {
    return weekday() - 1;  // TimeLib: 1=Sunday, we want 0=Sunday
}

String TimeUtils::formatTime(time_t t, const char* format) {
    char buf[64];
    if (strstr(format, "%Y")) {
        snprintf(buf, sizeof(buf), "%04d-%02d-%02d %02d:%02d:%02d",
            year(t), month(t), day(t), hour(t), minute(t), second(t));
    } else {
        snprintf(buf, sizeof(buf), "%02d:%02d:%02d",
            hour(t), minute(t), second(t));
    }
    return String(buf);
}

String TimeUtils::formatDuration(unsigned long ms) {
    unsigned long seconds = ms / 1000;
    unsigned long minutes = seconds / 60;
    unsigned long hours = minutes / 60;
    unsigned long days = hours / 24;
    
    if (days > 0) {
        return String(days) + "d " + String(hours % 24) + "h";
    } else if (hours > 0) {
        return String(hours) + "h " + String(minutes % 60) + "m";
    } else if (minutes > 0) {
        return String(minutes) + "m " + String(seconds % 60) + "s";
    } else {
        return String(seconds) + "s";
    }
}

unsigned long TimeUtils::getUptime() {
    return millis() / 1000;
}

void TimeUtils::setTimezoneOffset(int offsetSeconds) {
    _timezoneOffset = offsetSeconds;
}

int TimeUtils::getTimezoneOffset() {
    return _timezoneOffset;
}

bool TimeUtils::isTimeSet() {
    return _timeSet;
}

void TimeUtils::sleep(unsigned long ms) {
    delay(ms);
}

void TimeUtils::deepSleep(unsigned long ms) {
    // ESP.deepSleep(ms * 1000);
    delay(ms);  // Fallback
}