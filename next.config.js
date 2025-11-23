/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip ESLint during builds to avoid interactive prompts or missing peer dependency issues
  eslint: {
    ignoreDuringBuilds: true
  }
};

module.exports = nextConfig;
