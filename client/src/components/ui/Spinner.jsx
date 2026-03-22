import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export default function Spinner({ className }) {
    return <Loader2 className={clsx("animate-spin text-current", className)} />;
}
