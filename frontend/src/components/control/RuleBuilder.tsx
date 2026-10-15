'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, ChevronDown, ChevronUp, Settings, Zap, Bell, Clock, CheckCircle, X, Copy } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Toggle } from '../ui/Toggle';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Slider } from '../ui/Slider';
import { SensorType, SENSOR_TYPE_INFO } from '../../constants/sensor-types';
import { ActuatorType, AutomationRule, AutomationCondition, AutomationAction, AutomationActionType, AutomationLogic } from '../../types/automation';

interface RuleBuilderProps {
  initialRule?: AutomationRule;
  onSave: (rule: Partial<AutomationRule>) => void;
  onCancel: () => void;
}

const conditionSensorFields = [
  { key: 'sensor_type', label: 'Sensor', options: Object.values(SensorType).map(t => ({ value: t, label: SENSOR_TYPE_INFO[t as SensorType].label })) },
  { key: 'operator', label: 'Operator', options: [
    { value: '<', label: 'Less than (<)' },
    { value: '<=', label: 'Less than or equal (≤)' },
    { value: '>', label: 'Greater than (>)' },
    { value: '>=', label: 'Greater than or equal (≥)' },
    { value: '==', label: 'Equals (==)' },
    { value: '!=', label: 'Not equals (!=)' },
    { value: 'between', label: 'Between' },
    { value: 'outside', label: 'Outside range' },
  ]},
];

const actionOptions = [
  { value: 'actuator_set', label: 'Set Actuator' },
  { value: 'actuator_toggle', label: 'Toggle Actuator' },
  { value: 'pump_on', label: 'Turn Pump On' },
  { value: 'pump_off', label: 'Turn Pump Off' },
  { value: 'notify', label: 'Send Notification' },
  { value: 'log', label: 'Log Event' },
  { value: 'webhook', label: 'Call Webhook' },
  { value: 'set_threshold', label: 'Set Threshold' },
  { value: 'enable_rule', label: 'Enable Rule' },
  { value: 'disable_rule', label: 'Disable Rule' },
];

