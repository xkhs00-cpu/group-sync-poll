import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, UserPlus, Save, Share2 } from 'lucide-react';
import { getSchedule, saveSchedule } from '@/lib/storage';
import { Schedule as ScheduleType, Participant, PARTICIPANT_COLORS } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { participantSchema } from '@/lib/validation';
import ParticipantList from '@/components/ParticipantList';
import Calendar from '@/components/Calendar';
import TimeVoting from '@/components/TimeVoting';

const Schedule = () => {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleType | null>(null);
  const [currentParticipantId, setCurrentParticipantId] = useState<string | null>(null);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [participantName, setParticipantName] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!scheduleId) {
      navigate('/');
      return;
    }

    const loadScheduleData = async () => {
      try {
        const loadedSchedule = await getSchedule(scheduleId);
        if (!loadedSchedule) {
          toast.error('스케줄을 찾을 수 없습니다');
          navigate('/');
          return;
        }

        setSchedule(loadedSchedule);

        const savedParticipantId = localStorage.getItem(`participant-${loadedSchedule.id}`);
        if (savedParticipantId && loadedSchedule.participants.find(p => p.id === savedParticipantId)) {
          setCurrentParticipantId(savedParticipantId);
          setSelectedParticipantId(savedParticipantId);
        } else {
          setShowJoinDialog(true);
        }
      } catch (error) {
        toast.error('스케줄을 불러오는 중 오류가 발생했습니다.');
        console.error('Load schedule error:', error);
        navigate('/');
      }
    };

    loadScheduleData();
  }, [scheduleId, user, navigate]);

  const handleJoin = async () => {
    if (!schedule) return;

    try {
      const validated = participantSchema.parse({ name: participantName });
      
      const newParticipant: Participant = {
        id: crypto.randomUUID(),
        name: validated.name,
        color: PARTICIPANT_COLORS[schedule.participants.length % PARTICIPANT_COLORS.length],
      };

    const updatedSchedule = {
      ...schedule,
      participants: [...schedule.participants, newParticipant],
    };

      await saveSchedule(updatedSchedule);
      setSchedule(updatedSchedule);
      setCurrentParticipantId(newParticipant.id);
      setSelectedParticipantId(newParticipant.id);
      localStorage.setItem(`participant-${schedule.id}`, newParticipant.id);
      setShowJoinDialog(false);
      toast.success(`${validated.name}님, 환영합니다!`);
    } catch (error: any) {
      if (error.errors) {
        toast.error(error.errors[0].message);
      } else {
        toast.error('참여 중 오류가 발생했습니다.');
      }
    }
  };

  const handleAddParticipant = async () => {
    const name = prompt('새 참여자의 이름을 입력하세요:');
    if (name && schedule) {
      const newParticipant: Participant = {
        id: crypto.randomUUID(),
        name,
        color: PARTICIPANT_COLORS[schedule.participants.length % PARTICIPANT_COLORS.length],
      };
      const updatedSchedule = {
        ...schedule,
        participants: [...schedule.participants, newParticipant],
      };

      try {
        await saveSchedule(updatedSchedule);
        setSchedule(updatedSchedule);
        toast.success(`${name}님이 추가되었습니다.`);
      } catch (error) {
        toast.error('참여자 추가 중 오류가 발생했습니다.');
        console.error('Add participant error:', error);
      }
    }
  };

  const handleDateToggle = async (date: string) => {
    if (!schedule || !selectedParticipantId) return;

    const existingSelection = schedule.dateSelections.find(ds => ds.date === date);
    let updatedSelections;

    if (existingSelection) {
      const isSelected = existingSelection.participantIds.includes(selectedParticipantId);
      if (isSelected) {
        const newParticipantIds = existingSelection.participantIds.filter(id => id !== selectedParticipantId);
        if (newParticipantIds.length === 0) {
          updatedSelections = schedule.dateSelections.filter(ds => ds.date !== date);
        } else {
          updatedSelections = schedule.dateSelections.map(ds =>
            ds.date === date ? { ...ds, participantIds: newParticipantIds } : ds
          );
        }
      } else {
        updatedSelections = schedule.dateSelections.map(ds =>
          ds.date === date
            ? { ...ds, participantIds: [...ds.participantIds, selectedParticipantId] }
            : ds
        );
      }
    } else {
      updatedSelections = [
        ...schedule.dateSelections,
        { date, participantIds: [selectedParticipantId] },
      ];
    }

    const updatedSchedule = {
      ...schedule,
      dateSelections: updatedSelections,
    };

    try {
      await saveSchedule(updatedSchedule);
      setSchedule(updatedSchedule);
    } catch (error) {
      toast.error('날짜 선택 중 오류가 발생했습니다.');
      console.error('Toggle date error:', error);
    }
  };

  const handleAddTimeOption = async (time: string) => {
    if (!schedule) return;

    const newOption = {
      id: crypto.randomUUID(),
      time,
      votes: [],
    };

    const updatedSchedule = {
      ...schedule,
      timeOptions: [...schedule.timeOptions, newOption],
    };

    try {
      await saveSchedule(updatedSchedule);
      setSchedule(updatedSchedule);
    } catch (error) {
      toast.error('시간 옵션 추가 중 오류가 발생했습니다.');
      console.error('Add time option error:', error);
    }
  };

  const handleToggleVote = async (optionId: string) => {
    if (!schedule || !currentParticipantId) return;

    const updatedOptions = schedule.timeOptions.map(option => {
      if (option.id === optionId) {
        const hasVoted = option.votes.includes(currentParticipantId);
        return {
          ...option,
          votes: hasVoted
            ? option.votes.filter(id => id !== currentParticipantId)
            : [...option.votes, currentParticipantId],
        };
      }
      return option;
    });

    const updatedSchedule = {
      ...schedule,
      timeOptions: updatedOptions,
    };

    try {
      await saveSchedule(updatedSchedule);
      setSchedule(updatedSchedule);
    } catch (error) {
      toast.error('투표 중 오류가 발생했습니다.');
      console.error('Toggle vote error:', error);
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    if (!schedule) return;

    const updatedSchedule = {
      ...schedule,
      timeOptions: schedule.timeOptions.filter(option => option.id !== optionId),
    };

    try {
      await saveSchedule(updatedSchedule);
      setSchedule(updatedSchedule);
      toast.success('시간 옵션이 삭제되었습니다');
    } catch (error) {
      toast.error('삭제 중 오류가 발생했습니다.');
      console.error('Delete option error:', error);
    }
  };
  
  const handleSave = async () => {
    if (schedule) {
      try {
        await saveSchedule(schedule);
        toast.success('스케줄이 저장되었습니다.');
      } catch (error) {
        toast.error('저장 중 오류가 발생했습니다.');
        console.error('Save schedule error:', error);
      }
    }
  };

  const handleShare = () => {
    if (schedule) {
      const shareUrl = `${window.location.origin}/schedule/${schedule.id}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success('공유 링크가 복사되었습니다.');
    }
  };


  if (!schedule) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{schedule.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                여러 명이 함께 가능한 시간을 찾아보세요
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} variant="outline">
              <Save className="w-4 h-4 mr-2" />
              저장
            </Button>
            <Button onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              공유
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ParticipantList
              participants={schedule.participants}
              currentParticipantId={currentParticipantId}
              selectedParticipantId={selectedParticipantId}
              onParticipantSelect={setSelectedParticipantId}
              onAddParticipant={handleAddParticipant}
            />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <Calendar
              dateSelections={schedule.dateSelections}
              participants={schedule.participants}
              currentParticipantId={selectedParticipantId}
              onDateToggle={handleDateToggle}
            />

            <TimeVoting
              timeOptions={schedule.timeOptions}
              currentParticipantId={currentParticipantId}
              onAddTimeOption={handleAddTimeOption}
              onToggleVote={handleToggleVote}
              onDeleteOption={handleDeleteOption}
            />
          </div>
        </div>
      </div>

      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              스케줄 참여하기
            </DialogTitle>
            <DialogDescription>
              {schedule.name}에 참여하려면 이름을 입력해주세요
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="participant-name">이름</Label>
              <Input
                id="participant-name"
                placeholder="이름을 입력하세요"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                autoFocus
              />
            </div>
            <Button onClick={handleJoin} className="w-full">
              참여하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Schedule;
