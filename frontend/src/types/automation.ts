import {
  AutomationOperator,
  AutomationConditionType,
  AutomationCondition,
  AutomationActionType,
  AutomationAction,
  AutomationRule,
  AutomationExecution,
  ConditionResult,
  ActionResult,
  AutomationEngineConfig,
  DEFAULT_AUTOMATION_CONFIG,
  evaluateCondition,
  createAutomationRule,
} from '@arc-labs/shared';

// Re-export shared types
export type {
  AutomationOperator,
  AutomationConditionType,
  AutomationCondition,
  AutomationActionType,
  AutomationAction,
  AutomationRule,
  AutomationExecution,
  ConditionResult,
  ActionResult,
  AutomationEngineConfig,
};

export { DEFAULT_AUTOMATION_CONFIG, evaluateCondition, createAutomationRule };

// Frontend-specific extensions
export interface RuleBuilderProps {
  initialRule?: AutomationRule;
  onSave: (rule: Partial<AutomationRule>) => void;
  onCancel: () => void;
}