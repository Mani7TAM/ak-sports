import type { ImageMetadata } from 'astro';
import { getCollection } from 'astro:content';

// Every photo under src/assets/gallery/<album-id>/, picked up automatically.
const files = import.meta.glob<ImageMetadata>(
  '/src/assets/gallery/*/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}',
  { eager: true, import: 'default' },
);

/** Albums from albums.json, newest first, each with the photos in its folder (sorted by file name). */
export async function getAlbums() {
  const photosByAlbum = new Map<string, { src: ImageMetadata; file: string }[]>();
  for (const [path, src] of Object.entries(files).sort(([a], [b]) => a.localeCompare(b))) {
    const [album, file] = path.split('/').slice(-2);
    photosByAlbum.set(album, [...(photosByAlbum.get(album) ?? []), { src, file }]);
  }

  const entries = await getCollection('albums');
  for (const folder of photosByAlbum.keys()) {
    if (!entries.some((e) => e.id === folder)) {
      throw new Error(`Photos found in src/assets/gallery/${folder}/ but albums.json has no album with id "${folder}"`);
    }
  }

  return entries
    .map(({ id, data }) => {
      const photos = (photosByAlbum.get(id) ?? []).map((p) => ({ ...p, caption: data.captions[p.file] }));
      if (!photos.length && !data.externalUrl) {
        throw new Error(`Album "${id}" in albums.json has no photos in src/assets/gallery/${id}/ and no externalUrl`);
      }
      return { id, ...data, photos };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export type Album = Awaited<ReturnType<typeof getAlbums>>[number];
