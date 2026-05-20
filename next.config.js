/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    BASE_URL: process.env.BASE_URL,
    ORIGIN: process.env.ORIGIN,
    USER_POOL_ID: process.env.USER_POOL_ID,
    CLIENT_ID: process.env.CLIENT_ID,
  },
};

module.exports = nextConfig;
