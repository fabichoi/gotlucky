import { useEffect, useState } from "react";
import { createUser, deleteUser, fetchUsers, updateUser } from "../api/gameApi";

interface User {
  id: number;
  name: string;
}

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [newName, setNewName] = useState("");
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editUserName, setEditUserName] = useState("");
  const [message, setMessage] = useState("");

  const loadUsers = async () => {
    try {
      const users = await fetchUsers();
      setUsers(users);
    } catch (err) {
      console.error(err);
      setMessage("유저 목록을 불러오는 중 오류 발생");
    }
  };

  const handleAdd = async () => {
    if (!newName) return;
    try {
      await createUser(newName);
      setNewName("");
      setMessage("유저가 추가되었습니다.");
      loadUsers();
    } catch (err) {
      console.error(err);
      setMessage("유저 추가 중 오류 발생");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteUser(id);
      setMessage("유저가 삭제되었습니다.");
      loadUsers();
    } catch (err) {
      console.error(err);
      setMessage("유저 삭제 중 오류 발생");
    }
  };

  const handleEdit = (user: User) => {
    setEditUserId(user.id);
    setEditUserName(user.name);
  };

  const handleUpdate = async () => {
    if (editUserId === null || !editUserName) return;
    try {
      updateUser(editUserId, editUserName);
      setMessage("유저가 수정되었습니다.");
      setEditUserId(null);
      setEditUserName("");
      loadUsers();
    } catch (err) {
      console.error(err);
      setMessage("유저 수정 중 오류 발생");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="container py-4" style={{ maxWidth: "960px" }}>
      <h1 className="mb-4">👤 유저 관리 (관리자 전용)</h1>

      <div className="mb-3">
        <input
          type="text"
          className="form-control mb-2"
          placeholder="유저 이름"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleAdd}>
          유저 추가
        </button>
      </div>

      {message && <div className="alert alert-info mt-3">{message}</div>}

      <h5 className="mt-4">📋 유저 목록</h5>
      <ul className="list-group">
        {users.map((u) => (
          <li
            key={u.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div className="d-flex align-items-center w-100">
              {editUserId === u.id ? (
                <>
                  <input
                    className="form-control me-2"
                    style={{ maxWidth: "200px" }}
                    value={editUserName}
                    onChange={(e) => setEditUserName(e.target.value)}
                  />
                  <button
                    className="btn btn-sm btn-success me-1"
                    onClick={handleUpdate}
                  >
                    저장
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => setEditUserId(null)}
                  >
                    취소
                  </button>
                </>
              ) : (
                <>
                  <span className="me-auto">{u.name || `User ${u.id}`}</span>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => handleEdit(u)}
                  >
                    수정
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(u.id)}
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
