import React, { useState } from 'react';
import { extractVariables, replaceVariables, PromptVariable } from '../types';
import { Icons } from './Icon';

interface VariableModalProps {
    content: string;
    onCopy: (finalContent: string) => void;
    onClose: () => void;
}

export const VariableModal: React.FC<VariableModalProps> = ({
    content,
    onCopy,
    onClose,
}) => {
    const variables = extractVariables(content);
    const [values, setValues] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        variables.forEach(v => {
            initial[v.name] = v.defaultValue || '';
        });
        return initial;
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalContent = replaceVariables(content, values);
        onCopy(finalContent);
        onClose();
    };

    const getPreview = () => {
        return replaceVariables(content, values);
    };

    return (
        <div className="modal-backdrop animate-fade-in" onClick={onClose}>
            <div
                className="modal animate-scale-in"
                style={{ maxWidth: '600px' }}
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className="p-2 rounded-lg"
                                style={{ background: 'var(--color-accent-bg)' }}
                            >
                                <Icons.Zap size={20} style={{ color: 'var(--color-accent)' }} />
                            </div>
                            <div>
                                <h3 style={{
                                    fontSize: 'var(--text-lg)',
                                    fontWeight: 600,
                                    color: 'var(--color-text-primary)',
                                    margin: 0,
                                }}>
                                    Fill Variables
                                </h3>
                                <p style={{
                                    fontSize: 'var(--text-sm)',
                                    color: 'var(--color-text-tertiary)',
                                    margin: 0,
                                }}>
                                    {variables.length} variable{variables.length !== 1 ? 's' : ''} detected
                                </p>
                            </div>
                        </div>
                        <button
                            className="btn btn-ghost btn-icon"
                            onClick={onClose}
                        >
                            <Icons.X size={20} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            {variables.map((variable) => (
                                <div key={variable.name}>
                                    <label
                                        style={{
                                            display: 'block',
                                            fontSize: 'var(--text-sm)',
                                            fontWeight: 500,
                                            color: 'var(--color-text-primary)',
                                            marginBottom: 'var(--space-2)',
                                        }}
                                    >
                                        <span className="variable-highlight">{`{{${variable.name}}}`}</span>
                                        {variable.defaultValue && (
                                            <span style={{
                                                marginLeft: 'var(--space-2)',
                                                fontSize: 'var(--text-xs)',
                                                color: 'var(--color-text-tertiary)',
                                            }}>
                                                Default: {variable.defaultValue}
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={values[variable.name]}
                                        onChange={e => setValues(prev => ({
                                            ...prev,
                                            [variable.name]: e.target.value,
                                        }))}
                                        placeholder={`Enter value for ${variable.name}`}
                                        autoFocus={variables.indexOf(variable) === 0}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Preview */}
                        <div style={{ marginTop: 'var(--space-6)' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-2)',
                                fontSize: 'var(--text-xs)',
                                fontWeight: 600,
                                color: 'var(--color-text-tertiary)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: 'var(--space-2)',
                            }}>
                                <Icons.Eye size={14} />
                                Preview
                            </label>
                            <div
                                style={{
                                    padding: 'var(--space-4)',
                                    background: 'var(--color-bg-secondary)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--color-border)',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 'var(--text-sm)',
                                    color: 'var(--color-text-secondary)',
                                    maxHeight: '150px',
                                    overflowY: 'auto',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                }}
                            >
                                {getPreview()}
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            <Icons.Copy size={16} />
                            Copy to Clipboard
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Hook to check if content has variables
export function useHasVariables(content: string): boolean {
    return extractVariables(content).length > 0;
}
