'use client';
import { useLoading } from '@/context/LoadingContext';

export default function GlobalLoader() {
  const { loading } = useLoading();

  if (!loading) return null;

  return (
    <div className="overlay">
      <div className="loader"/>
    </div>
  );
}