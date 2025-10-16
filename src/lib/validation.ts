import { z } from 'zod';

export const scheduleSchema = z.object({
  name: z.string()
    .trim()
    .min(1, '스케줄 이름을 입력해주세요')
    .max(100, '스케줄 이름은 100자 이하여야 합니다'),
  password: z.string()
    .min(4, '비밀번호는 최소 4자 이상이어야 합니다')
    .max(50, '비밀번호는 50자 이하여야 합니다'),
});

export const participantSchema = z.object({
  name: z.string()
    .trim()
    .min(1, '참여자 이름을 입력해주세요')
    .max(50, '참여자 이름은 50자 이하여야 합니다'),
});

export const timeOptionSchema = z.object({
  time: z.string()
    .trim()
    .min(1, '시간을 입력해주세요')
    .max(50, '시간은 50자 이하여야 합니다'),
});

export const authSchema = z.object({
  email: z.string()
    .email('올바른 이메일 주소를 입력해주세요')
    .max(255, '이메일은 255자 이하여야 합니다'),
  password: z.string()
    .min(6, '비밀번호는 최소 6자 이상이어야 합니다')
    .max(50, '비밀번호는 50자 이하여야 합니다'),
});