export function RuleBuilder({ initialRule, onSave, onCancel }: RuleBuilderProps) {
  const [name, setName] = useState(initialRule?.name || '');
  const [description, setDescription] = useState(initialRule?.description || '');
  const [enabled, setEnabled] = useState(initialRule?.enabled ?? true);
  const [priority, setPriority] = useState(initialRule?.priority ?? 10);
  const [logic, setLogic] = useState<AutomationLogic>(initialRule?.logic ?? 'AND');
  const [cooldown_seconds, setCooldownSeconds] = useState(initialRule?.cooldown_seconds ?? 60);
  const [max_executions_per_day, setMaxExecutionsPerDay] = useState(initialRule?.max_executions_per_day || '');
  const [tags, setTags] = useState(initialRule?.tags?.join(', ') || '');

  const [conditions, setConditions] = useState<AutomationCondition[]>(
    initialRule?.conditions?.map(c => ({ ...c, id: c.id || `cond_${Date.now()}_${Math.random()}` })) || [{
      id: `cond_${Date.now()}`,
      type: 'sensor',
      sensor_type: SensorType.WATER_LEVEL,
      operator: '<',
      value: 20,
      duration_seconds: 30,
    }]
  );

  const [actions, setActions] = useState<AutomationAction[]>(
    initialRule?.actions?.map(a => ({ ...a, id: a.id || `act_${Date.now()}_${Math.random()}` })) || [{
      id: `act_${Date.now()}`,
      type: 'pump_on',
      params: { duration_seconds: 60 },
    }]
  );

  const [expandedConditions, setExpandedConditions] = useState<Set<number>>(new Set([0]));
  const [expandedActions, setExpandedActions] = useState<Set<number>>(new Set([0]));

  // Condition handlers
  const addCondition = () => {
    setConditions(prev => [...prev, {
      id: `cond_${Date.now()}_${Math.random()}`,
      type: 'sensor',
      sensor_type: SensorType.WATER_LEVEL,
      operator: '<',
      value: 0,
      duration_seconds: 0,
    }]);
    setExpandedConditions(prev => new Set([...prev, conditions.length]));
  };

  const removeCondition = (index: number) => {
    if (conditions.length <= 1) return;
    setConditions(prev => prev.filter((_, i) => i !== index));
    setExpandedConditions(prev => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  };

  const updateCondition = (index: number, updates: Partial<AutomationCondition>) => {
    setConditions(prev => prev.map((c, i) => i === index ? { ...c, ...updates } : c));
  };

  const toggleConditionExpand = (index: number) => {
    setExpandedConditions(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // Action handlers
  const addAction = () => {
    setActions(prev => [...prev, {
      id: `act_${Date.now()}_${Math.random()}`,
      type: 'pump_on',
      params: { duration_seconds: 60 },
    }]);
    setExpandedActions(prev => new Set([...prev, actions.length]));
  };

  const removeAction = (index: number) => {
    if (actions.length <= 1) return;
    setActions(prev => prev.filter((_, i) => i !== index));
    setExpandedActions(prev => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  };

  const updateAction = (index: number, updates: Partial<AutomationAction>) => {
    setActions(prev => prev.map((a, i) => i === index ? { ...a, ...updates } : a));
  };

  const toggleActionExpand = (index: number) => {
    setExpandedActions(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleActionTypeChange = (index: number, type: AutomationActionType) => {
    const defaultParams = getDefaultActionParams(type);
    updateAction(index, { type, params: defaultParams });
  };

  const handleActionParamChange = (index: number, key: string, value: any) => {
    updateAction(index, {
      params: { ...actions[index].params, [key]: value },
    });
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Please enter a rule name');
      return;
    }
    if (conditions.length === 0) {
      alert('Please add at least one condition');
      return;
    }
    if (actions.length === 0) {
      alert('Please add at least one action');
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      enabled,
      priority,
      logic,
      conditions,
      actions,
      cooldown_seconds,
      max_executions_per_day: max_executions_per_day ? parseInt(max_executions_per_day) : undefined,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    });
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
      {/* Basic Info */}
      <Card>
        <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
          <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Basic Information
          </h3>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label htmlFor="rule-name" className="label">Rule Name *</label>
            <Input
              id="rule-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Low Water Pump Activation"
            />
          </div>
          <div>
            <label htmlFor="rule-description" className="label">Description</label>
            <Input
              id="rule-description"
              type="textarea"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional description of what this rule does"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Priority</label>
              <Select
                value={priority.toString()}
                onChange={e => setPriority(parseInt(e.target.value))}
                options={Array.from({ length: 100 }, (_, i) => ({ value: (i + 1).toString(), label: `Priority ${i + 1}` }))}
              />
            </div>
            <div>
              <label className="label">Cooldown (seconds)</label>
              <Input
                type="number"
                value={cooldown_seconds}
                onChange={e => setCooldownSeconds(parseInt(e.target.value) || 0)}
                min={0}
                max={86400}
              />
            </div>
            <div>
              <label className="label">Max Executions/Day</label>
              <Input
                type="number"
                value={max_executions_per_day}
                onChange={e => setMaxExecutionsPerDay(e.target.value)}
                min={1}
                placeholder="Unlimited"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Toggle
              checked={enabled}
              onChange={setEnabled}
              label="Enabled"
              description="Rule will be evaluated when enabled"
            />
            <label className="label">Logic</label>
            <Select
              value={logic}
              onChange={e => setLogic(e.target.value as AutomationLogic)}
              options={[
                { value: 'AND', label: 'All conditions must be met (AND)' },
                { value: 'OR', label: 'Any condition can trigger (OR)' },
              ]}
              className="w-64"
            />
          </div>
        </div>
      </Card>

      {/* Conditions */}
      <Card>
        <div className="p-4 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
          <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Conditions ({logic})
          </h3>
          <Button variant="outline" size="sm" onClick={addCondition} leftIcon={<Plus className="w-4 h-4" />}>
            Add Condition
          </Button>
        </div>
        <div className="p-4 space-y-3">
          <AnimatePresence>
            {conditions.map((condition, index) => (
              <motion.div
                key={condition.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border border-secondary-200 dark:border-secondary-700 rounded-lg overflow-hidden"
              >
                <div className="flex items-center gap-2 p-3 bg-secondary-50 dark:bg-secondary-800/50">
                  <Badge variant={condition.type === 'sensor' ? 'primary' : condition.type === 'time' ? 'warning' : 'secondary'}>
                    {condition.type.charAt(0).toUpperCase() + condition.type.slice(1)}
                  </Badge>
                  <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                    Condition #{index + 1}
                  </span>
                  <div className="flex-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleConditionExpand(index)}
                  >
                    {expandedConditions.has(index) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCondition(index)}
                    disabled={conditions.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <AnimatePresence>
                  {expandedConditions.has(index) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 space-y-4 border-t border-secondary-200 dark:border-secondary-700"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select
                          label="Type"
                          value={condition.type}
                          onChange={e => updateCondition(index, { type: e.target.value as any })}
                          options={[
                            { value: 'sensor', label: 'Sensor Reading' },
                            { value: 'time', label: 'Time of Day' },
                            { value: 'state', label: 'Device State' },
                            { value: 'expression', label: 'Custom Expression' },
                          ]}
                        />
                      </div>

                      {condition.type === 'sensor' && (
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                          <Select
                            label="Sensor"
                            value={condition.sensor_type || ''}
                            onChange={e => updateCondition(index, { sensor_type: e.target.value as SensorType })}
                            options={Object.values(SensorType).map(t => ({ value: t, label: SENSOR_TYPE_INFO[t].label }))}
                          />
                          <Select
                            label="Operator"
                            value={condition.operator || ''}
                            onChange={e => updateCondition(index, { operator: e.target.value as any })}
                            options={conditionSensorFields[1].options}
                          />
                          <Input
                            label="Value"
                            type="number"
                            value={condition.value ?? ''}
                            onChange={e => updateCondition(index, { value: parseFloat(e.target.value) || 0 })}
                            step="any"
                          />
                          <Input
                            label="Duration (s)"
                            type="number"
                            value={condition.duration_seconds ?? ''}
                            onChange={e => updateCondition(index, { duration_seconds: parseInt(e.target.value) || 0 })}
                            min={0}
                          />
                        </div>
                      )}

                      {condition.type === 'time' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <Input
                            label="Start Time"
                            type="time"
                            value={condition.time_start || ''}
                            onChange={e => updateCondition(index, { time_start: e.target.value })}
                          />
                          <Input
                            label="End Time"
                            type="time"
                            value={condition.time_end || ''}
                            onChange={e => updateCondition(index, { time_end: e.target.value })}
                          />
                          <Select
                            label="Days"
                            value={condition.days_of_week?.join(',') || ''}
                            onChange={e => updateCondition(index, { days_of_week: e.target.value.split(',').map(Number).filter(n => !isNaN(n)) })}
                            options={[
                              { value: '0,1,2,3,4,5,6', label: 'Every Day' },
                              { value: '1,2,3,4,5', label: 'Weekdays' },
                              { value: '0,6', label: 'Weekends' },
                            ]}
                          />
                        </div>
                      )}

                      {condition.type === 'state' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <Input
                            label="Device ID"
                            value={condition.device_id || ''}
                            onChange={e => updateCondition(index, { device_id: e.target.value })}
                          />
                          <Select
                            label="Actuator"
                            value={condition.actuator_type || ''}
                            onChange={e => updateCondition(index, { actuator_type: e.target.value as ActuatorType })}
                            options={[
                              { value: 'pump', label: 'Pump' },
                              { value: 'valve', label: 'Valve' },
                              { value: 'relay_1', label: 'Relay 1' },
                              { value: 'relay_2', label: 'Relay 2' },
                            ]}
                          />
                          <Select
                            label="State"
                            value={condition.state?.toString() || ''}
                            onChange={e => updateCondition(index, { state: e.target.value === 'true' })}
                            options={[
                              { value: 'true', label: 'ON' },
                              { value: 'false', label: 'OFF' },
                            ]}
                          />
                        </div>
                      )}

                      {condition.type === 'expression' && (
                        <div>
                          <label className="label">JavaScript Expression</label>
                          <textarea
                            value={condition.expression || ''}
                            onChange={e => updateCondition(index, { expression: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 text-sm font-mono border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                            placeholder="e.g., sensors.water_level < 20 && sensors.temperature > 25"
                          />
                          <p className="form-hint">Available: sensors, actuators, devices, now</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Card>

      {/* Actions */}
      <Card>
        <div className="p-4 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
          <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Actions
          </h3>
          <Button variant="outline" size="sm" onClick={addAction} leftIcon={<Plus className="w-4 h-4" />}>
            Add Action
          </Button>
        </div>
        <div className="p-4 space-y-3">
          <AnimatePresence>
            {actions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border border-success-200 dark:border-success-800 rounded-lg overflow-hidden bg-success-50 dark:bg-success-900/10"
              >
                <div className="flex items-center gap-2 p-3 bg-success-50 dark:bg-success-900/20">
                  <Badge variant="success">Action</Badge>
                  <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                    Action #{index + 1}
                  </span>
                  <div className="flex-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleActionExpand(index)}
                  >
                    {expandedActions.has(index) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAction(index)}
                    disabled={actions.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <AnimatePresence>
                  {expandedActions.has(index) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 space-y-4 border-t border-success-200 dark:border-success-800"
                    >
                      <Select
                        label="Action Type"
                        value={action.type}
                        onChange={e => handleActionTypeChange(index, e.target.value as AutomationActionType)}
                        options={actionOptions}
                      />

                      {renderActionParams(action, index)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Card>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-secondary-900 py-4 border-t border-secondary-200 dark:border-secondary-700">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>
          <CheckCircle className="w-4 h-4 mr-1" />
          {initialRule ? 'Save Changes' : 'Create Rule'}
        </Button>
      </div>
    </div>
  );
}

function getDefaultActionParams(type: AutomationActionType) {
  switch (type) {
    case 'actuator_set':
      return { actuator_type: 'pump', state: true };
    case 'actuator_toggle':
      return { actuator_type: 'pump' };
    case 'pump_on':
      return { duration_seconds: 60 };
    case 'pump_off':
      return {};
    case 'notify':
      return { message: 'Automation triggered', severity: 'info' };
    case 'log':
      return { log_message: 'Automation rule executed', log_level: 'info' };
    case 'webhook':
      return { url: '', method: 'POST' };
    case 'set_threshold':
      return { sensor_type: SensorType.WATER_LEVEL };
    case 'enable_rule':
      return { rule_id: '' };
    case 'disable_rule':
      return { rule_id: '' };
    default:
      return {};
  }
}

function renderActionParams(action: AutomationAction, index: number) {
  const params = action.params;
  const onChange = (key: string, value: any) => {
    // This would need to be passed from parent
  };

  switch (action.type) {
    case 'actuator_set':
    case 'actuator_toggle':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Actuator"
            value={params.actuator_type || ''}
            onChange={e => handleActionParamChange(index, 'actuator_type', e.target.value)}
            options={[
              { value: 'pump', label: 'Pump' },
              { value: 'valve', label: 'Valve' },
              { value: 'relay_1', label: 'Relay 1' },
              { value: 'relay_2', label: 'Relay 2' },
            ]}
          />
          {action.type === 'actuator_set' && (
            <Select
              label="State"
              value={params.state?.toString() || ''}
              onChange={e => handleActionParamChange(index, 'state', e.target.value === 'true')}
              options={[
                { value: 'true', label: 'ON' },
                { value: 'false', label: 'OFF' },
              ]}
            />
          )}
        </div>
      );

    case 'pump_on':
      return (
        <div>
          <Input
            label="Duration (seconds)"
            type="number"
            value={params.duration_seconds ?? 60}
            onChange={e => handleActionParamChange(index, 'duration_seconds', parseInt(e.target.value) || 60)}
            min={1}
            max={3600}
          />
        </div>
      );

    case 'notify':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Message"
            value={params.message || ''}
            onChange={e => handleActionParamChange(index, 'message', e.target.value)}
            placeholder="Automation triggered"
          />
          <Select
            label="Severity"
            value={params.severity || 'info'}
            onChange={e => handleActionParamChange(index, 'severity', e.target.value)}
            options={[
              { value: 'info', label: 'Info' },
              { value: 'warning', label: 'Warning' },
              { value: 'critical', label: 'Critical' },
            ]}
          />
        </div>
      );

    case 'log':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Log Message"
            value={params.log_message || ''}
            onChange={e => handleActionParamChange(index, 'log_message', e.target.value)}
            placeholder='Automation rule executed'
          />
          <Select
            label="Log Level"
            value={params.log_level || 'info'}
            onChange={e => handleActionParamChange(index, 'log_level', e.target.value)}
            options={[
              { value: 'info', label: 'Info' },
              { value: 'warning', label: 'Warning' },
              { value: 'error', label: 'Error' },
            ]}
          />
        </div>
      );

    case 'webhook':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="URL"
            type="url"
            value={params.url || ''}
            onChange={e => handleActionParamChange(index, 'url', e.target.value)}
            placeholder="https://example.com/webhook"
          />
          <Select
            label="Method"
            value={params.method || 'POST'}
            onChange={e => handleActionParamChange(index, 'method', e.target.value)}
            options={[
              { value: 'POST', label: 'POST' },
              { value: 'PUT', label: 'PUT' },
              { value: 'PATCH', label: 'PATCH' },
            ]}
          />
        </div>
      );

    case 'set_threshold':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Sensor"
            value={params.sensor_type || ''}
            onChange={e => handleActionParamChange(index, 'sensor_type', e.target.value)}
            options={Object.values(SensorType).map(t => ({ value: t, label: SENSOR_TYPE_INFO[t].label }))}
          />
          <Input
            label="Min Value"
            type="number"
            value={params.min_value ?? ''}
            onChange={e => handleActionParamChange(index, 'min_value', parseFloat(e.target.value))}
            step="any"
            placeholder="Optional"
          />
          <Input
            label="Max Value"
            type="number"
            value={params.max_value ?? ''}
            onChange={e => handleActionParamChange(index, 'max_value', parseFloat(e.target.value))}
            step="any"
            placeholder="Optional"
          />
        </div>
      );

    case 'enable_rule':
    case 'disable_rule':
      return (
        <div>
          <Input
            label="Rule ID"
            value={params.rule_id || ''}
            onChange={e => handleActionParamChange(index, 'rule_id', e.target.value)}
            placeholder="Rule ID to enable/disable"
          />
        </div>
      );

    default:
      return null;
  }
}

export default RuleBuilder;