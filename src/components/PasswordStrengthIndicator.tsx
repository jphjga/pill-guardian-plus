import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };

    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    if (checks.length) score++;
    if (checks.lowercase) score++;
    if (checks.uppercase) score++;
    if (checks.number) score++;
    if (checks.special) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-destructive', checks };
    if (score <= 3) return { score, label: 'Medium', color: 'bg-yellow-500', checks };
    if (score <= 4) return { score, label: 'Good', color: 'bg-blue-500', checks };
    return { score, label: 'Strong', color: 'bg-green-500', checks };
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-3 mt-2">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= strength.score ? strength.color : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <p className={`text-xs font-medium ${
          strength.label === 'Weak' ? 'text-destructive' :
          strength.label === 'Medium' ? 'text-yellow-500' :
          strength.label === 'Good' ? 'text-blue-500' : 'text-green-500'
        }`}>
          {strength.label} password
        </p>
      </div>

      {/* Requirements checklist */}
      <div className="grid grid-cols-2 gap-1 text-xs">
        <RequirementItem met={strength.checks?.length} label="8+ characters" />
        <RequirementItem met={strength.checks?.lowercase} label="Lowercase" />
        <RequirementItem met={strength.checks?.uppercase} label="Uppercase" />
        <RequirementItem met={strength.checks?.number} label="Number" />
        <RequirementItem met={strength.checks?.special} label="Special char" />
      </div>
    </div>
  );
};

const RequirementItem = ({ met, label }: { met?: boolean; label: string }) => (
  <div className={`flex items-center gap-1.5 ${met ? 'text-green-500' : 'text-muted-foreground'}`}>
    {met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
    <span>{label}</span>
  </div>
);

export default PasswordStrengthIndicator;
