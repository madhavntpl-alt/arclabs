import {
  Alert,
  AlertSeverity,
  AlertStatus,
  ThresholdConfig,
  SensorThreshold,
  ThresholdEvaluationResult,
  AlertRule,
  AlertCondition,
  AlertAction,
  AlertNotification,
  evaluateThreshold,
  evaluateCondition,
  getSeverityColor,
  getSeverityLabel,
  getSeverityPriority,
} from '@arc-labs/shared';

// Re-export shared types
export type {
  Alert,
  AlertSeverity,
  AlertStatus,
  ThresholdConfig,
  SensorThreshold,
  ThresholdEvaluationResult,
  AlertRule,
  AlertCondition,
  AlertAction,
  AlertNotification,
};

export { evaluateThreshold, evaluateCondition, getSeverityColor, getSeverityLabel, getSeverityPriority };

// Frontend-specific extensions
export interface AlertListProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  onDismiss: (id: string) => void;
  filters?: { severity?: AlertSeverity; status?: AlertStatus };
}