# GotLucky

점심시간 보드게임 스코어 서비스. Go/Gin 백엔드 + React/TypeScript 프론트엔드.

## 서버 실행

```bash
# 백엔드
cd backend && go run ./cmd/main.go

# 프론트엔드
cd frontend && npm run dev
```

## 하네스: 풀스택 기능 개발

**목표:** BE + FE를 동시에 구현하고 API 정합성을 자동 검증

**트리거:** 새 기능 추가, 기존 기능 수정, 풀스택 구현 요청 시 `feature-dev` 스킬을 사용하라. 단순 질문이나 단일 파일 수정은 직접 응답 가능.

**규칙:**
- PR body에 `🤖 Generated with Claude Code` 문구를 포함하지 않는다.

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-05-01 | 초기 구성 | 전체 | 신규 하네스 구축 |
| 2026-05-01 | PR 규칙 추가 | CLAUDE.md | Claude Code 서명 문구 제거 요청 |
