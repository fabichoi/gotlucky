import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchGameResult } from "../api/gameApi";

interface GameType {
  id: number;
  name: string;
}

interface GameInfo {
  id: number;
  date: string;
  name: string;
  game_type: GameType;
}

interface User {
  id: number;
  name: string;
  points: number;
}

interface GameResult {
  id: number;
  user: User;
  points_earned: number;
  rank: number;
}

interface GameResultResponse {
  game: GameInfo;
  results: GameResult[];
}

export default function Results() {
  const { id } = useParams();
  const [result, setResult] = useState<GameResultResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchGameResult(parseInt(id)).then((data) => {
      setResult(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="container py-4">로딩 중...</div>;
  if (!result)
    return <div className="container py-4">결과를 불러오지 못했습니다.</div>;

  return (
    <div className="container py-4" style={{ maxWidth: "960px" }}>
      <h1 className="mb-4">
        🏆 {result.game.date.slice(0, 10)} 게임 결과 (
        {result.game.game_type.name})
      </h1>

      <div key={result.game.name} className="mb-5 border rounded p-3 shadow-sm">
        <h3 className="mb-2">{result.game.name}</h3>
        <p className="text-muted">
          {result.game.date.slice(0, 10)} / 세션 ID: {result.game.id}
        </p>

        <h6 className="mt-3">🥇 상위 랭커</h6>
        <ul className="list-group mb-3">
          {result.results
            .filter((u) => u.rank && u.rank <= 3)
            .sort((a, b) => (a.rank || 0) - (b.rank || 0))
            .map((u) => (
              <li key={u.id} className="list-group-item">
                {u.rank}등 - {u.user.name} / 획득: {u.points_earned}점
              </li>
            ))}
        </ul>

        <table className="table table-sm table-bordered">
          <thead className="table-light">
            <tr>
              <th>유저</th>
              <th>획득 포인트</th>
              <th>순위</th>
            </tr>
          </thead>
          <tbody>
            {result.results.map((p) => (
              <tr key={p.id}>
                <td>{p.user.name}</td>
                <td>{p.points_earned}</td>
                <td>{p.rank || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
