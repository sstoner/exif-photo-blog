'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SHARE_KEY_COOKIE = process.env.
  NEXT_PUBLIC_IMMICH_SHARE_KEY_COOKIE || 'immich-share-key';
const SHARE_ALBUM_ID_COOKIE = process.env.
  NEXT_PUBLIC_IMMICH_SHARE_ALBUM_ID_COOKIE || 'immich-share-album-id';

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    document.cookie = `${SHARE_KEY_COOKIE}=; Max-Age=0; path=/`;
    document.cookie = `${SHARE_ALBUM_ID_COOKIE}=; Max-Age=0; path=/`;
    router.replace('/');
  }, [router]);

  return null;
}