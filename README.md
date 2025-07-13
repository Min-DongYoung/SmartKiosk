# SmartKiosk: 지능형 하이브리드 키오스크

**SmartKiosk**는 기존 터치 기반 키오스크에 **문맥을 이해하는 지능형 음성 인터페이스**를 결합한 하이브리드 시스템입니다.
사용자는 상황에 따라 **터치와 음성 입력을 자유롭게 전환하거나 병행**할 수 있으며, 복잡한 메뉴 탐색을 **자연어 기반 대화**로 손쉽게 수행할 수 있습니다.

시스템의 목표는 **모든 연령층의 사용자에게 학습 없이도 직관적인 인터페이스**를 제공하고, 키오스크 사용 중 겪는 어려움을 최소화하는 것입니다.

---

## 🌟 주요 기능

-   **하이브리드 상호작용 (Hybrid Interaction)**: 음성과 터치 입력 간 자유로운 전환을 지원하며, 문맥을 유지합니다.
-   **지능형 음성 가이드 (Intelligent Voice Guidance)**: STT 기반의 정확한 음성 인식과 시나리오 기반 안내 기능을 제공합니다.

---

## 🏗️ 시스템 아키텍처

SmartKiosk는 다음과 같은 4계층으로 구성됩니다:

1.  **입력 계층 (Input Layer)**
    -   터치 이벤트와 음성 입력(STT)을 수집 및 전처리
    -   음성 입력은 실시간 텍스트로 변환됨

2.  **대화 및 탐색 엔진**
    -   입력 이벤트의 의미를 해석하고, 사용자 의도 및 문맥을 관리
    -   복합 명령 처리 및 애플리케이션 로직에 전달

3.  **애플리케이션 로직 (Application Logic)**
    -   메뉴 탐색, 장바구니 처리, 주문 관리 등 주요 기능 수행

4.  **출력 계층 (Output Layer)**
    -   사용자에게 GUI 및 TTS(Text-to-Speech)를 통해 시각/청각 정보 제공

---

## 🚀 개발 로드맵

-   [x] **Phase 1: 기본 음성 인터페이스 구축**
    -   STT/TTS 연동, 마이크 권한 처리
    -   플로팅 마이크 버튼 기반 명령어 처리 및 음성 피드백 구현
    -   메뉴 연동 및 장바구니 수량 계산 버그 수정
-   [x] **Phase 2: LLM 연동 및 지능형 처리**
    -   Google Gemini API (gemini-2.0-flash) 연동 완료
    -   프롬프트 엔지니어링을 통한 복잡한 자연어 명령 처리 고도화 시작
    -   API 키 관리 방식 (`src/config.js`) 및 Context 구조 리팩토링 완료
-   [x] **Phase 3: 대화 컨텍스트 및 추천 시스템**
    -   대화 히스토리 기반 컨텍스트 관리 및 추천 시스템 (시간대/계절 기반) 구현 완료
-   [ ] **Phase 4: 백엔드 연동**
    -   Node.js 기반 서버 구축 및 MongoDB 연동
    -   주문 처리 및 데이터 보안 기능 강화

---

## 🛠️ 설치 및 실행 방법

이 프로젝트는 **React Native** 기반으로 개발되었습니다.

### 1. 개발 환경 설정

React Native 개발 환경이 설정되어 있지 않다면, [공식 문서](https://reactnative.dev/docs/environment-setup)를 참고하여 환경을 구성해주세요.

### 2. 프로젝트 클론 및 종속성 설치

```bash
git clone https://github.com/Min-DongYoung/SmartKiosk.git
cd SmartKiosk
npm install
```

### 3. Gemini API 키 설정

Google Gemini API를 사용하기 위해 API 키를 설정해야 합니다.

1.  `src/config.js` 파일을 생성합니다.
2.  생성된 `src/config.js` 파일에 다음 내용을 추가하고, `'YOUR_GEMINI_API_KEY'` 부분을 발급받은 실제 Gemini API 키로 교체합니다.
    ```javascript
    // src/config.js
    export const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';
    ```
    **주의:** `src/config.js` 파일은 `.gitignore`에 등록되어 Git 저장소에 업로드되지 않으므로, 보안에 안전합니다.

### 4. Android 권한 설정 (Android 사용 시)

`android/app/src/main/AndroidManifest.xml`에 다음 권한이 포함되어 있어야 합니다:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
```

### 5. 앱 실행

#### (1) Metro Bundler 시작

```bash
npm start -- --reset-cache
```

#### (2) 앱 실행

Android 기기에서 실행:

```bash
npm run android
```

iOS 기기에서 실행:

```bash
npm run ios
```

성공적으로 실행되면, 지능형 하이브리드 키오스크 앱을 확인할 수 있습니다.

---

## 💡 주요 기술 스택

-   React Native
-   JavaScript
-   Google STT / TTS API
-   Google Gemini API (gemini-2.0-flash)
-   Node.js + MongoDB (예정)