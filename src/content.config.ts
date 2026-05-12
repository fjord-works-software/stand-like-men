import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const episodes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/episodes' }),
  schema: z.object({
    title: z.string(),
    episodeNumber: z.number(),
    publishDate: z.coerce.date(),
    duration: z.string(),
    audioUrl: z.string().url(),
    spotifyUrl: z.string().url().optional(),
    appleUrl: z.string().url().optional(),
    youtubeUrl: z.string().url().optional(),
    description: z.string(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    publishDate: z.coerce.date(),
    author: z.enum(['daniel', 'logan']),
    excerpt: z.string(),
  }),
});

const hosts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/hosts' }),
  schema: z.object({
    name: z.string(),
    headshot: z.string().optional(),
    twitterUrl: z.string().url().optional(),
    instagramUrl: z.string().url().optional(),
  }),
});

export const collections = { episodes, blog, hosts };
