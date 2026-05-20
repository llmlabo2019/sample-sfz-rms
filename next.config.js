/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    BASE_URL: process.env.BASE_URL,
    ORIGIN: process.env.ORIGIN,
  },
};

module.exports = nextConfig;
