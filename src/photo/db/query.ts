import { GetPhotosOptions } from '.';
import { createPhotoProvider } from '../provider/factory';

const provider = createPhotoProvider();

export const getPhotos = (options: GetPhotosOptions) =>
  provider.getPhotos(options);
export const getPhoto = (id: string, includeHidden?: boolean) =>
  provider.getPhoto(id, includeHidden);
export const getPhotosMeta = (options?: GetPhotosOptions) =>
  provider.getPhotosMeta(options);
export const getUniqueCameras = () =>
  provider.getUniqueCameras();
export const getUniqueLenses = () =>
  provider.getUniqueLenses();
export const getUniqueTags = () =>
  provider.getUniqueTags();
export const getUniqueFocalLengths = () =>
  provider.getUniqueFocalLengths();
export const getPublicPhotoIds = (options?: { limit?: number }) =>
  provider.getPublicPhotoIds(options);
export const getPhotoIdsAndUpdatedAt = () =>
  provider.getPhotoIdsAndUpdatedAt();
export const getPhotosNearId = (photoId: string, options: GetPhotosOptions) =>
  provider.getPhotosNearId(photoId, options);
export const getUniqueFilms = () =>
  provider.getUniqueFilms();
export const getUniqueRecipes = () =>
  provider.getUniqueRecipes();

// write operations - internal API
export {
  insertPhoto,
  updatePhoto,
  deletePhoto,
  deletePhotoTagGlobally,
  renamePhotoTagGlobally,
  addTagsToPhotos,
  deletePhotoRecipeGlobally,
  renamePhotoRecipeGlobally,
} from './database';

// metadata operations - internal API
export {
  getPhotosMostRecentUpdate,
  getRecipeTitleForData,
  getPhotosNeedingRecipeTitleCount,
  updateAllMatchingRecipeTitles,
} from './database';

// sync operations - internal API
export {
  getPhotosInNeedOfSync,
  getPhotosInNeedOfSyncCount,
} from './database';