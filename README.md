# Morning Routine Planner - 모닝 루틴 플래너

## 개요

아침 루틴을 체계적으로 관리하고 추적하는 생산성 PWA 앱입니다. 시간표 설정, 타이머 기능, 주간 달성 캘린더, 루틴 템플릿 등으로 매일 아침을 계획적으로 시작할 수 있습니다.

## 주요 기능

### 📋 플래너 (Planner)
- **기상 시간 설정**: 아침 기상 시간 설정으로 루틴 관리 시작
- **루틴 추가/관리**: 이름, 소요시간, 아이콘으로 루틴 생성
- **드래그&드롭 정렬**: 마우스/터치로 루틴 순서 변경
- **진행률 추적**: 오늘의 루틴 완료도 실시간 표시
- **완료 체크**: 각 루틴 완료 여부 확인

### ⏱️ 타이머 (Timer)
- **자동 카운트다운**: 선택한 루틴의 소요시간 자동 설정
- **일시중지/리셋**: 타이머 제어 기능
- **다음 루틴**: 루틴 완료 후 자동으로 다음 항목으로 이동
- **음성 알림**: 루틴 완료 시 알림 (선택사항)

### 📅 캘린더 (Calendar)
- **주간 달성 추적**: 각 요일별 루틴 완료 여부 체크
- **연속 달성**: 연속 완료한 날 통계
- **주간 총합**: 이번 주 완료한 날 수 표시

### ⭐ 템플릿 (Templates)
- **건강형**: 운동, 영양 중심
- **생산성형**: 효율성, 계획 중심
- **명상형**: 마음 챙김, 여유 중심
- **운동형**: 운동 최우선

### ✨ 프리미엄 기능
- **AI 루틴 최적화**: 광고 시청 후 AI 제안 (향후 고도화)
- **루틴 공유 카드**: 이미지 생성 및 SNS 공유
- **데이터 내보내기**: JSON 형식으로 백업

## 기술 스택

- **HTML5 + CSS3**: 반응형 디자인, 2026 UI/UX 트렌드
- **Vanilla JavaScript**: 순수 JS로 경량화
- **PWA**: Service Worker 지원 (오프라인 사용 가능)
- **i18n**: 12개 언어 지원 (ko, en, ja, zh, es, pt, id, tr, de, fr, hi, ru)
- **LocalStorage**: 데이터 로컬 저장
- **Notification API**: 알림 기능

## 설치 & 실행

### 로컬 개발
```bash
cd projects/routine-planner
python -m http.server 8000
# http://localhost:8000 에서 확인
```

### PWA 설치 (모바일/데스크톱)
1. 앱 열기
2. 주소창 옆 "설치" 버튼 클릭 (또는 모바일 메뉴 > "홈화면에 추가")
3. 앱처럼 사용 가능

## 파일 구조

```
routine-planner/
├── index.html              # 메인 HTML
├── manifest.json           # PWA 설정
├── sw.js                   # Service Worker
├── icon-192.svg           # 192x192 아이콘
├── icon-512.svg           # 512x512 아이콘
├── css/
│   └── style.css          # 스타일 (다크 모드, 2026 트렌드)
└── js/
    ├── i18n.js            # 다국어 관리 시스템
    ├── app.js             # 메인 앱 로직
    └── locales/           # 번역 파일 (12개)
        ├── ko.json        # 한국어
        ├── en.json        # 영어
        ├── ja.json        # 일본어
        ├── zh.json        # 중국어
        ├── es.json        # 스페인어
        ├── pt.json        # 포르투갈어
        ├── id.json        # 인도네시아어
        ├── tr.json        # 터키어
        ├── de.json        # 독일어
        ├── fr.json        # 프랑스어
        ├── hi.json        # 힌디어
        └── ru.json        # 러시아어
```

## 2026 UI/UX 트렌드 적용

