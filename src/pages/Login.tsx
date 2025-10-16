import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { authSchema } from '@/lib/validation';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async () => {
    try {
      const validated = authSchema.parse({ email, password });
      setIsLoading(true);

      const { error } = await signIn(validated.email, validated.password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('이메일 또는 비밀번호가 올바르지 않습니다');
        } else {
          toast.error('로그인 중 오류가 발생했습니다');
        }
        return;
      }

      toast.success('로그인 성공!');
      navigate('/');
    } catch (error: any) {
      if (error.errors) {
        toast.error(error.errors[0].message);
      } else {
        toast.error('입력값을 확인해주세요');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    try {
      const validated = authSchema.parse({ email, password });
      setIsLoading(true);

      const { error } = await signUp(validated.email, validated.password);
      
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('이미 등록된 이메일입니다');
        } else {
          toast.error('회원가입 중 오류가 발생했습니다');
        }
        return;
      }

      toast.success('회원가입 성공! 로그인해주세요.');
    } catch (error: any) {
      if (error.errors) {
        toast.error(error.errors[0].message);
      } else {
        toast.error('입력값을 확인해주세요');
      }
    } finally {
      setIsLoading(false);
    }
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
              로그인하여 스케줄을 관리하세요
            </p>
          </div>
        </div>

        <Card className="shadow-strong">
          <CardHeader>
            <CardTitle>계정</CardTitle>
            <CardDescription>
              로그인하거나 새 계정을 만드세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">로그인</TabsTrigger>
                <TabsTrigger value="signup">회원가입</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    이메일
                  </Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSignIn()}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    비밀번호
                  </Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="비밀번호 입력"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSignIn()}
                  />
                </div>

                <Button onClick={handleSignIn} className="w-full" disabled={isLoading}>
                  {isLoading ? '로그인 중...' : '로그인'}
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    이메일
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSignUp()}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    비밀번호
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="비밀번호 입력 (최소 6자)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSignUp()}
                  />
                </div>

                <Button onClick={handleSignUp} className="w-full" disabled={isLoading}>
                  {isLoading ? '가입 중...' : '회원가입'}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
