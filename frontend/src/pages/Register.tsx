import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/gameApi";

export default function Register() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(name, email, password, inviteCode);
      alert("회원가입 완료! 로그인해 주세요.");
      navigate("/login");
    } catch (err: any) {
      alert("회원가입 실패: " + (err.message || "오류 발생"));
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 450 }}>
      <div className="glass-card p-5">
        <h2 className="fw-bold mb-4">회원가입</h2>
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label">이름</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">이메일</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">비밀번호</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label fw-bold text-accent">초대 코드</label>
            <input
              type="text"
              className="form-control border-primary"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="전달받은 코드를 입력하세요"
              required
              style={{ background: "rgba(59, 130, 246, 0.05)" }}
            />
          </div>
          <button className="btn btn-primary w-100 py-3" type="submit">
            회원가입 완료
          </button>
        </form>
      </div>
    </div>
  );
}
