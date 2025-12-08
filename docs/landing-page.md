# 랜딩 페이지 개요

## 목적
- `config/metadata-config.ts`의 사이트 메타를 활용한 키친웨어 테마 랜딩 페이지.
- `motion` 기반 인터랙션으로 미니멀하면서도 아기자기한 경험 제공.

## 색상 토큰
- `--brand-ink` (`#000000`), `--brand-indigo` (`#758bfd`), `--brand-poppy` (`#ff4242`), `--brand-cloud` (`#e5e5e5`)
- `app/globals.css`에서 CSS 변수로 정의하고 `@theme inline` 토큰과 연동하여 `bg-brand-*`, `text-brand-*` 등으로 사용.

## 섹션 구성
- Hero: 로고 + 슬림 토스터 플로팅 모션, 하이라이트 배지/버블 인터랙션.
- Shelf: 우드 선반 레이아웃과 포인트 리스트.
- Product Grid: 베스트셀러 카드 4종, 호버 시 그라데이션 오버레이.
- Spotlight: 영감/신제품 카드와 좌측 메인 비주얼.
- Pricing: 3개 티어 카드(Coming soon 표기)와 플랜 예고 배지.
- Newsletter: 책장 배경과 구독 폼.
- Footer: bg-background 기반의 미니멀 카피.

## 모션 포인트
- `motion.div`를 활용한 진입 애니메이션, 반복 부유(floating) 효과, 호버 스케일.
- 배지/버블/CTA에 스프링 기반 인터랙션 적용.
