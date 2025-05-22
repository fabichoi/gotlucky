import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchGameSessions } from "../api/gameApi";

interface GameSession {
  id: number;
  date: string;
  game_type: {
    id: number;
    name: string;
  };
}

export default function Home() {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGameSessions()
      .then((data) => {
        setSessions(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container py-4">로딩 중...</div>;

  return (
    <div className="container py-4" style={{ maxWidth: "960px" }}>
      <h1 className="mb-4">📊 전체 결과 목록</h1>
      <ul className="list-group">
        {sessions.map((session) => (
          <li
            key={session.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>
              {session.date.slice(0, 10)} /{" "}
              {session.game_type?.name || "게임명 없음"}
            </span>
            <Link
              to={`/results/${session.id}`}
              className="btn btn-sm btn-outline-primary"
            >
              보기
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
