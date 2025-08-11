/** @type {import('next').NextConfig} */
const config = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
  },
  images: {
    domains: ['localhost', 'ninetails.site'],
  },
};

export default config;
