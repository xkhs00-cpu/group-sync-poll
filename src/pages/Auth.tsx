import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Calendar, Lock, Users, Shield, LogOut } from 'lucide-react';
import { getSchedule, createSchedule, getScheduleByName } from '@/lib/storage';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const Auth = () => {
  const [scheduleName, setScheduleName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const auth = useAuth();

  // --- 1. 새로운 스케줄 만들기 기능 ---
  const handleCreate = () => {
    // 입력값 검증
    if (!scheduleName.trim() || !password.trim()) {
      toast.error('스케줄 이름과 비밀번호를 입력해주세요');
      return;
    }
    if (!/^\d+$/.test(password)) {
      toast.error('비밀번호는 숫자로만 입력해주세요.');
      return;
    }

    // 동일한 이름의 스케줄이 있는지 확인
    const existing = getScheduleByName(scheduleName);
    if (existing) {
      toast.error('이미 존재하는 스케줄 이름입니다. 다른 이름을 사용해주세요');
      return;
    }

    // 새 스케줄 생성 및 페이지 이동
    createSchedule(scheduleName, password);
    toast.success('새 스케줄이 생성되었습니다!');
    navigate(`/schedule?name=${encodeURIComponent(scheduleName)}&password=${encodeURIComponent(password)}`);
  };

  // --- 2. 기존 스케줄 불러오기 (참여하기) 기능 ---
  const handleJoin = () => {
    // 입력값 검증
    if (!scheduleName.trim() || !password.trim()) {
      toast.error('스케줄 이름과 비밀번호를 입력해주세요');
      return;
    }

    // 스케줄 정보 확인
    const schedule = getSchedule(scheduleName, password);
    if (!schedule) {
      toast.error('일치하는 스케줄을 찾을 수 없습니다');
      return;
    }

    // 스케줄 페이지로 이동
    toast.success('스케줄에 참여합니다');
    navigate(`/schedule?name=${encodeURIComponent(scheduleName)}&password=${encodeURIComponent(password)}`);
  };

  const handleAdminLogin = () => {
    const adminId = prompt('관리자 아이디를 입력하세요:');
    if (adminId === 'admin') {
      const adminPassword = prompt('관리자 비밀번호를 입력하세요:');
      if (adminPassword === '0000') {
        navigate('/admin');
      } else {
        toast.error('비밀번호가 올바르지 않습니다.');
      }
    } else if (adminId) {
      toast.error('아이디가 올바르지 않습니다.');
    }
  };

  const handleLogout = () => {
    auth?.logout();
    navigate('/login');
    toast.info('로그아웃되었습니다.');
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8 relative">
        <div className="absolute top-0 right-0">
          <Button onClick={handleLogout} variant="ghost" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            로그아웃
          </Button>
        </div>
        <div className="text-center space-y-4 pt-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
            <Calendar className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              함께 일정 조율
            </h1>
            <p className="mt-2 text-muted-foreground">
              {auth?.currentUser?.username}님, 환영합니다!
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                비밀번호 (숫자)
              </Label>
              <Input
                id="password"
                type="number"
                placeholder="숫자로된 비밀번호 입력"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
        <div className="text-center">
            <Button onClick={handleAdminLogin} variant="outline" size="sm">
                <Shield className="w-4 h-4 mr-2" />
                관리자 로그인
            </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>💡 팁: 만든 스케줄의 이름과 비밀번호를 공유하세요</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
