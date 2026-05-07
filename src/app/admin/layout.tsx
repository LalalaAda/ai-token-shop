import type { Metadata } from 'next';
import { AdminLayoutWrapper } from '@/components/admin/layout-wrapper';

export const metadata: Metadata = {
  title: '后台管理 - AI Token Shop',
  description: 'AI Token Shop 后台管理系统',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
