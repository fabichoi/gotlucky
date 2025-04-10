import { useEffect, useState } from "react";

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
    fetch("http://localhost:8080/api/v1/games/types")
      .then((res) => res.json())
      .then((data) => setTypes(data));
  }, []);

  const handleCreate = async () => {
    if (!newTypeName) return;
    const res = await fetch("http://localhost:8080/api/v1/games/types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTypeName }),
    });
    if (res.ok) {
      const created = await res.json();
      setTypes([...types, created]);
      setNewTypeName("");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    await fetch(`http://localhost:8080/api/v1/games/types/${id}`, {
      method: "DELETE",
    });
    setTypes(types.filter((t) => t.id !== id));
  };

  const handleEdit = (t: GameType) => {
    setEditId(t.id);
    setEditName(t.name);
  };

  const handleUpdate = async () => {
    if (!editId || !editName) return;
    const res = await fetch(
      `http://localhost:8080/api/v1/games/types/${editId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      }
    );
    if (res.ok) {
      const updated = await res.json();
      setTypes(types.map((t) => (t.id === updated.id ? updated : t)));
      setEditId(null);
      setEditName("");
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
