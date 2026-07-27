'use client';

import { redirect } from 'next/navigation';

export default function ChatbotLayout({ children }: { children: React.ReactNode }) {
  redirect('/');
}
