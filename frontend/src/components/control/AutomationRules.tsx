'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit, Eye, ToggleLeft, ToggleRight, Copy, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, X, Settings, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Toggle } from '../ui/Toggle';
import { Modal } from '../ui/Modal';
import { AutomationRule, AutomationCondition, AutomationAction } from '../../types/automation';
import { RuleBuilder } from './RuleBuilder';

interface AutomationRulesProps {
  rules: AutomationRule[];
  onCreate: (rule: Omit<AutomationRule, 'id' | 'execution_count' | 'created_at' | 'updated_at'>) => void;
  onUpdate: (rule: AutomationRule) => void;
  onDelete: (ruleId: string) => void;
  onToggle: (ruleId: string, enabled: boolean) => void;
  onDuplicate: (ruleId: string) => void;
  onTest: (ruleId: string) => void;
  className?: string;
}

export function AutomationRules({
  rules,
  onCreate,
  onUpdate,
  onDelete,
  onToggle,
  onDuplicate,
  onTest,
  className,
}: AutomationRulesProps) {
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [deletingRule, setDeletingRule] = useState<string | null>(null);
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());

  const handleCreate = () => {
    setEditingRule(null);
    setShowBuilder(true);
  };

  const handleEdit = (rule: AutomationRule) => {
    setEditingRule(rule);
    setShowBuilder(true);
  };

  const handleDelete = (ruleId: string) => {
    setDeletingRule(ruleId);
  };

  const confirmDelete = () => {
    if (deletingRule) {
      onDelete(deletingRule);
      setDeletingRule(null);
    }
  };

  const toggleExpand = (ruleId: string) => {
    setExpandedRules(prev => {
      const next = new Set(prev);
      if (next.has(ruleId)) {
        next.delete(ruleId);
      } else {
        next.add(ruleId);
      }
      return next;
    });
  };

  const enabledRules = rules.filter(r => r.enabled).length;
  const totalExecutions = rules.reduce((sum, r) => sum + r.execution_count, 0);

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100">Automation Rules</h2>
            <p className="text-sm text-secondary-600 dark:text-secondary-400">
              {enabledRules} of {rules.length} enabled • {totalExecutions} total executions
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Create Rule
        </Button>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        <AnimatePresence>
          {rules.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card p-12 text-center"
            >
              <Zap className="w-16 h-16 text-secondary-300 dark:text-secondary-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">No Automation Rules</h3>
              <p className="text-secondary-500 dark:text-secondary-400 mb-6">
                Create your first automation rule to automatically control actuators based on sensor conditions.
              </p>
              <Button onClick={handleCreate} leftIcon={<Plus className="w-4 h-4" />}>
                Create Rule
              </Button>
            </motion.div>
          ) : (
            rules.map((rule, index) => (
              <RuleCard
                key={rule.id}
                rule={rule}
                index={index}
                expanded={expandedRules.has(rule.id)}
                onToggleExpand={toggleExpand}
                onEdit={() => handleEdit(rule)}
                onDelete={() => handleDelete(rule.id)}
                onDuplicate={() => onDuplicate(rule.id)}
                onTest={() => onTest(rule.id)}
                onToggle={enabled => onToggle(rule.id, enabled)}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Rule Builder Modal */}
      <Modal
        isOpen={showBuilder}
        onClose={() => { setShowBuilder(false); setEditingRule(null); }}
        title={editingRule ? 'Edit Automation Rule' : 'Create Automation Rule'}
        description={editingRule ? 'Modify the automation rule configuration' : 'Define conditions and actions for automated control'}
        size="xl"
      >
        <RuleBuilder
          initialRule={editingRule || undefined}
          onSave={rule => {
            if (editingRule) {
              onUpdate({ ...rule, id: editingRule.id, execution_count: editingRule.execution_count, created_at: editingRule.created_at, updated_at: new Date().toISOString() });
            } else {
              onCreate(rule as Omit<AutomationRule, 'id' | 'execution_count' | 'created_at' | 'updated_at'>);
            }
            setShowBuilder(false);
            setEditingRule(null);
          }}
          onCancel={() => { setShowBuilder(false); setEditingRule(null); }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingRule}
        onClose={() => setDeletingRule(null)}
        title="Delete Rule"
        description="This action cannot be undone. The rule and its execution history will be permanently removed."
        size="sm"
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeletingRule(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function RuleCard({
  rule,
  index,
  expanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onDuplicate,
  onTest,
  onToggle,
}: {
  rule: AutomationRule;
  index: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onTest: () => void;
  onToggle: (enabled: boolean) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="card overflow-hidden"
    >
      {/* Rule Header */}
      <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={clsx(
              'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
              rule.enabled ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-secondary-100 dark:bg-secondary-800'
            )}>
              <Zap className={clsx('w-5 h-5', rule.enabled ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-500')} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 truncate">
                  {rule.name}
                </h3>
                <Badge variant={rule.enabled ? 'success' : 'secondary'}>
                  {rule.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
                <Badge variant="outline">Priority: {rule.priority}</Badge>
              </div>
              <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1 truncate">
                {rule.description || 'No description'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Toggle
              checked={rule.enabled}
              onChange={onToggle}
              size="sm"
              aria-label={rule.enabled ? 'Disable rule' : 'Enable rule'}
            />
            <Button variant="ghost" size="sm" onClick={onTest} leftIcon={<Eye className="w-4 h-4" />} title="Test rule" />
            <Button variant="ghost" size="sm" onClick={onEdit} leftIcon={<Edit className="w-4 h-4" />} title="Edit rule" />
            <Button variant="ghost" size="sm" onClick={onDuplicate} leftIcon={<Copy className="w-4 h-4" />} title="Duplicate rule" />
            <Button variant="ghost" size="sm" onClick={onDelete} leftIcon={<Trash2 className="w-4 h-4" />} title="Delete rule" />
            <button
              onClick={onToggleExpand}
              className="p-2 rounded-lg text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 py-2 bg-secondary-50 dark:bg-secondary-800/50 border-b border-secondary-200 dark:border-secondary-700 flex items-center gap-6 text-sm text-secondary-600 dark:text-secondary-400">
          <span className="flex items-center gap-1">
            <span className="font-medium">{rule.execution_count}</span> executions
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Last: {rule.last_triggered ? new Date(rule.last_triggered).toLocaleString() : 'Never'}
          </span>
          {rule.last_error && (
            <span className="flex items-center gap-1 text-danger-600 dark:text-danger-400">
              <AlertTriangle className="w-4 h-4" />
              Error: {rule.last_error}
            </span>
          )}
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 space-y-4"
            >
              {/* Conditions */}
              <div>
                <h4 className="font-medium text-secondary-900 dark:text-secondary-100 mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Conditions ({rule.logic})
                </h4>
                <div className="space-y-2">
                  {rule.conditions.map((condition, i) => (
                    <div key={i} className="p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg border border-secondary-200 dark:border-secondary-700">
                      <ConditionDisplay condition={condition} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div>
                <h4 className="font-medium text-secondary-900 dark:text-secondary-100 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Actions
                </h4>
                <div className="space-y-2">
                  {rule.actions.map((action, i) => (
                    <div key={i} className="p-3 bg-success-50 dark:bg-success-900/20 rounded-lg border border-success-200 dark:border-success-800">
                      <ActionDisplay action={action} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className="pt-4 border-t border-secondary-200 dark:border-secondary-700 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-secondary-500 dark:text-secondary-400">Cooldown</p>
                  <p className="font-medium">{rule.cooldown_seconds}s</p>
                </div>
                <div>
                  <p className="text-secondary-500 dark:text-secondary-400">Max Executions/Day</p>
                  <p className="font-medium">{rule.max_executions_per_day || 'Unlimited'}</p>
                </div>
                <div>
                  <p className="text-secondary-500 dark:text-secondary-400">Created</p>
                  <p className="font-medium">{new Date(rule.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ConditionDisplay({ condition }: { condition: AutomationCondition }) {
  const sensorLabels: Record<string, string> = {
    water_level: 'Water Level',
    temperature: 'Temperature',
    humidity: 'Humidity',
    gas: 'Gas',
    battery: 'Battery',
  };

  const operatorLabels: Record<string, string> = {
    '<': 'is less than',
    '<=': 'is less than or equal to',
    '>': 'is greater than',
    '>=': 'is greater than or equal to',
    '==': 'equals',
    '!=': 'does not equal',
    'between': 'is between',
    'outside': 'is outside',
  };

  if (condition.type === 'sensor') {
    return (
      <div className="font-mono text-sm">
        <span className="font-medium">{sensorLabels[condition.sensor_type!] || condition.sensor_type}</span>
        <span className="mx-2 text-secondary-500">{operatorLabels[condition.operator!] || condition.operator}</span>
        <span className="font-medium">
          {condition.value}{condition.value_max !== undefined ? ` and ${condition.value_max}` : ''}
        </span>
        {condition.duration_seconds && (
          <span className="ml-2 text-secondary-500">for {condition.duration_seconds}s</span>
        )}
      </div>
    );
  }

  if (condition.type === 'time') {
    return (
      <div className="font-mono text-sm">
        Time between <span className="font-medium">{condition.time_start}</span> and <span className="font-medium">{condition.time_end}</span>
        {condition.days_of_week && (
          <span className="ml-2">on {condition.days_of_week.map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')}</span>
        )}
      </div>
    );
  }

  return <div className="text-sm text-secondary-500">Custom condition</div>;
}

function ActionDisplay({ action }: { action: AutomationAction }) {
  const actionLabels: Record<string, string> = {
    actuator_set: 'Set actuator',
    actuator_toggle: 'Toggle actuator',
    pump_on: 'Turn pump on',
    pump_off: 'Turn pump off',
    notify: 'Send notification',
    log: 'Log event',
    webhook: 'Call webhook',
    set_threshold: 'Set threshold',
    enable_rule: 'Enable rule',
    disable_rule: 'Disable rule',
  };

  let description = actionLabels[action.type] || action.type;

  if (action.type === 'actuator_set' && action.params.actuator_type) {
    description += ` ${action.params.actuator_type} to ${action.params.state ? 'ON' : 'OFF'}`;
  } else if (action.type === 'pump_on' && action.params.duration_seconds) {
    description += ` for ${action.params.duration_seconds}s`;
  } else if (action.type === 'notify' && action.params.message) {
    description += `: "${action.params.message}"`;
  }

  if (action.delay_seconds) {
    description += ` (after ${action.delay_seconds}s delay)`;
  }

  return (
    <div className="font-mono text-sm text-success-700 dark:text-success-300">
      {description}
    </div>
  );
}

import { Clock } from 'lucide-react';