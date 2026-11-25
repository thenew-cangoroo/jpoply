# 제이플리

J-POP 라이브와 가사, 내한·일본 공연을 보여주는 Next.js 프로젝트야. VS Code에서 이 폴더를 열면 돼.

## 로컬에서 실행

Node.js 22 이상을 설치하고, VS Code 터미널에서 아래 명령을 실행해.

~~~powershell
npm ci
npm run dev
~~~

- 공개 화면은 [http://127.0.0.1:3000](http://127.0.0.1:3000)에서 확인해.
- [운영자 화면](http://127.0.0.1:3000/admin)의 로컬 예시 계정은 이메일 manager@jply.local, 비밀번호 jply-demo-local이야.
- 로컬 미리보기는 Firebase 없이 실행돼. 처음 표시되는 곡과 공연은 화면을 확인하기 위한 예시고, 관리 화면에서 저장한 변경은 .data/catalog.json에 남아.

## 곡과 공연 등록

1. /admin의 가수 메뉴에서 가수명과 한국어 표기, 검색 별칭을 등록해.
2. 곡 메뉴에서 곡명과 가수를 선택하고 제이플리 채널의 유튜브 주소, 촬영 공연 정보를 적어.
3. 가사 붙여넣기에 원문·한글 발음·번역 순서로 한 구절에 세 줄을 넣어. 구절 사이에는 빈 줄을 두면 돼. 00:20 또는 [00:20]처럼 시간만 적힌 줄을 함께 붙여도 세 줄의 가사를 골라 가져와.
4. 붙여넣은 구절마다 세 칸을 편집하고 미리보기로 확인해. 입력칸 안에서 누른 엔터는 공개 화면에도 줄바꿈으로 남고, 구절은 추가·삭제하거나 순서를 바꿀 수 있어.
5. 사이트에 공개를 선택하고 저장하면 홈과 가수별 곡 목록에 올라가. 같은 곡의 라이브가 여러 편이면 공연 버전을 추가하고, 각 영상에 공연 정보와 가사를 입력해.

공연 메뉴에서는 내한 일정과 일본 공연을 등록해. 포스터와 공식 예매처에는 HTTPS 주소를 넣고, 공연일과 선예매·일반예매는 각각 입력해.

## Firebase 운영 연결

1. 제이플리용 Firebase 프로젝트에서 Cloud Firestore를 프로덕션 모드로 만들고, Authentication의 이메일/비밀번호 로그인을 켜. 운영자 계정을 만든 후 UID를 확인해.
2. 서버에 사용할 Firebase 서비스 계정의 프로젝트 ID, 이메일, 비공개 키와 웹 앱 구성의 API 키를 확인해.
3. .env.example을 .env.local로 복사하고 아래 항목을 채워. 비공개 키는 PEM 전체를 넣어. 여러 줄의 줄바꿈을 \n으로 적은 값도 읽을 수 있어.

| 환경 변수 | 값 |
| --- | --- |
| JPLY_STORAGE | firestore |
| FIREBASE_PROJECT_ID | Firebase 프로젝트 ID |
| FIREBASE_CLIENT_EMAIL | 서비스 계정 이메일 |
| FIREBASE_PRIVATE_KEY | 서비스 계정 비공개 키 |
| FIREBASE_WEB_API_KEY | Firebase 웹 앱 구성의 apiKey |
| JPLY_ADMIN_UID | 지정된 운영자 계정 UID |

4. npm run dev로 다시 실행하고 실제 운영자 계정으로 로그인해. 운영에 쓸 곡과 공연은 Firestore 모드에서 등록해. 배포 후에도 같은 Firebase DB를 사용해.
5. Vercel에서 이 폴더를 Next.js 프로젝트로 연결하고 동일한 환경 변수를 프로젝트 설정에 추가해. Firestore는 서버에서 읽고 저장하며, Firebase 운영자 UID를 확인한 사람만 운영 화면을 사용할 수 있어.

참고 자료는 [Firebase 서버 SDK 설정](https://firebase.google.com/docs/admin/setup), [Firebase 세션 쿠키](https://firebase.google.com/docs/auth/admin/manage-cookies), [Next.js 설치](https://nextjs.org/docs/app/getting-started/installation)에서 확인할 수 있어.

## 확인 명령

~~~powershell
npm run typecheck
npm run build
~~~

로컬에서 빌드 결과를 미리 실행하려면 .env.local에 JPLY_STORAGE=local을 지정하고 npm run start를 실행해.
