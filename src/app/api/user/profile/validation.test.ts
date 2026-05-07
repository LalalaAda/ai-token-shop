import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const updateSchema = z.object({
  nickname: z.string().min(1, '昵称不能为空').max(50, '昵称最多50个字符').optional(),
  avatar: z.string().url('头像地址无效').optional().or(z.literal('')),
});

describe('User Profile Validation', () => {
  it('accepts valid nickname update', () => {
    const result = updateSchema.safeParse({ nickname: '新昵称' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nickname).toBe('新昵称');
    }
  });

  it('accepts empty object (no fields to update)', () => {
    const result = updateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('rejects empty nickname', () => {
    const result = updateSchema.safeParse({ nickname: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('昵称不能为空');
    }
  });

  it('rejects nickname exceeding 50 characters', () => {
    const result = updateSchema.safeParse({ nickname: 'a'.repeat(51) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('昵称最多50个字符');
    }
  });

  it('accepts valid avatar URL', () => {
    const result = updateSchema.safeParse({ avatar: 'https://example.com/avatar.jpg' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid avatar URL', () => {
    const result = updateSchema.safeParse({ avatar: 'not-a-url' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('头像地址无效');
    }
  });

  it('accepts empty string avatar (clear avatar)', () => {
    const result = updateSchema.safeParse({ avatar: '' });
    expect(result.success).toBe(true);
  });

  it('accepts nickname + avatar together', () => {
    const result = updateSchema.safeParse({
      nickname: '新昵称',
      avatar: 'https://example.com/avatar.jpg',
    });
    expect(result.success).toBe(true);
  });

  it('preserves only valid fields, ignores extra', () => {
    const result = updateSchema.safeParse({
      nickname: 'test',
      extraField: 'should be ignored',
    });
    expect(result.success).toBe(true);
  });
});
