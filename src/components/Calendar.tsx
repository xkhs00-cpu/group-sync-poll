import { useState } from 'react';
import { DateSelection, Participant } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';

interface CalendarProps {
  dateSelections: DateSelection[];
  participants: Participant[];
  currentParticipantId: string | null;
  onDateToggle: (date: string) => void;
}

const Calendar = ({ dateSelections, participants, currentParticipantId, onDateToggle }: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const months = [0, 1, 2, 3].map(offset => addMonths(currentMonth, offset));

  const getDaySelection = (date: Date): DateSelection | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return dateSelections.find(ds => ds.date === dateStr);
  };

  const handleDateClick = (date: Date) => {
    if (!currentParticipantId) return;
    const dateStr = format(date, 'yyyy-MM-dd');
    onDateToggle(dateStr);
  };

  const renderMonth = (monthDate: Date) => {
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const days = eachDayOfInterval({ start, end });
    
    const startDay = start.getDay();
    const emptyDays = Array(startDay).fill(null);
    
    return (
      <Card key={monthDate.toISOString()} className="shadow-medium">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-center">
            {format(monthDate, 'yyyy년 M월', { locale: ko })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['일', '월', '화', '수', '목', '금', '토'].map(day => (
              <div key={day} className="text-xs font-medium text-center text-muted-foreground p-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {emptyDays.map((_, idx) => (
              <div key={`empty-${idx}`} className="aspect-square" />
            ))}
            {days.map(day => {
              const selection = getDaySelection(day);
              const isSelected = selection?.participantIds.includes(currentParticipantId || '');
              const selectedParticipants = selection?.participantIds.map(id => 
                participants.find(p => p.id === id)
              ).filter(Boolean) || [];

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDateClick(day)}
                  className={`
                    aspect-square rounded-lg text-sm font-medium
                    transition-all duration-200
                    hover:scale-105 hover:shadow-md
                    ${!isSameMonth(day, monthDate) ? 'text-muted-foreground/30' : ''}
                    ${isSelected ? 'ring-2 ring-primary' : ''}
                  `}
                  style={{
                    background: selectedParticipants.length > 0
                      ? `linear-gradient(${selectedParticipants.map((p, idx) => {
                          const percent = (100 / selectedParticipants.length);
                          return `${p?.color} ${idx * percent}%, ${p?.color} ${(idx + 1) * percent}%`;
                        }).join(', ')})`
                      : 'transparent',
                    color: selectedParticipants.length > 0 ? 'white' : 'inherit',
                  }}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          날짜 선택
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(prev => addMonths(prev, -1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {months.map(month => renderMonth(month))}
      </div>
    </div>
  );
};

export default Calendar;
