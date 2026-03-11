import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://deepresearch-ai.vercel.app'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/research/', '/settings/', '/history/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
