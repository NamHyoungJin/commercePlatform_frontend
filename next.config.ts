import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    // `output: 'export'` — 기본 Image Optimization API 미지원
    unoptimized: true,
    remotePatterns: [
      { protocol: 'http', hostname: 'www.onlyonemusic.kr' },
      { protocol: 'https', hostname: 'www.onlyonemusic.kr' },
      { protocol: 'http', hostname: 'localhost' },
      // S3 가상 호스트 스타일 (버킷.s3.리전.amazonaws.com) 및 presigned 쿼리
      { protocol: 'https', hostname: '*.s3.*.amazonaws.com' },
      { protocol: 'https', hostname: '*.s3.amazonaws.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },
};

export default nextConfig;
