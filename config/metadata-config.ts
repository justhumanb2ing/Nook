import { Metadata } from "next";

// TODO: i8n 적용 시, site url 변경 필요
export const siteConfig = {
  url: "https://daydreamm.vercel.app",
  title: "Daydream",
  description: "A space to be who you are.",
  copyright: "Daydream © All rights reserved.",
  since: "2025",
  googleAnalyticsId: "",
  generator: "Next.js",
  applicationName: "Daydream",
  locale: "en-US",
  author: {
    name: "KINOMONGSANG",
    photo: "https://avatars.githubusercontent.com/u/101445377?v=4",
    bio: "daydreamer",
    contacts: {
      email: "mailto:justhumanb2ing@gmail.com",
      github: "https://github.com/justhumanb2ing",
      bento: "https://bento.me/justhumanb2ing",
    },
  },
  menus: [
    {
      href: "/",
      label: "Home",
    },
  ],
};

// TODO: Opengraph, Twitter image 확인 후 변경 논의
export const metadataConfig: Metadata = {
  alternates: {
    // 페이지의 표준(canonical) URL을 지정하여, 여러 URL로 접근 가능한 경우에도
    // 검색 엔진이 이 URL을 원본으로 인식하게 합니다.
    canonical: siteConfig.url,
    // 특정 언어 버전에 대한 URL을 지정합니다.
    // 여기서는 한국어 버전에 대한 표준 URL을 설정합니다.
    languages: {
      "en-US": siteConfig.url,
      "ko-KR": siteConfig.url,
    },
  },
  // 브라우저 탭이나 검색 결과에 표시될 페이지의 제목입니다.
  title: {
    template: `%s | ${siteConfig.title}`,
    default: siteConfig.title + " — Be who you are",
  },
  // 검색 결과에 표시될 페이지의 간략한 설명입니다.
  description: siteConfig.description,
  // 검색 엔진이 페이지의 주제를 파악하는 데 사용되는 핵심 키워드 목록입니다.
  keywords: [
    "Daydream",
    "daydream",
    "personal link page",
    "개인 링크 페이지",
    "personal branding page",
    "퍼스널 브랜딩 페이지",
    "digital profile",
    "디지털 프로필",
    "link in bio",
    "링크 인 바이오",
    "multi-page profile",
    "멀티 페이지 프로필",
    "personal homepage",
    "개인 홈페이지",
    "shareable profile link",
    "공유 가능한 프로필 링크",
    "profile blocks",
    "프로필 블록",
    "link block",
    "텍스트 블록",
    "이미지 블록",
    "비디오 블록",
    "public page",
    "공개 페이지",
    "private page",
    "비공개 페이지",
    "portfolio link",
    "포트폴리오 링크",
    "digital identity",
    "디지털 아이덴티티",
    "self expression",
    "자기표현",
    "creative profile",
    "창의적 프로필",
    "minimal personal website",
    "미니멀 개인 웹사이트",
    "freedom to create yourself",
    "자신을 자유롭게 만들다",
    "portable digital home",
    "휴대 가능한 디지털 홈",
    "evolving identity",
    "진화하는 아이덴티티",
    "creator profile",
    "크리에이터 프로필",
    "freelancer portfolio",
    "프리랜서 포트폴리오",
    "digital resume",
    "디지털 이력서",
    "artist portfolio",
    "아티스트 포트폴리오",
    "startup founder profile",
    "창업자 프로필",
    "influencer link page",
    "인플루언서 링크 페이지",
    "self branding",
    "셀프 브랜딩",
    "personal storytelling",
    "퍼스널 스토리텔링",
    "profile designer",
    "프로필 디자이너",
    "be yourself",
    "나를 나답게",
    "express yourself",
    "나를 표현하다",
    "make me mine",
    "digital space",
    "디지털 공간",
    "creative identity",
    "창조적 정체성",
    "creator tools",
    "크리에이터 도구",
    "creative workspace",
    "창작 공간",
    "make me mine",
    "profile website builder",
    "Next.js profile builder",
    "Supabase platform",
    "Clerk authentication",
    "RLS security",
    "Edge functions backend",
    "creator tools",
    "creative workspace",
  ],
  // 사이트 소유권을 확인하기 위한 다양한 검색 엔진 도구의 메타 태그를 설정합니다.
  verification: {
    // Google Search Console을 통한 소유권 확인 코드입니다.
    google: "",
    other: {
      // Naver Search Advisor 소유권 확인 코드입니다.
      "naver-site-verification": "",
      // Google Adsense 소유권 확인 코드입니다.
      "google-adsense-account": "",
    },
  },
  // 링크 공유 시 미리보기(썸네일) 정보를 제어합니다.
  openGraph: {
    // 콘텐츠 유형을 웹사이트로 지정합니다. (예: 'article', 'book')
    type: "website",
    // 콘텐츠의 언어 및 지역 설정을 지정합니다.
    locale: siteConfig.locale,
    // 콘텐츠의 표준 URL입니다.
    url: siteConfig.url,
    // 소셜 미디어 공유 시 표시될 제목입니다.
    title: { template: `%s | ${siteConfig.title}`, default: siteConfig.title },
    // 소셜 미디어 공유 시 표시될 설명입니다.
    description: siteConfig.description,
    // 웹사이트의 이름을 지정합니다.
    siteName: siteConfig.title,
    // 소셜 미디어 공유 시 표시될 이미지 목록입니다.
    images: [{ url: siteConfig.author.photo, alt: siteConfig.title }],
  },
  // Twitter 카드 설정을 통해 트위터에서 링크 공유 시 미리보기 정보를 제어합니다.
  twitter: {
    // 트위터 카드의 유형을 'summary_large_image'로 지정합니다.
    // (제목, 설명, 큰 이미지 포함)
    card: "summary_large_image",
    // 트위터 카드에 표시될 제목입니다.
    title: { template: `%s | ${siteConfig.title}`, default: siteConfig.title },
    // 트위터 카드에 표시될 설명입니다.
    description: siteConfig.description,
    // 트위터 카드에 표시될 이미지 목록입니다.
    images: [{ url: siteConfig.author.photo, alt: siteConfig.title }],
  },
};
