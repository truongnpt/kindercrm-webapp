import { z } from 'zod';

type RequestDemoSchemaLocale = 'vi' | 'en';

const COPY: Record<
  RequestDemoSchemaLocale,
  {
    required: string;
    schoolName: string;
    emailInvalid: string;
    phone: string;
    message: string;
  }
> = {
  vi: {
    required: 'Vui lòng nhập thông tin.',
    schoolName: 'Tên trường phải có ít nhất 2 ký tự.',
    emailInvalid: 'Email không hợp lệ.',
    phone: 'Số điện thoại phải có ít nhất 8 ký tự.',
    message: 'Nội dung phải có ít nhất 10 ký tự.',
  },
  en: {
    required: 'This field is required.',
    schoolName: 'School name must be at least 2 characters.',
    emailInvalid: 'Invalid email address.',
    phone: 'Phone number must be at least 8 characters.',
    message: 'Message must be at least 10 characters.',
  },
};

export function createSubmitDemoRequestSchema(
  locale: RequestDemoSchemaLocale = 'vi',
) {
  const copy = COPY[locale];

  return z.object({
    schoolName: z
      .string({ required_error: copy.required })
      .trim()
      .min(2, copy.schoolName)
      .max(160),
    email: z
      .string({ required_error: copy.required })
      .trim()
      .email(copy.emailInvalid)
      .max(320),
    phone: z
      .string({ required_error: copy.required })
      .trim()
      .min(8, copy.phone)
      .max(40),
    message: z
      .string({ required_error: copy.required })
      .trim()
      .min(10, copy.message)
      .max(4000),
  });
}

export const SubmitDemoRequestSchema = createSubmitDemoRequestSchema('vi');

export type SubmitDemoRequestInput = z.infer<typeof SubmitDemoRequestSchema>;
