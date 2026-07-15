import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // El paquete de tipos compartidos se consume como TS crudo desde el monorepo.
  transpilePackages: ['@erp/shared-types'],
  // Fija la raíz del monorepo (hay lockfiles en carpetas padre ajenas al proyecto).
  turbopack: {
    root: path.join(__dirname, '..', '..'),
  },
};

export default nextConfig;
