import { useState, useEffect } from "react";
import { playLottery, getLastPlayedLotteryInfo } from "../api/gameApi";

export default function Lottery() {
  // const [number, setNumber] = useState<number | null>(null); // Removed unused state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayNumber, setDisplayNumber] = useState<number | null>(null);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [lastPlayed, setLastPlayed] = useState<string | null>(null);
  const [lastEarned, setLastEarned] = useState<number | null>(null);
  const [canPlay, setCanPlay] = useState(true);

  // 컴포넌트 마운트 시 마지막 추첨 정보 조회
  useEffect(() => {
    const fetchLastPlay = async () => {
      try {
        const info = await getLastPlayedLotteryInfo();
        if (info) {
          setLastPlayed(info.lastPlayed);
          setLastEarned(info.earned);
          // 24시간 이내인지 확인
          const lastPlayTime = new Date(info.lastPlayed).getTime();
          const now = new Date().getTime();
          const hoursDiff = (now - lastPlayTime) / (1000 * 60 * 60);
          setCanPlay(hoursDiff >= 24);
        }
      } catch (err) {
        console.error("마지막 추첨 정보 조회 실패:", err);
      }
    };

    fetchLastPlay();
  }, []);

  const getNumberColor = (num: number): string => {
    if (num < 15) return "#FF0000"; // 빨강
    if (num < 30) return "#FF7F00"; // 주황
    if (num < 45) return "#FFFF00"; // 노랑
    if (num < 60) return "#00FF00"; // 초록
    if (num < 75) return "#0000FF"; // 파랑
    if (num < 90) return "#4B0082"; // 남색
    return "#9400D3"; // 보라
  };

  const animateNumber = () => {
    return new Promise<void>((resolve) => {
      let count = 0;
      const interval = setInterval(() => {
        setDisplayNumber(Math.floor(Math.random() * 101));
        count++;
        if (count >= 30) {
          clearInterval(interval);
          setTimeout(() => {
            setDisplayNumber(null); // API 호출 전에 초기화
            resolve(); // 애니메이션 완료
          }, 100);
        }
      }, 100);
    });
  };

  const drawNumber = async () => {
    try {
      setButtonDisabled(true);
      setIsLoading(true);
      setError(null);

      await animateNumber();

      const result = await playLottery();

      if (result.error) {
        setError(result.error);
        if (result.lastPlayed) {
          setLastPlayed(result.lastPlayed);
          setCanPlay(false);
        }
        return;
      }

      // setNumber(result.earned); // Removed unused setter
      setDisplayNumber(result.earned);
      setLastPlayed(result.lastPlayed || null);
      setCanPlay(false);
    } catch (err) {
      setError("복권 번호 추첨 중 오류가 발생했습니다.");
      console.error("복권 추첨 실패:", err);
    } finally {
      setIsLoading(false);
      setButtonDisabled(false);
    }
  };

  return (
    <div className="container py-5 fade-in" style={{ maxWidth: "600px" }}>
      <div className="glass-card p-5 text-center">
        <h1 className="mb-2 fw-bold" style={{ letterSpacing: "-1px" }}>🎲 복권 추첨</h1>
        <p className="text-muted mb-4">당신의 행운을 시험해보세요</p>

        {lastPlayed !== null && !canPlay && !displayNumber && !isLoading && (
          <div className="alert border-0 bg-light text-center mb-4" style={{ borderRadius: "12px" }}>
            <div className="small text-muted mb-1">마지막 추첨</div>
            <div className="fw-bold">{new Date(lastPlayed).toLocaleString()}</div>
            <div className="mt-2 text-primary small">
              다음 추첨까지{" "}
              {(() => {
                const hoursDiff =
                  24 -
                  (new Date().getTime() - new Date(lastPlayed).getTime()) /
                    (1000 * 60 * 60);
                const hours = Math.floor(hoursDiff);
                const minutes = Math.floor((hoursDiff - hours) * 60);
                return `${hours}시간 ${minutes}분`;
              })()}
              남았습니다
            </div>
          </div>
        )}

        <div className="mb-5 mt-4 d-flex flex-column align-items-center">
          {(displayNumber !== null || (lastEarned !== null && !canPlay && !isLoading)) ? (
            <div
              className="d-flex align-items-center justify-content-center mb-3 shadow-lg"
              style={{
                width: "160px",
                height: "160px",
                borderRadius: "50%",
                backgroundColor: getNumberColor(displayNumber ?? lastEarned ?? 0),
                fontSize: "3.5rem",
                fontWeight: "900",
                color: ["#FFFF00", "#00FF00"].includes(getNumberColor(displayNumber ?? lastEarned ?? 0))
                  ? "#000"
                  : "#fff",
                transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                border: "8px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
              }}
            >
              {displayNumber ?? lastEarned}
            </div>
          ) : (
            <div
              className="d-flex align-items-center justify-content-center mb-3 text-muted"
              style={{
                width: "160px",
                height: "160px",
                borderRadius: "50%",
                backgroundColor: "#f1f5f9",
                fontSize: "3.5rem",
                fontWeight: "900",
                border: "8px dashed #e2e8f0"
              }}
            >
              ?
            </div>
          )}
          <div className="text-muted fw-medium">
            {isLoading ? "행운의 번호를 찾는 중..." : displayNumber !== null ? "오늘의 당첨 번호!" : "번호를 뽑아주세요"}
          </div>
        </div>

        <button
          className="btn btn-primary btn-lg w-100 py-3 mb-3"
          onClick={drawNumber}
          disabled={buttonDisabled || !canPlay}
          style={{ fontSize: "1.1rem", borderRadius: "12px" }}
        >
          {isLoading
            ? "추첨 진행 중..."
            : !canPlay
            ? "내일 다시 도전하세요"
            : "번호 추첨하기"}
        </button>

        {error && (
          <div className="text-danger small mt-2" role="alert">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
