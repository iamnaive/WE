/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // На случай, если какая-то транзитивная зависимость попытается импортировать RN-модуль:
    config.resolve.alias['@react-native-async-storage/async-storage'] = false;
    return config;
  },
};
module.exports = nextConfig;
