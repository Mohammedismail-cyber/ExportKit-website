/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["playwright", "fs-extra", "archiver", "cheerio"]
  }
};

export default nextConfig;
