import { Button } from '@/components/ui/button';
import { HelpCircle, Package, Clock, AlertTriangle, CheckCircle, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SampleQuestion {
  text: string;
  category: string;
  icon: keyof typeof iconMap;
}

const iconMap = {
  HelpCircle,
  Package,
  Clock,
  AlertTriangle,
  CheckCircle,
  Star,
};

interface SampleQuestionsProps {
  questions: SampleQuestion[];
  onSelectQuestion: (question: string) => void;
  disabled?: boolean;
}

export default function SampleQuestions({ questions, onSelectQuestion, disabled = false }: SampleQuestionsProps) {
  return (
    <div className="w-full">
      <div className="text-center mb-4">
        <p className="text-sm font-semibold text-foreground mb-1">Quick Questions</p>
        <p className="text-xs text-muted-foreground">Click any question to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {questions.map((question, idx) => {
          const Icon = iconMap[question.icon];
          return (
            <Button
              key={idx}
              onClick={() => onSelectQuestion(question.text)}
              disabled={disabled}
              variant="outline"
              className={cn(
                'h-auto py-3 px-4 justify-start text-left hover:bg-secondary hover:border-blue-500/50 transition-colors',
                'border border-border'
              )}
            >
              <Icon className="size-4 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium line-clamp-2">{question.text}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
