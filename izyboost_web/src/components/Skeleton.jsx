import React from 'react';
import { cn } from '../utils/cn';

const Skeleton = ({ className, variant = 'rect' }) => {
    return (
        <div
            className={cn(
                "animate-pulse bg-slate-200",
                variant === 'circle' ? "rounded-full" : "rounded-2xl",
                className
            )}
        />
    );
};

export default Skeleton;
