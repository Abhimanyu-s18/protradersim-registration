import { Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  { label: 'Personal Details', number: 1 },
  { label: 'Address Details', number: 2 },
  { label: 'Trading Profile', number: 3 },
  { label: 'Verification', number: 4 },
];

interface ProgressStepperProps {
  currentStep: number;
}

const ProgressStepper = ({ currentStep }: ProgressStepperProps) => {
  return (
    <div className="flex items-center justify-between gap-1">
      {steps.map((step, i) => {
        const isActive = step.number === currentStep;
        const isCompleted = step.number < currentStep;
        const isLocked = step.number > currentStep;

        return (
          <div key={step.number} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all',
                  isActive &&
                    'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20',
                  isCompleted &&
                    'border-success bg-success text-success-foreground',
                  isLocked && 'border-border bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : isLocked ? (
                  <Lock className="h-3.5 w-3.5" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={cn(
                  'text-[11px] font-medium text-center leading-tight hidden sm:block',
                  isActive && 'text-primary',
                  isCompleted && 'text-success',
                  isLocked && 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'h-px flex-1 mx-1 mt-[-20px] sm:mt-[-24px]',
                  isCompleted ? 'bg-success' : 'bg-border'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProgressStepper;
