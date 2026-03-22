import React, { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import api from '../../services/api';
import Spinner from '../ui/Spinner';
import { clsx } from 'clsx';
import ConfidenceBadge from './ConfidenceBadge';

export default function EditableField({
    value,
    fieldPath,
    recordId,
    fieldType = 'text',
    options = [],
    confidence,
    manuallyEdited,
    onUpdate
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value || '');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSave = async () => {
        if (currentValue === value) {
            setIsEditing(false);
            return;
        }

        setIsLoading(true);
        try {
            await api.patch(`/records/${recordId}/field`, {
                fieldPath,
                newValue: currentValue
            });
            toast.success('Field updated');
            setIsEditing(false);
            if (onUpdate) onUpdate(fieldPath, currentValue);
        } catch (err) {
            toast.error('Failed to update: ' + err.message);
            setCurrentValue(value || '');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setCurrentValue(value || '');
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="flex items-start gap-2 w-full animate-fade-in">
                {fieldType === 'select' ? (
                    <select
                        value={currentValue}
                        onChange={(e) => setCurrentValue(e.target.value)}
                        className="flex-1 bg-slate-900 border border-navy-500 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-navy-500"
                    >
                        <option value="">Select option</option>
                        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                ) : fieldType === 'textarea' ? (
                    <textarea
                        value={currentValue}
                        onChange={(e) => setCurrentValue(e.target.value)}
                        className="flex-1 bg-slate-900 border border-navy-500 rounded px-3 py-1.5 text-sm text-white focus:outline-none min-h-[80px]"
                    />
                ) : (
                    <input
                        type={fieldType}
                        value={currentValue}
                        onChange={(e) => setCurrentValue(e.target.value)}
                        className="flex-1 bg-slate-900 border border-navy-500 rounded px-3 py-1.5 text-sm text-white focus:outline-none"
                    />
                )}

                <div className="flex gap-1 mt-1">
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="p-1 text-emerald-500 hover:bg-emerald-500/20 rounded transition-colors"
                    >
                        {isLoading ? <Spinner className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="group relative flex items-center flex-wrap gap-2 text-sm text-white hover:bg-slate-800/50 -mx-2 px-2 py-1 rounded transition-colors">
            <div className="flex-1 break-words min-h-[24px] flex items-center">
                {value ? value : <span className="text-slate-500 italic">Not detected</span>}
            </div>

            <div className="flex items-center gap-2">
                {manuallyEdited && (
                    <span className="text-[10px] uppercase font-bold text-navy-400 bg-navy-400/10 px-1.5 py-0.5 rounded">Edited</span>
                )}
                {confidence !== undefined && (
                    <ConfidenceBadge confidence={confidence} size="sm" showLabel={false} />
                )}

                <button
                    onClick={() => setIsEditing(true)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition-opacity"
                    title="Edit field"
                >
                    <Pencil className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
