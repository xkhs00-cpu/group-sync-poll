import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Calendar, Lock, Users } from 'lucide-react';
import { getSchedule, createSchedule } from '@/lib/storage';
import { toast } from 'sonner';

const Auth = () => {
  const [scheduleName, setScheduleName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleCreate = () => {
    if (!scheduleName.trim() || !password.trim()) {
      toast.error('스케줄 이름과 비밀번호를 입력해주세요');
      return;
    }

    const existing = getSchedule(scheduleName, password);
    if (existing) {
      toast.error('이미 존재하는 스케줄입니다. 다른 이름을 사용해주세요');
      return;
    }

    createSchedule(scheduleName, password);
    toast.success('새 스케줄이 생성되었습니다!');
    navigate(`/schedule?name=${encodeURIComponent(scheduleName)}&password=${encodeURIComponent(password)}`);
  };

  const handleJoin = () => {
    if (!scheduleName.trim() || !password.trim()) {
      toast.error('스케줄 이름과 비밀번호를 입력해주세요');
      return;
    }

    const schedule = getSchedule(scheduleName, password);
    if (!schedule) {
      toast.error('일치하는 스케줄을 찾을 수 없습니다');
      return;
    }

    toast.success('스케줄에 참여합니다');
    navigate(`/schedule?name=${encodeURIComponent(scheduleName)}&password=${encodeURIComponent(password)}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
            <Calendar className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              함께 일정 조율
            </h1>
            <p className="mt-2 text-muted-foreground">
              여러 명이 쉽게 가능한 시간을 찾아보세요
            </p>
          </div>
        </div>

        <Card className="shadow-strong">
          <CardHeader>
            <CardTitle>스케줄 시작하기</CardTitle>
            <CardDescription>
              새로운 스케줄을 만들거나 기존 스케줄에 참여하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schedule-name" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                스케줄 이름
              </Label>
              <Input
                id="schedule-name"
                placeholder="예: 3분기 워크숍"
                value={scheduleName}
                onChange={(e) => setScheduleName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                비밀번호
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호 입력"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button onClick={handleCreate} className="w-full">
                새로 만들기
              </Button>
              <Button onClick={handleJoin} variant="secondary" className="w-full">
                참여하기
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>💡 팁: 만든 스케줄의 이름과 비밀번호를 공유하세요</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
