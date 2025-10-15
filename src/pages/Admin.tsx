import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Share2, Trash2 } from 'lucide-react';
import { getSchedules, deleteSchedule } from '@/lib/storage';
import { Schedule } from '@/types';
import { toast } from 'sonner';

const Admin = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setSchedules(getSchedules());
  }, []);

  const handleDelete = (scheduleId: string) => {
    deleteSchedule(scheduleId);
    setSchedules(getSchedules());
    toast.success('스케줄이 삭제되었습니다.');
  };

  const handleShare = (schedule: Schedule) => {
    const shareUrl = `${window.location.origin}/schedule?name=${encodeURIComponent(schedule.name)}&password=${encodeURIComponent(schedule.password)}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('스케줄 링크가 복사되었습니다.');
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <Home className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">관리자 페이지</h1>
              <p className="text-sm text-muted-foreground mt-1">
                생성된 스케줄 목록을 관리합니다.
              </p>
            </div>
          </div>
        </div>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>스케줄 목록</CardTitle>
          </CardHeader>
          <CardContent>
            {schedules.length > 0 ? (
              <ul className="space-y-4">
                {schedules.map((schedule) => (
                  <li key={schedule.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <p className="font-semibold">{schedule.name}</p>
                      <p className="text-sm text-muted-foreground">참여자: {schedule.participants.length}명</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleShare(schedule)}>
                        <Share2 className="w-4 h-4 mr-2" />
                        공유
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(schedule.id)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        삭제
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground">생성된 스케줄이 없습니다.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
