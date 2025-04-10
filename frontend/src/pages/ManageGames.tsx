import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface GameType {
  id: number;
  name: string;
}

interface GameSession {
  id: number;
  date: string;
  game_type: GameType;
}

export default function ManageGames() {
  const [types, setTypes] = useState<GameType[]>([]);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [newDate, setNewDate] = useState("");
  const [newGameTypeId, setNewGameTypeId] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editGameTypeId, setEditGameTypeId] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/v1/games/types")
      .then((res) => res.json())
      .then((data) => setTypes(data));

    fetch("http://localhost:8080/api/v1/games/sessions")
      .then((res) => res.json())
      .then((data) => setSessions(data));
  }, []);

  const handleCreate = async () => {
    const res = await fetch("http://localhost:8080/api/v1/games/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: newDate,
        game_type_id: parseInt(newGameTypeId),
      }),
    });
    if (res.ok) {
      const newSession = await res.json();
      setSessions([...sessions, newSession]);
      setNewDate("");
      setNewGameTypeId("");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    await fetch(`http://localhost:8080/api/v1/games/sessions/${id}`, {
      method: "DELETE",
    });
    setSessions(sessions.filter((s) => s.id !== id));
  };

  const handleEdit = (s: GameSession) => {
    setEditId(s.id);
    setEditDate(s.date.slice(0, 10));
    setEditGameTypeId(s.game_type.id.toString());
  };

  const handleUpdate = async () => {
    if (!editId || !editDate || !editGameTypeId) return;
    const res = await fetch(
      `http://localhost:8080/api/v1/games/sessions/${editId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: editDate,
          game_type_id: parseInt(editGameTypeId),
        }),
      }
    );
    if (res.ok) {
      const updated = await res.json();
      setSessions(sessions.map((s) => (s.id === updated.id ? updated : s)));
      setEditId(null);
      setEditDate("");
      setEditGameTypeId("");
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: "960px" }}>
      <h1 className="mb-4">📅 게임 세션 관리</h1>

      <div className="mb-3">
        <Link
          to="/manage/types?admin"
          className="btn btn-outline-primary btn-sm"
        >
          → 게임 종류 관리로 이동
        </Link>
      </div>

      <h5 className="mb-2">➕ 세션 생성</h5>
      <div className="row g-2 mb-4">
        <div className="col">
          <input
            type="date"
            className="form-control"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
        </div>
        <div className="col">
          <select
            className="form-select"
            value={newGameTypeId}
            onChange={(e) => setNewGameTypeId(e.target.value)}
          >
            <option value="">게임 종류 선택</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-auto">
          <button className="btn btn-success" onClick={handleCreate}>
            세션 생성
          </button>
        </div>
      </div>

      <h5 className="mt-4">📋 세션 목록</h5>
      <ul className="list-group">
        {sessions.map((s) => (
          <li key={s.id} className="list-group-item">
            {editId === s.id ? (
              <div className="row g-2 align-items-center">
                <div className="col">
                  <input
                    type="date"
                    className="form-control"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                </div>
                <div className="col">
                  <select
                    className="form-select"
                    value={editGameTypeId}
                    onChange={(e) => setEditGameTypeId(e.target.value)}
                  >
                    <option value="">게임 종류 선택</option>
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-auto">
                  <button
                    className="btn btn-sm btn-success me-1"
                    onClick={handleUpdate}
                  >
                    저장
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => setEditId(null)}
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <div className="d-flex justify-content-between align-items-center">
                <span>
                  {s.date.slice(0, 10)} / {s.game_type?.name || "게임명 없음"}
                </span>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleEdit(s)}
                  >
                    수정
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(s.id)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
