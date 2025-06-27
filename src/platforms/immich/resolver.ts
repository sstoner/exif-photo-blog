import {
  IMMICH_SHARE_ALBUM_ALLOW_DOWNLOAD_COOKIE,
  IMMICH_SHARE_ALBUM_ALLOW_DOWNLOAD_HEADER,
  IMMICH_SHARE_ALBUM_ID_COOKIE,
  IMMICH_SHARE_ALBUM_ID_HEADER,
  IMMICH_SHARE_KEY_COOKIE,
  IMMICH_SHARE_KEY_HEADER,
} from "@/app/paths";
import { IMMICH_DEFAULT_SHARE_KEY } from "@/app/config";
import { getCookie } from "@/utility/cookie";
import { ShareContext } from "./auth/validation";

const isServer = typeof window === "undefined";

export async function getAlbumId(): Promise<string> {
  if (isServer) {
    const { headers } = await import("next/headers");
    const albumId = (await headers()).get(IMMICH_SHARE_ALBUM_ID_HEADER);
    return albumId || "";
  } else {
    return getCookie(IMMICH_SHARE_ALBUM_ID_COOKIE) || "";
  }
}

export async function getSharedKey(): Promise<string> {
  if (isServer) {
    const { headers } = await import("next/headers");
    const shareKey = (await headers()).get(IMMICH_SHARE_KEY_HEADER);
    return shareKey || IMMICH_DEFAULT_SHARE_KEY || "";
  } else {
    return getCookie(IMMICH_SHARE_KEY_COOKIE) || IMMICH_DEFAULT_SHARE_KEY || "";
  }
}

export async function getAllowDownload(): Promise<boolean> {
  if (isServer) {
    const { headers } = await import("next/headers");
    const allowDownload = (await headers()).get(
      IMMICH_SHARE_ALBUM_ALLOW_DOWNLOAD_HEADER
    );
    return allowDownload === "false" ? false : true;
  } else {
    const allowDownloadCookie = getCookie(
      IMMICH_SHARE_ALBUM_ALLOW_DOWNLOAD_COOKIE
    );
    return allowDownloadCookie === "false" ? false : true;
  }
}

export async function getShareContext(): Promise<ShareContext> {
  const albumId = await getAlbumId();
  const shareKey = await getSharedKey();
  const allowDownload = await getAllowDownload();
  return {
    shareKey,
    albumId,
    allowDownload,
  };
}
