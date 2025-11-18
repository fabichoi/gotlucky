# GotLucky 프로젝트 개발 가이드라인

## 문서화 지침
1. 현재 브랜치가 develop 이나 main, master 인 경우 문서화하지 않음
2. 작업 계획은 .junie/현재 브랜치 이름/work_plan.md 에 작성 (파일 없는 경우 생성)
3. 작업 결과물은 .junie/현재 브랜치 이름/work_result.md 에 작성 (파일 없는 경우 생성)
4. 요청 사항 변경에 따라 항상 문서도 함께 업데이트

## 빌드/설정 지침

### 백엔드 설정
1. **환경 설정**
   - Go 1.16 이상 설치 필요
   - 프로젝트 루트에서 다음 명령어로 의존성 설치:
     ```
     cd backend
     go mod download
     ```
   - `.env` 파일 설정 (backend 디렉토리에 위치):
     ```
     DB_USER=사용자명
     DB_PASSWORD=비밀번호
     DB_HOST=호스트주소
     DB_PORT=포트번호
     DB_NAME=데이터베이스명
     ```

2. **백엔드 실행**
   ```
   cd backend
   go run ./cmd/main.go
   ```

3. **Docker를 이용한 백엔드 빌드**
   ```
   cd backend
   docker build -t gotlucky-backend .
   docker run -p 8080:8080 gotlucky-backend
   ```

### 프론트엔드 설정
1. **환경 설정**
   - Node.js 18 이상 설치 필요
   - 프로젝트 루트에서 다음 명령어로 의존성 설치:
     ```
     cd frontend
     npm install
     ```

2. **프론트엔드 개발 서버 실행**
   ```
   cd frontend
   npm run dev
   ```

3. **프론트엔드 빌드**
   ```
   cd frontend
   npm run build
   ```

4. **Docker를 이용한 프론트엔드 빌드**
   ```
   cd frontend
   docker build -t gotlucky-frontend .
   docker run -p 80:80 gotlucky-frontend
   ```

## 테스트 정보

### 백엔드 테스트

1. **테스트 실행 방법**
   - 모든 테스트 실행:
     ```
     cd backend
     go test ./...
     ```
   - 특정 패키지 테스트 실행:
     ```
     cd backend
     go test ./internal/패키지명
     ```
   - 상세 출력과 함께 테스트 실행:
     ```
     cd backend
     go test ./... -v
     ```

2. **테스트 작성 가이드라인**
   - 테스트 파일은 `*_test.go` 형식으로 작성
   - 테스트 함수는 `Test` 접두사로 시작 (예: `TestFunction`)
   - 테이블 기반 테스트 패턴 사용 권장
   - 예시:
     ```go
     func TestFunction(t *testing.T) {
         tests := []struct {
             name     string
             input    string
             expected string
         }{
             {
                 name:     "테스트 케이스 1",
                 input:    "입력값",
                 expected: "기대값",
             },
             // 추가 테스트 케이스...
         }

         for _, tt := range tests {
             t.Run(tt.name, func(t *testing.T) {
                 result := Function(tt.input)
                 if result != tt.expected {
                     t.Errorf("Function() = %v, want %v", result, tt.expected)
                 }
             })
         }
     }
     ```

3. **모의 객체(Mock) 사용**
   - 외부 의존성이 있는 경우 인터페이스를 통해 모의 객체 사용 권장
   - `testify/mock` 라이브러리 사용 권장

### 프론트엔드 테스트

1. **테스트 설정**
   - 테스트 라이브러리 설치 (아직 설치되지 않은 경우):
     ```
     cd frontend
     npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
     ```

2. **테스트 실행 방법**
   - 테스트 스크립트를 package.json에 추가:
     ```json
     "scripts": {
       "test": "vitest run",
       "test:watch": "vitest"
     }
     ```
   - 테스트 실행:
     ```
     npm run test
     ```

3. **테스트 작성 가이드라인**
   - 테스트 파일은 `*.test.tsx` 또는 `*.test.ts` 형식으로 작성
   - 컴포넌트 테스트 예시:
     ```tsx
     import { render, screen } from '@testing-library/react';
     import { describe, it, expect } from 'vitest';
     import Component from './Component';

     describe('Component', () => {
       it('renders correctly', () => {
         render(<Component />);
         expect(screen.getByText('예상 텍스트')).toBeInTheDocument();
       });
     });
     ```

## 추가 개발 정보

### 코드 스타일

1. **백엔드 코드 스타일**
   - Go 표준 코드 스타일 준수 (`gofmt` 사용)
   - 패키지 구조:
     - `cmd`: 애플리케이션 진입점
     - `internal`: 내부 패키지
       - `database`: 데이터베이스 연결 및 설정
       - `dto`: 데이터 전송 객체
       - `handler`: HTTP 요청 핸들러
       - `middleware`: HTTP 미들웨어
       - `model`: 데이터베이스 모델/엔티티
       - `repository`: 데이터 액세스 레이어
       - `routes`: API 라우트 정의
       - `service`: 비즈니스 로직 레이어
       - `util`: 유틸리티 함수

2. **프론트엔드 코드 스타일**
   - ESLint 설정 준수
   - TypeScript 사용
   - 컴포넌트 기반 아키텍처
   - 상태 관리: React 훅 사용

### 디버깅

1. **백엔드 디버깅**
   - Delve 디버거 사용 권장:
     ```
     go install github.com/go-delve/delve/cmd/dlv@latest
     dlv debug ./cmd/main.go
     ```

2. **프론트엔드 디버깅**
   - 브라우저 개발자 도구 사용
   - React DevTools 확장 프로그램 사용 권장

### 배포

1. **Docker Compose를 이용한 전체 애플리케이션 배포**
   - 프로젝트 루트에 docker-compose.yml 파일 생성:
     ```yaml
     version: '3'
     services:
       backend:
         build: ./backend
         ports:
           - "8080:8080"
         environment:
           - DB_HOST=db
           - DB_USER=user
           - DB_PASSWORD=password
           - DB_NAME=gotlucky
           - DB_PORT=5432
         depends_on:
           - db
       frontend:
         build: ./frontend
         ports:
           - "80:80"
         depends_on:
           - backend
       db:
         image: postgres:14
         environment:
           - POSTGRES_USER=user
           - POSTGRES_PASSWORD=password
           - POSTGRES_DB=gotlucky
         volumes:
           - postgres_data:/var/lib/postgresql/data
     volumes:
       postgres_data:
     ```
   - 배포 실행:
     ```
     docker-compose up -d
     ```