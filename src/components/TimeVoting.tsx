import { useState } from 'react';
import { TimeOption } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface TimeVotingProps {
  timeOptions: TimeOption[];
  currentParticipantId: string | null;
  onAddTimeOption: (time: string) => void;
  onToggleVote: (optionId: string) => void;
  onDeleteOption: (optionId: string) => void;
}

const TimeVoting = ({
  timeOptions,
  currentParticipantId,
  onAddTimeOption,
  onToggleVote,
  onDeleteOption,
}: TimeVotingProps) => {
  const [newTime, setNewTime] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTime = () => {
    if (!newTime.trim()) {
      toast.error('시간을 입력해주세요');
      return;
    }

    onAddTimeOption(newTime);
    setNewTime('');
    setIsAdding(false);
    toast.success('시간 옵션이 추가되었습니다');
  };

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            시간 투표
          </CardTitle>
          {!isAdding && (
            <Button
              size="sm"
              onClick={() => setIsAdding(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              시간 추가
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isAdding && (
          <div className="flex gap-2 p-3 bg-muted/50 rounded-lg">
            <Input
              placeholder="예: 18:00~19:00"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTime()}
              autoFocus
            />
            <Button onClick={handleAddTime} size="sm">
              추가
            </Button>
            <Button
              onClick={() => {
                setIsAdding(false);
                setNewTime('');
              }}
              variant="outline"
              size="sm"
            >
              취소
            </Button>
          </div>
        )}

        {timeOptions.map((option) => {
          const isVoted = option.votes.includes(currentParticipantId || '');
          const voteCount = option.votes.length;

          return (
            <div
              key={option.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <Checkbox
                  checked={isVoted}
                  onCheckedChange={() => onToggleVote(option.id)}
                  disabled={!currentParticipantId}
                />
                <div className="flex-1">
                  <div className="font-medium">{option.time}</div>
                  <div className="text-sm text-muted-foreground">
                    {voteCount}명 투표
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-primary">
                  {voteCount}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteOption(option.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}

        {timeOptions.length === 0 && !isAdding && (
          <p className="text-sm text-muted-foreground text-center py-8">
            시간 옵션을 추가해주세요
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeVoting;
