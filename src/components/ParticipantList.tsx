import { Participant } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ParticipantListProps {
  participants: Participant[];
  currentParticipantId: string | null;
  selectedParticipantId: string | null;
  onParticipantSelect: (id: string) => void;
  onAddParticipant: () => void;
}

const ParticipantList = ({
  participants,
  currentParticipantId,
  selectedParticipantId,
  onParticipantSelect,
  onAddParticipant,
}: ParticipantListProps) => {
  return (
    <Card className="shadow-medium">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5" />
          참여자 ({participants.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {participants.map((participant) => (
            <button
              key={participant.id}
              onClick={() => onParticipantSelect(participant.id)}
              className={cn(
                "w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left",
                participant.id === selectedParticipantId && 'bg-muted'
              )}
            >
              <div
                className="w-4 h-4 rounded-full shadow-sm"
                style={{ backgroundColor: participant.color }}
              />
              <span className={cn(
                "text-sm",
                participant.id === selectedParticipantId && 'font-semibold'
              )}>
                {participant.name}
                {participant.id === currentParticipantId && ' (나)'}
              </span>
            </button>
          ))}
          {participants.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              아직 참여자가 없습니다
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onAddParticipant} className="w-full">
          <UserPlus className="w-4 h-4 mr-2" />
          참여자 추가
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ParticipantList;
