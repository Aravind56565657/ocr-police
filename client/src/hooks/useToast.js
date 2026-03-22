import { useState, useCallback, useEffect } from 'react';

let memoryState = [];
let listeners = [];

const emitChange = () => {
    for (let listener of listeners) {
        listener(memoryState);
    }
};

export const toastEvent = {
    add: (type, message, duration = 4000) => {
        const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
        memoryState = [...memoryState, { id, type, message }];
        emitChange();

        setTimeout(() => {
            toastEvent.remove(id);
        }, duration);
    },
    remove: (id) => {
        memoryState = memoryState.filter(t => t.id !== id);
        emitChange();
    },
    success: (msg) => toastEvent.add('success', msg),
    error: (msg) => toastEvent.add('error', msg),
    warning: (msg) => toastEvent.add('warning', msg),
    info: (msg) => toastEvent.add('info', msg)
};

export function useToast() {
    const [toasts, setToasts] = useState(memoryState);

    useEffect(() => {
        listeners.push(setToasts);
        return () => {
            listeners = listeners.filter(l => l !== setToasts);
        };
    }, []);

    return { toasts, toast: toastEvent };
}
