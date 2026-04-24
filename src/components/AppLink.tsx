import NextLink from 'next/link';
import type { ComponentProps } from 'react';

type AppLinkProps = ComponentProps<typeof NextLink>;

/**
 * next/link — 기본 prefetch 끔.
 * 정적/nginx 배포에서 viewport 프리페치로 생기는 동일 출처 HEAD·403 노이즈를 줄입니다.
 * 필요 시 `prefetch`, `prefetch={true}`, `prefetch={null}`(자동)로 켤 수 있습니다.
 */
export default function Link({ prefetch = false, ...props }: AppLinkProps) {
  return <NextLink prefetch={prefetch} {...props} />;
}
