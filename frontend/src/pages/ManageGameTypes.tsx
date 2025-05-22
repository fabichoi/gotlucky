import { useEffect, useState } from "react";
import {
  createGameType,
  deleteGameType,
  fetchGameTypes,
  updateGameType,
} from "../api/gameApi";

interface GameType {
  id: number;
  name: string;
}

export default function ManageGameTypes() {
  const [types, setTypes] = useState<GameType[]>([]);
  const [newTypeName, setNewTypeName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    fetchGameTypes()
      .then((data) => setTypes(data));
  }, []);

  const handleCreate = async () => {
    if (!newTypeName) return;
    try {
      const newGameType = await createGameType(newTypeName);
      setTypes([...types, newGameType]);
      setNewTypeName("");
    } catch (err) {
      console.error("게임 타입 생성 실패:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteGameType(id);
      setTypes(types.filter((t) => t.id !== id));
    } catch (err) {
      console.error("세션 삭제 실패:", err);
    }
  };

  const handleEdit = (t: GameType) => {
    setEditId(t.id);
    setEditName(t.name);
  };

  const handleUpdate = async () => {
    if (!editId || !editName) return;
    try {
      const updated = await updateGameType(editId, editName);
      setTypes(types.map((t) => (t.id === updated.id ? updated : t)));
      setEditId(null);
      setEditName("");
    } catch (err) {
      console.log("게임 타입 수정 실패");
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: "960px" }}>
      <h1 className="mb-4">🎮 게임 종류 관리</h1>

      <div className="mb-3 d-flex">
        <input
          type="text"
          className="form-control me-2"
          placeholder="새 게임 종류 이름"
          value={newTypeName}
          onChange={(e) => setNewTypeName(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleCreate}>
          추가
        </button>
      </div>

      <ul className="list-group">
        {types.map((t) => (
          <li
            key={t.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            {editId === t.id ? (
              <>
                <input
                  className="form-control me-2"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
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
              </>
            ) : (
              <>
                <span>{t.name}</span>
                <div>
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() => handleEdit(t)}
                  >
                    수정
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(t.id)}
                  >
                    삭제
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
