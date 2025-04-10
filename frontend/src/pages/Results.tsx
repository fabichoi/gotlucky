import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Participant {
  id: number;
  user_id: number;
  points_used: number;
  points_earned: number;
  rank?: number;
}

interface Session {
  id: number;
  date: string;
  game_type: {
    id: number;
    name: string;
  };
}

interface GameResultResponse {
  game: Session;
  participants: Participant[];
}

export default function Results() {
  const { id } = useParams();
  const [result, setResult] = useState<GameResultResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8080/api/v1/games/${id}/results`)
      .then((res) => res.json())
      .then((data) => {
        setResult(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="container py-4">로딩 중...</div>;
  if (!result)
    return <div className="container py-4">결과를 불러오지 못했습니다.</div>;

  return (
    <div className="container py-4" style={{ maxWidth: "960px" }}>
      <h1 className="mb-4">🏆 {result.game.game_type.name} 결과</h1>
      <p className="text-muted">
        {result.game.date.slice(0, 10)} / 세션 ID: {result.game.id}
      </p>

      <h5 className="mt-4">🥇 상위 랭커</h5>
      <ul className="list-group mb-4">
        {result.participants
          .filter((p) => p.rank && p.rank <= 3)
          .sort((a, b) => (a.rank || 0) - (b.rank || 0))
          .map((p) => (
            <li key={p.id} className="list-group-item">
              {p.rank}등 - User {p.user_id} / 획득: {p.points_earned}점
            </li>
          ))}
      </ul>

      <h5 className="mt-4">👥 전체 참가자</h5>
      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>User ID</th>
            <th>사용 포인트</th>
            <th>획득 포인트</th>
            <th>순위</th>
          </tr>
        </thead>
        <tbody>
          {result.participants.map((p) => (
            <tr key={p.id}>
              <td>{p.user_id}</td>
              <td>{p.points_used}</td>
              <td>{p.points_earned}</td>
              <td>{p.rank || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
