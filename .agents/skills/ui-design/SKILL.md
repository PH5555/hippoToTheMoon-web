---
name: ui-design
description: Design React components using shadcn/ui following Atomic Design principles for financial trading interfaces. Use when creating UI components, designing layouts, implementing visualizations, or when the user asks about design patterns, component structure, or styling.
---

# UI Design Guide

이 스킬은 일반적인 금융 앱의 지루한 디자인(흰 배경에 파랑/빨강 그래프)을 거부하고, **'떡상하마'**만의 강렬한 브랜드 정체성을 가진 인터페이스를 구축합니다. 사용자가 모의 투자를 게임처럼 즐기면서도 전문적인 데이터를 놓치지 않도록 설계하세요.


## 디자인 사고 (Design Thinking)

코딩 전, **'떡상하마'**의 정체성을 확립하세요:

- 목표: 주린이들이 하마처럼 묵직하게 자산을 키우고, 떡상의 희열을 시각적으로 경험하게 함.
- 톤앤매너: '네오-그로테스크 & 하이퍼-팝(Neo-Grotesque & Hyper-Pop)'. 묵직한 하마의 느낌을 주는 굵은 타이포그래피와 상승을 상징하는 네온 그린/핫 핑크 액센트를 사용합니다.
- 차별화 요소: '하마' 캐릭터의 입이 벌어지는 듯한 역동적인 레이아웃, 혹은 그래프가 화면을 뚫고 나가는 듯한 극적인 애니메이션.

## 프론트엔드 미학 가이드라인

다음 요소에 집중하여 구현하세요:

### Typography (타이포그래피):

- Display: 'Black Han Sans'나 'Gmarket Sans Bold' 같은 두껍고 단단한 폰트를 사용하여 숫자의 힘을 강조합니다.
- Body: 가독성이 뛰어나되 개성이 있는 'Pretendard'를 기본으로 하며, 중요 수치에는 'JetBrains Mono' 같은 고정폭 폰트를 사용하여 데이터의 정밀함을 보여줍니다.
- Color & Theme (컬러 및 테마):
- Deep Night & Neon: 깊은 다크 차콜(#121212) 배경에, 상승은 '일렉트릭 라임', 하락은 '인텐스 마젠타'를 사용하여 시각적 대비를 극대화합니다. 뻔한 파스텔 톤을 지양하고, 눈에 꽂히는 고채도 컬러를 사용하세요.

### Motion (모션):

- 'Tteok-Sang' Effect: 자산 가치가 오를 때 숫자가 위로 튀어 오르는(Bouncing) 효과와 함께 파티클이 터지는 마이크로 인터렉션을 구현합니다.
- 차트 로딩 시 하마가 입을 벌리는 듯한 형태의 스켈레톤 UI를 적용하세요.

### Spatial Composition (공간 구성):

- Brutalist Grid: 굵은 테두리(Border)와 그림자를 활용한 브루탈리즘 스타일의 카드를 배치합니다.
- 대시보드는 비대칭적으로 배치하여 정보의 우선순위를 직관적으로 보여주되, 사용자가 지루함을 느끼지 않게 합니다.

### Visual Details:

- 배경에 미세한 노이즈 텍스처를 더해 디지털의 차가움을 상쇄합니다.
- 주가 변동 그래프 뒤에 은은한 그라데이션 메시를 깔아 입체감을 줍니다.

절대 금지:
- 흔한 'Inter' 폰트 사용.
- 구글 머티리얼 디자인 같은 뻔한 컴포넌트 라이브러리 느낌.
- 힘 빠지는 연한 회색 텍스트와 의미 없는 여백.