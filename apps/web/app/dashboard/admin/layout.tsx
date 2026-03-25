import type React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="-mt-8 sm:-mt-9 md:-mt-10 lg:-mt-12">{children}</div>;
}
