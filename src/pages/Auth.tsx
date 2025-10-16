import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Calendar, Users, Shield, LogOut } from 'lucide-react';
import { createSchedule } from '@/lib/storage';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { scheduleSchema } from '@/lib/validation';

const Auth = () => {
  const [scheduleName, setScheduleName] = useState('');
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleCreate = async () => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      navigate('/login');
      return;
    }

    try {
      const validated = scheduleSchema.parse({ 
        name: scheduleName, 
        password: 'not-used' // Validation requires it but we don't use it anymore
      });
      
      const newSchedule = await createSchedule(validated.name, user.id);
      toast.success('새 스케줄이 생성되었습니다!');
      navigate(`/schedule/${newSchedule.id}`);
    } catch (error: any) {
      if (error.errors) {
        toast.error(error.errors[0].message);
      } else {
        toast.error('오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('로그아웃되었습니다');
    navigate('/login');
  };


  if (!user) {
    return null;
  }

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
            <CardTitle>스케줄 만들기</CardTitle>
            <CardDescription>
              새로운 스케줄을 만드세요
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

            <Button onClick={handleCreate} className="w-full">
              새 스케줄 만들기
            </Button>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2">
          {isAdmin && (
            <Button onClick={() => navigate('/admin')} variant="outline" size="sm" className="w-full">
              <Shield className="w-4 h-4 mr-2" />
              관리자 페이지
            </Button>
          )}
          <Button onClick={handleSignOut} variant="outline" size="sm" className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            로그아웃
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