✅ **Glassmorphism 2.0**: 반투명 배경 + 블러 효과
✅ **Microinteractions**: 호버/탭 애니메이션, 리플 효과
✅ **Dark Mode First**: 다크 모드 기본 (#0f0f23)
✅ **Minimalist Flow**: 넉넉한 여백, 한 화면에 한 작업
✅ **Progress & Statistics**: 진행률 바, 통계 시각화
✅ **Personalization**: LocalStorage로 설정 저장
✅ **Accessibility**: 44px+ 터치 타겟, 명도 대비

## 색상 팔레트

| 용도 | 색상 |
|------|------|
| 테마색 | #f1c40f (Golden Yellow) |
| 배경 | #0f0f23 (Dark Navy) |
| 카드 | #1a1a2e (Dark Card) |
| 테두리 | #2d2d44 (Dark Border) |
| 성공 | #2ecc71 (Green) |
| 경고 | #f39c12 (Orange) |

## 기술 상세

### Data Management
- **LocalStorage**: routineData 키에 JSON 저장
- **Export**: JSON 다운로드 지원
- **Clear**: 전체 데이터 초기화 (확인 필수)

### Timer Logic
- 선택한 루틴의 소요시간을 초 단위로 변환
- 1초마다 카운트다운
- 0 도달 시 다음 루틴으로 자동 이동

### Calendar
- 매일 localStorage에 완료 날짜 저장
- ISO 8601 날짜 형식 사용
- 연속 달성 계산 (오늘부터 역순 확인)

### i18n System
- 번역 파일 동적 로드 (fetch)
- 브라우저 언어 자동 감지
- localStorage에 선택 언어 저장
- data-i18n 속성으로 자동 업데이트

## 수익화 전략

### 광고 (AdSense)
- 상단 배너 (responsive)
- 하단 배너
- 게시자 ID: ca-pub-3600813755953882

### 분석 (GA4)
- 추적 ID: G-J8GSWM40TV
- DAU, 세션, 체류시간 모니터링

### 인앱 결제 (향후)
- 광고 제거 (₩3,900)
- AI 최적화 제안 (프리미엄)

## 성능 최적화

✅ Service Worker 캐싱
✅ Lazy loading
✅ 최소 CSS/JS 번들
✅ SVG 아이콘 (경량)
✅ LocalStorage 효율적 사용

## 접근성

✅ WCAG 2.1 AA 준수
✅ 모든 버튼 44px+
✅ 충분한 색상 대비 (AA 이상)
✅ 키보드 네비게이션 지원
✅ 스크린 리더 지원

## 브라우저 지원

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- 모바일 Chrome/Safari 최신 버전

## SEO & 메타데이터

✅ Open Graph (OG) 메타태그
✅ Schema.org WebApplication 마크업
✅ 반응형 뷰포트
✅ 설명적 메타 태그
✅ 모바일 앱 메타태그

## 라이선스 & 저작권

- **개발**: Claude Code (Anthropic)
- **라이선스**: MIT
- **출처**: dopabrain.com

## 향후 개선 계획

- [ ] 반복 루틴 설정 (매주, 매월)
- [ ] 루틴별 상세 통계
- [ ] 친구와 루틴 공유
- [ ] 웹 백엔드 연동 (클라우드 동기화)
- [ ] 모바일 네이티브 앱 (React Native)
- [ ] AI 최적화 상세 분석
- [ ] 루틴 수행 영상 기록
- [ ] 음성 명령 지원

## 문제 해결

### 타이머가 작동하지 않음
→ 루틴을 먼저 추가하고, 타이머 탭에서 루틴을 선택하세요.

### 언어가 자동 변경됨
→ 브라우저 언어 설정을 확인하거나 언어 선택기에서 수동 선택하세요.

### 데이터가 삭제됨
→ Private/Incognito 모드에서는 SessionStorage만 사용되므로, 일반 모드 사용 권장.

## 연락처 & 피드백

- 웹사이트: dopabrain.com
- 이슈 리포트: GitHub Issues

---

**Last Updated**: 2026-02-10
**Version**: 1.0.0
**Status**: Production Ready
