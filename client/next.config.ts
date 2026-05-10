// next.config.ts
import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: [
      's.gravatar.com',      // Gravatar
      'cdn.auth0.com',       // Auth0 avatars
      'your-other-host.com', // any other hosts you might use
    ],
  },
};

export default nextConfig;