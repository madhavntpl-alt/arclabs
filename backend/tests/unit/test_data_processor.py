"""
Unit tests for Data Processor
"""

import pytest
from app.services.data_processor import DataProcessor


class TestDataProcessor:
    @pytest.fixture
    def processor(self):
        return DataProcessor()

    def test_process_reading_water_level(self, processor):
        raw_message = {
            "sensor": "water_level",
            "value": 45.2,
            "unit": "cm",
            "timestamp": 1699900000,
        }
        
        reading = processor.process_reading(raw_message)
        assert reading is not None
        assert reading.sensor_type == "water_level"
        assert reading.value > 0
        assert reading.unit == "cm"

    def test_process_reading_temperature(self, processor):
        raw_message = {
            "sensor": "temperature",
            "value": 25.0,
            "unit": "°C",
            "timestamp": 1699900000,
        }
        
        reading = processor.process_reading(raw_message)
        assert reading is not None
        assert reading.sensor_type == "temperature"
        assert reading.unit == "°C"

    def test_process_reading_gas(self, processor):
        raw_message = {
            "sensor": "gas",
            "value": 450,
            "unit": "ppm",
            "timestamp": 1699900000,
        }
        
        reading = processor.process_reading(raw_message)
        assert reading is not None
        assert reading.sensor_type == "gas"
        assert reading.unit == "ppm"

    def test_process_reading_battery(self, processor):
        raw_message = {
            "sensor": "battery",
            "value": 512,  # Raw ADC value (0-1023)
            "unit": "V",
            "timestamp": 1699900000,
        }
        
        reading = processor.process_reading(raw_message)
        assert reading is not None
        assert reading.sensor_type == "battery"
        assert reading.unit == "V"
        # Battery voltage should be around 3.85V for ADC value 512
        assert 3.0 < reading.value < 4.5

    def test_evaluate_status_normal(self, processor):
        thresholds = {"min": 10, "max": 200}
        status = processor._evaluate_status(50, thresholds)
        assert status.value == "normal"

    def test_evaluate_status_critical_low(self, processor):
        thresholds = {"min": 10, "max": 200}
        status = processor._evaluate_status(5, thresholds)
        assert status.value == "critical"

    def test_evaluate_status_critical_high(self, processor):
        thresholds = {"min": 10, "max": 200}
        status = processor._evaluate_status(250, thresholds)
        assert status.value == "critical"

    def test_evaluate_status_warning_low(self, processor):
        thresholds = {"min": 10, "max": 200}
        status = processor._evaluate_status(11, thresholds)  # Close to min
        assert status.value == "warning"

    def test_evaluate_status_warning_high(self, processor):
        thresholds = {"min": 10, "max": 200}
        status = processor._evaluate_status(180, thresholds)  # Close to max
        assert status.value == "warning"

    def test_aggregate_readings(self, processor):
        readings = [
            {"sensor_type": "temperature", "value": 20.0, "timestamp": 1000},
            {"sensor_type": "temperature", "value": 22.0, "timestamp": 1000},
            {"sensor_type": "temperature", "value": 24.0, "timestamp": 1000},
        ]
        
        result = processor.aggregate_readings(readings, interval_seconds=60)
        assert "temperature" in result
        assert len(result["temperature"]) == 1
        assert result["temperature"][0]["avg"] == 22.0
        assert result["temperature"][0]["min"] == 20.0
        assert result["temperature"][0]["max"] == 24.0
        assert result["temperature"][0]["count"] == 3