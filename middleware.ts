// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  IMMICH_SHARE_ALBUM_ID_COOKIE, IMMICH_SHARE_ALBUM_ID_HEADER,
  IMMICH_SHARE_KEY_COOKIE, IMMICH_SHARE_KEY_HEADER,
  PATH_ADMIN,
  PATH_ADMIN_PHOTOS,
  PATH_OG,
  PATH_OG_SAMPLE,
  PATH_SIGN_IN,
  PATH_SIGN_OUT,
  PREFIX_PHOTO,
  PREFIX_TAG,
} from '@/app/paths';
import { validateShareKey } from '@/platforms/immich/auth/validation';
import { auth } from '@/auth/server';
import { NextApiRequest, NextApiResponse } from 'next';

export async function middleware(request: NextRequest, response: NextResponse) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    request.nextUrl.host;
  const protocol = request.headers.get('x-forwarded-proto') ||
    (host?.includes('localhost') ? 'http' : 'https');
  const baseUrl = `${protocol}://${host}`;

  if (process.env.USE_IMMICH_BACKEND === 'true' && pathname.startsWith(PATH_SIGN_OUT)) {
    let response = NextResponse.redirect(new URL('/', baseUrl));
    response.cookies.delete(IMMICH_SHARE_KEY_COOKIE);
    response.cookies.delete(IMMICH_SHARE_ALBUM_ID_COOKIE);

    return response;
  }

  if (process.env.USE_IMMICH_BACKEND === 'true' && pathname.startsWith(PATH_ADMIN)) {
    // simply redirect to the "home-page"
    return NextResponse.redirect(new URL('/grid', baseUrl));
  }

  if (pathname === PATH_ADMIN) {
    return NextResponse.redirect(new URL(PATH_ADMIN_PHOTOS, request.url));
  } else if (pathname === PATH_OG) {
    return NextResponse.redirect(new URL(PATH_OG_SAMPLE, request.url));
  } else if (/^\/photos\/(.)+$/.test(pathname)) {
    // Accept /photos/* paths, but serve /p/*
    const matches = pathname.match(/^\/photos\/(.+)$/);
    return NextResponse.rewrite(new URL(
      `${PREFIX_PHOTO}/${matches?.[1]}`,
      request.url,
    ));
  } else if (/^\/t\/(.)+$/.test(pathname)) {
    // Accept /t/* paths, but serve /tag/*
    const matches = pathname.match(/^\/t\/(.+)$/);
    return NextResponse.rewrite(new URL(
      `${PREFIX_TAG}/${matches?.[1]}`,
      request.url,
    ));
  }

  const shareKeyMatch = pathname.match(/^\/share\/([^\/]+)$/);
  if (shareKeyMatch) {
    const shareKey = shareKeyMatch[1];
    let shareContext;
    try {
      shareContext = await validateShareKey(shareKey);
    } catch (error) {
      const errorMessage = "Failed to validate share key";
      return NextResponse.redirect(new URL(`/unauthorized?reason=${errorMessage}`, baseUrl));
    }

    if (!shareContext) {
      return NextResponse.redirect(new URL('/unauthorized', baseUrl));
    }

    if (shareContext.expiresAt && new Date() > shareContext.expiresAt) {
      return NextResponse.redirect(new URL('/unauthorized?reason=expired', baseUrl));
    }

    let response = NextResponse.redirect(new URL('/', baseUrl));
    response.cookies.set(IMMICH_SHARE_KEY_COOKIE, shareKey, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: shareContext.expiresAt
        ? Math.floor((shareContext.expiresAt.getTime() - Date.now()) / 1000)
        : 240 * 60 * 60
    });
    response.cookies.set(IMMICH_SHARE_ALBUM_ID_COOKIE, shareContext.albumId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: shareContext.expiresAt
        ? Math.floor((shareContext.expiresAt.getTime() - Date.now()) / 1000)
        : 240 * 60 * 60
    });

    // set headers for first request
    response.headers.set(IMMICH_SHARE_KEY_HEADER, shareKey);
    response.headers.set(IMMICH_SHARE_ALBUM_ID_HEADER, shareContext.albumId);

    return response;
  }

  if (process.env.USE_IMMICH_BACKEND === 'true') {
    const shareKey = request.cookies.get(IMMICH_SHARE_KEY_COOKIE)?.value;
    const albumId = request.cookies.get(IMMICH_SHARE_ALBUM_ID_COOKIE)?.value;

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(IMMICH_SHARE_ALBUM_ID_HEADER, albumId || '');
    requestHeaders.set(IMMICH_SHARE_KEY_HEADER, shareKey || '');
    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
  }

  return auth(
    request as unknown as NextApiRequest,
    response as unknown as NextApiResponse,
  );
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};