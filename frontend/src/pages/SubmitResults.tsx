import { useEffect, useState } from "react";
import { submitGameResults } from "../api/gameApi";

interface Session {
  id: number;
  date: string;
  game_type: {
    id: number;
    name: string;
  }
}

interface User {
  id: number;
  name: string;
}

export default function SubmitResults() {
  const [sessionId, setSessionId] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [entries, setEntries] = useState([
    { user_id: "", rank: "", points_earned: "" },
  ]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/v1/games/sessions")
      .then((res) => res.json())
      .then((data) => setSessions(data));

    fetch("http://localhost:8080/api/v1/users")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  const calculatePoints = (rank: number, total: number): number => {
    const base = total * 100;
    if (rank === 1) return Math.floor(base * 0.5);
    if (rank === 2) return Math.floor(base * 0.3);
    if (rank === 3) return Math.floor(base * 0.2);
    return 0;
  };

  const handleChange = (index: number, field: string, value: string) => {
    const updated = [...entries];
    updated[index][field as keyof (typeof updated)[number]] = value;

    if (field === "rank") {
      const rankNum = parseInt(value);
      if (rankNum >= 1 && rankNum <= 3) {
        updated[index].points_earned = calculatePoints(
          rankNum,
          entries.length
        ).toString();
      } else {
        updated[index].points_earned = "0";
      }
    }

    setEntries(updated);
  };

  const addEntry = () => {
    setEntries([...entries, { user_id: "", rank: "", points_earned: "" }]);
  };

  const handleSubmit = async () => {
    const payload = entries.map((e) => ({
      user_id: parseInt(e.user_id),
      rank: parseInt(e.rank),
      points_earned: parseInt(e.points_earned),
    }));
    await submitGameResults(parseInt(sessionId), payload);
    setMessage("결과가 성공적으로 저장되었습니다.");
  };

  return (
    <div className="container py-4" style={{ maxWidth: "960px" }}>
      <h1 className="mb-4">🛠️ 결과 기록 (관리자 전용)</h1>

      <select
        className="form-select mb-3"
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
      >
        <option value="">세션을 선택하세요</option>
        {sessions.map((s) => (
          <option key={s.id} value={s.id}>
            {s.date.slice(0, 10)} (ID: {s.id}) - {s.game_type?.name || "No Name"}
          </option>
        ))}
      </select>

      {entries.map((entry, index) => (
        <div className="row g-2 mb-2" key={index}>
          <div className="col">
            <select
              className="form-select"
              value={entry.user_id}
              onChange={(e) => handleChange(index, "user_id", e.target.value)}
            >
              <option value="">User 선택</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name || `User ${u.id}`}
                </option>
              ))}
            </select>
          </div>
          <div className="col">
            <input
              type="number"
              min="1"
              max="3"
              className="form-control"
              placeholder="Rank (1~3)"
              value={entry.rank}
              onChange={(e) => handleChange(index, "rank", e.target.value)}
            />
          </div>
          <div className="col">
            <input
              className="form-control"
              readOnly
              placeholder="획득 포인트"
              value={entry.points_earned}
            />
          </div>
        </div>
      ))}
      <div className="mb-3">
        <button className="btn btn-secondary me-2" onClick={addEntry}>
          + 유저 추가
        </button>
        <button className="btn btn-danger" onClick={handleSubmit}>
          결과 저장
        </button>
      </div>
      {message && <div className="alert alert-success">{message}</div>}
    </div>
  );
}
