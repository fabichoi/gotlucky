import { useState, useEffect } from "react";
import { playLottery, getLastPlayedLotteryInfo } from "../api/gameApi";

export default function Lottery() {
  const [number, setNumber] = useState<number | null>(null);
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

      setNumber(result.earned);
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
    <div className="container py-4" style={{ maxWidth: "960px" }}>
      <h1 className="mb-4">🎲 복권 추첨</h1>

      {lastPlayed !== null && !canPlay && !displayNumber && !isLoading && (
        <div className="alert alert-info text-center mb-3" role="alert">
          마지막 추첨 시간: {new Date(lastPlayed).toLocaleString()}
          {!canPlay && (
            <div className="mt-2">
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
          )}
        </div>
      )}

      <div className="text-center mb-4">
        <button
          className="btn btn-primary btn-lg"
          onClick={drawNumber}
          disabled={buttonDisabled || !canPlay}
        >
          {isLoading
            ? "추첨 중..."
            : !canPlay
            ? "다음 추첨까지 대기 중..."
            : "번호 추첨하기"}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      )}

      {lastEarned !== null && !canPlay && !displayNumber && !isLoading && (
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center mb-2"
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              backgroundColor: getNumberColor(lastEarned),
              fontSize: "2.5rem",
              fontWeight: "bold",
              color: ["#FFFF00", "#00FF00"].includes(getNumberColor(lastEarned))
                ? "#000"
                : "#fff",
              transition: "background-color 0.3s ease",
            }}
          >
            {lastEarned}
          </div>
          <div className="text-muted">마지막 추첨 번호: {lastEarned}</div>
        </div>
      )}

      {displayNumber !== null && (
        <div className="text-center">
          <div
            className="d-inline-flex align-items-center justify-content-center mb-3"
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              backgroundColor: getNumberColor(displayNumber),
              fontSize: "2.5rem",
              fontWeight: "bold",
              color: ["#FFFF00", "#00FF00"].includes(
                getNumberColor(displayNumber)
              )
                ? "#000"
                : "#fff",
              transition: "background-color 0.3s ease",
            }}
          >
            {displayNumber}
          </div>
          <div className="text-muted">
            {number === displayNumber
              ? `당첨 번호: ${displayNumber}`
              : "번호 추첨 중..."}
          </div>
        </div>
      )}
    </div>
  );
}
