import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateUser, deleteUser } from "../api/gameApi";
import { useUser } from "../context/UserContext";

interface ProfileForm {
  name: string;
  email: string;
  points: number;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [form, setForm] = useState<ProfileForm>({
    name: user?.name || "",
    email: user?.email || "",
    points: user?.points || 0,
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const payload: { name?: string; old_password?: string; new_password?: string } = {};

      // 이름이 변경되었다면 추가
      if (form.name !== user?.name) {
        payload.name = form.name;
      }

      // 비밀번호 변경을 시도하는 경우
      if (form.newPassword) {
        if (form.newPassword !== form.confirmPassword) {
          setMessage({
            type: "error",
            text: "새 비밀번호가 일치하지 않습니다.",
          });
          return;
        }
        if (!form.oldPassword) {
          setMessage({ type: "error", text: "현재 비밀번호를 입력해주세요." });
          return;
        }
        payload.old_password = form.oldPassword;
        payload.new_password = form.newPassword;
      }

      if (Object.keys(payload).length === 0) {
        setMessage({ type: "error", text: "변경할 내용이 없습니다." });
        return;
      }

      if (!user?.id) {
        setMessage({ type: "error", text: "사용자 정보를 찾을 수 없습니다." });
        return;
      }

      const updatedUser = await updateUser(user.id, payload);
      setUser(updatedUser);
      setMessage({
        type: "success",
        text: "프로필이 성공적으로 업데이트되었습니다.",
      });

      // 비밀번호 필드 초기화
      setForm((prev) => ({
        ...prev,
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      setMessage({ type: "error", text: "프로필 업데이트에 실패했습니다." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (
      !window.confirm("정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")
    ) {
      return;
    }

    try {
      if (!user?.id) {
        setMessage({ type: "error", text: "사용자 정보를 찾을 수 없습니다." });
        return;
      }
      await deleteUser(user.id);
      setUser(null);
      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      setMessage({ type: "error", text: "회원 탈퇴에 실패했습니다." });
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: "960px" }}>
      <h1 className="mb-4">내 정보 관리</h1>

      {message && (
        <div
          className={`alert alert-${
            message.type === "success" ? "success" : "danger"
          } mb-4`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleUpdateUser}>
        <div className="mb-3">
          <label className="form-label">이름</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">이메일</label>
          <input
            type="email"
            className="form-control"
            value={form.email}
            disabled
          />
          <div className="form-text text-muted">
            이메일은 변경할 수 없습니다.
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">보유 포인트</label>
          <div className="d-flex align-items-center">
            <span className="fs-4 fw-bold text-primary me-2">{form.points}</span>
            <span className="text-muted">P</span>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">현재 비밀번호</label>
          <input
            type="password"
            className="form-control"
            name="oldPassword"
            value={form.oldPassword}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">새 비밀번호</label>
          <input
            type="password"
            className="form-control"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">새 비밀번호 확인</label>
          <input
            type="password"
            className="form-control"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
          />
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "저장 중..." : "저장하기"}
          </button>

          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDeleteUser}
          >
            회원 탈퇴
          </button>
        </div>
      </form>
    </div>
  );
}
