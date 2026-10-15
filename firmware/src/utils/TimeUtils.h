/**
 * Time Utilities
 * Time management utilities
 */

#ifndef TIME_UTILS_H
#define TIME_UTILS_H

#include <Arduino.h>
#include <TimeLib.h>

class TimeUtils {
public:
    // Initialize time system
    static void begin();
    
    // Set time from NTP or manual
    static void setTime(time_t t);
    static void setTime(int hour, int minute, int second, int day, int month, int year);
    
    // Get current time
    static time_t getUnixTime();
    static unsigned long getMillis();
    static unsigned long getMicros();
    
    // Time components
    static int getHour();
    static int getMinute();
    static int getSecond();
    static int getDay();
    static int getMonth();
    static int getYear();
    static int getWeekday();  // 0 = Sunday
    
    // Format time as string
    static String formatTime(time_t t, const char* format = "%Y-%m-%d %H:%M:%S");
    static String formatDuration(unsigned long ms);
    
    // Time since epoch
    static unsigned long getUptime();
    
    // Timezone offset (seconds)
    static void setTimezoneOffset(int offsetSeconds);
    static int getTimezoneOffset();
    
    // Check if time is set
    static bool isTimeSet();
    
    // Sleep/wake utilities
    static void sleep(unsigned long ms);
    static void deepSleep(unsigned long ms);

private:
    static int _timezoneOffset;
    static bool _timeSet;
};

#endif // TIME_UTILS_H