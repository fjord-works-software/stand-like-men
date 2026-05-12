import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const episodes = (await getCollection('episodes'))
    .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());

  return rss({
    title: 'Stand Like Men Podcast',
    description: 'Honest conversations about faith, purpose, brotherhood, and what it means to be a man worth following.',
    site: context.site!,
    items: episodes.map((ep) => ({
      title: ep.data.title,
      pubDate: ep.data.publishDate,
      description: ep.data.description,
      link: `/episodes/${ep.slug}/`,
      enclosure: {
        url: ep.data.audioUrl,
        length: 0,
        type: 'audio/mpeg',
      },
    })),
    customData: `<language>en-us</language>`,
  });
}
