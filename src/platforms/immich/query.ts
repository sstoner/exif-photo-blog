import { Photo, PhotoDateRange } from "@/photo";
import { convertImmichAssetToPhoto } from "./mapper";
import { Tags } from "@/tag";
import { Cameras } from "@/camera";
import { Lenses } from "@/lens";
import { FocalLengths } from "@/focal";
import { PhotoProvider } from "@/photo/provider/interface";
import { GetPhotosOptions } from "@/photo/db";
import {
  getPhotosCached,
  getUniqueTagsCached,
  getUniqueCamerasCached,
  getUniqueLensesCached,
  getUniqueFocalLengthsCached,
  getPhotosNearIdCached,
  getPhotosMetaCached,
} from "./cache";
import { getShareContext } from "./resolver";
import { ImmichApiClient } from "@/platforms/immich/client";

export class ImmichProvider implements PhotoProvider {
  private api: ImmichApiClient;
  private albumId: string;

  constructor(api: ImmichApiClient, albumId: string) {
    this.api = api;
    this.albumId = albumId;
  }

  async getPhotos(options: GetPhotosOptions): Promise<Photo[]> {
    const shareContext = await getShareContext();
    const photos = await getPhotosCached(options, shareContext)();
    return photos;
  }

  async getUniqueTags(): Promise<Tags> {
    const shareContext = await getShareContext();
    const tags = await getUniqueTagsCached(
      { hidden: "exclude" },
      shareContext
    )();
    return tags;
  }
  async getUniqueCameras(): Promise<Cameras> {
    const shareContext = await getShareContext();
    const cameras = await getUniqueCamerasCached(
      { hidden: "exclude" },
      shareContext
    )();
    return cameras;
  }

  async getUniqueLenses(): Promise<Lenses> {
    const shareContext = await getShareContext();
    const lenses = await getUniqueLensesCached(
      { hidden: "exclude" },
      shareContext
    )();
    return lenses;
  }

  async getUniqueFocalLengths(): Promise<FocalLengths> {
    const shareContext = await getShareContext();
    const focalLengths = await getUniqueFocalLengthsCached(
      { hidden: "exclude" },
      shareContext
    )();
    return focalLengths;
  }

  async getPhotosNearId(
    photoId: string,
    options: GetPhotosOptions
  ): Promise<{ photos: Photo[]; indexNumber?: number }> {
    const shareContext = await getShareContext();
    const result = await getPhotosNearIdCached(
      photoId,
      options,
      shareContext
    )();
    return result;
  }

  async getPhotosMeta(options: GetPhotosOptions): Promise<{
    count: number;
    dateRange?: PhotoDateRange;
  }> {
    const shareContext = await getShareContext();
    const meta = await getPhotosMetaCached(options, shareContext)();
    return meta;
  }

  async getPublicPhotoIds({ limit }: { limit?: number } = {}): Promise<
    string[]
  > {
    const shareContext = await getShareContext();
    const photos = await getPhotosCached({}, shareContext)();
    let photoIds = photos.map((photo: Photo) => photo.id);
    if (limit && limit > 0) {
      photoIds = photoIds.slice(0, limit);
    }
    return photoIds;
  }

  async getPhotoIdsAndUpdatedAt(): Promise<
    Array<{ id: string; updatedAt: Date }>
  > {
    const shareContext = await getShareContext();
    const photos = await getPhotosCached({}, shareContext)();
    const result = photos.map((photo: Photo) => ({
      id: photo.id,
      updatedAt: photo.updatedAt,
    }));

    return result;
  }

  async getPhoto(
    id: string,
    includeHidden?: boolean
  ): Promise<Photo | undefined> {
    const assetId = id;
    const shareContext = await getShareContext();
    const asset = await this.api.getAssetInfo(
      assetId,
      false,
      shareContext.shareKey
    );
    if (!asset) {
      return undefined;
    }

    const photo = convertImmichAssetToPhoto(asset, "preview", shareContext);
    if (!includeHidden && photo.hidden) {
      return undefined;
    }
    return photo;
  }

  async getRecipeTitleForData(
    _data: string | object,
    _film: string
  ): Promise<string | undefined> {
    return undefined;
  }

  async getPhotosNeedingRecipeTitleCount(
    _data: string,
    _film: string,
    _photoIdToExclude?: string
  ): Promise<number> {
    return 0;
  }

  async getUniqueRecipes(): Promise<never[]> {
    return [];
  }

  async getUniqueFilms(): Promise<never[]> {
    return [];
  }
}
