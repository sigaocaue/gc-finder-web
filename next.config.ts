import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.68.109', 'gc-finder.loca.lt'],
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/admin/gcs/novo',
        destination: '/admin/gcs/new',
      },
      {
        source: '/admin/gcs/:id/edicao',
        destination: '/admin/gcs/:id/edit',
      },
      {
        source: '/admin/lideres',
        destination: '/admin/leaders',
      },
      {
        source: '/admin/lideres/novo',
        destination: '/admin/leaders/new',
      },
      {
        source: '/admin/lideres/:id/edicao',
        destination: '/admin/leaders/:id/edit',
      },
    ]
  }
}

export default nextConfig
