import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { updateUser, deleteUser, fetchUserStats } from "../api/gameApi";
import { useUser } from "../context/UserContext";
import { UserStats } from "../types/user";

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
  const [stats, setStats] = useState<UserStats | null>(null);
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

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchUserStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats", err);
      }
    };
    loadStats();
  }, []);

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
    <div className="container py-5 fade-in" style={{ maxWidth: "1000px" }}>
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h1 className="fw-bold mb-0" style={{ letterSpacing: "-1px" }}>📕 내 정보 관리</h1>
          <p className="text-muted mb-0">계정 정보 및 게임 전적을 확인하세요</p>
        </div>
        {message && (
          <div
            className={`alert alert-${message.type === "success" ? "success" : "danger"} mb-0 py-2 border-0 shadow-sm`}
            style={{ borderRadius: "10px" }}
          >
            {message.text}
          </div>
        )}
      </div>

      <div className="row g-4">
        {/* Point Card */}
        <div className="col-md-4">
          <div className="glass-card p-4 h-100 d-flex flex-column justify-content-center text-center">
            <div className="small fw-bold text-uppercase text-muted mb-2" style={{ letterSpacing: "1px" }}>보유 포인트</div>
            <div className="display-5 fw-black text-primary mb-1">{form.points.toLocaleString()}</div>
            <div className="fw-bold text-muted">Lucky Points</div>
          </div>
        </div>

        {/* Info & Security Card */}
        <div className="col-md-8">
          <form onSubmit={handleUpdateUser} className="glass-card p-4 h-100">
            <div className="mb-4">
              <h5 className="fw-bold mb-3 border-bottom pb-2">회원 정보</h5>
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">이름</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ borderRadius: "8px", padding: "0.6rem" }}
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">이메일</label>
                <input
                  type="email"
                  className="form-control bg-light"
                  style={{ borderRadius: "8px", padding: "0.6rem" }}
                  value={form.email}
                  disabled
                />
                <div className="form-text small">이메일은 변경할 수 없습니다.</div>
              </div>
            </div>

            <div className="mb-4">
              <h5 className="fw-bold mb-3 border-bottom pb-2">비밀번호 변경</h5>
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">현재 비밀번호</label>
                <input
                  type="password"
                  className="form-control"
                  style={{ borderRadius: "8px", padding: "0.6rem" }}
                  name="oldPassword"
                  value={form.oldPassword}
                  onChange={handleChange}
                  placeholder="정보 수정을 위해 필요합니다"
                />
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-bold text-muted">새 비밀번호</label>
                  <input
                    type="password"
                    className="form-control"
                    style={{ borderRadius: "8px", padding: "0.6rem" }}
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-bold text-muted">비밀번호 확인</label>
                  <input
                    type="password"
                    className="form-control"
                    style={{ borderRadius: "8px", padding: "0.6rem" }}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-3"
              disabled={isLoading}
              style={{ borderRadius: "10px" }}
            >
              {isLoading ? "변경 사항 저장 중..." : "프로필 업데이트"}
            </button>
          </form>
        </div>

        {/* Game Stats Section */}
        <div className="col-12 mt-4">
          <div className="glass-card p-4">
            <h5 className="fw-bold mb-4 border-bottom pb-2">🎮 게임 전적 통계</h5>
            {stats ? (
              <div className="row g-4">
                {/* Skull King Stats */}
                <div className="col-md-6">
                  <div className="p-4 rounded-4 bg-light border border-opacity-10 h-100">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center">
                        <span className="fs-4 me-2">💀</span>
                        <h6 className="fw-bold mb-0">스컬킹 (Skull King)</h6>
                      </div>
                      <Link to="/skull-king/history" className="btn btn-sm btn-outline-primary py-1 px-3" style={{ fontSize: '0.8rem', borderRadius: '20px' }}>
                        상세 보기
                      </Link>
                    </div>
                    <div className="row g-2 text-center">
                      <div className="col-4">
                        <div className="p-2 bg-white rounded-3 shadow-sm border">
                          <div className="small text-muted mb-1">판수</div>
                          <div className="fw-bold">{stats.skull_king.total_games}</div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="p-2 bg-white rounded-3 shadow-sm border">
                          <div className="small text-muted mb-1">승리(1등)</div>
                          <div className="fw-bold text-primary">{stats.skull_king.win_count}</div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="p-2 bg-white rounded-3 shadow-sm border">
                          <div className="small text-muted mb-1">승률</div>
                          <div className="fw-bold">
                            {stats.skull_king.total_games > 0 
                              ? Math.round((stats.skull_king.win_count / stats.skull_king.total_games) * 100) 
                              : 0}%
                          </div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="p-2 bg-white rounded-3 shadow-sm border">
                          <div className="small text-muted mb-1">총 획득 포인트</div>
                          <div className="fw-bold text-accent">{stats.skull_king.total_points.toLocaleString()} pts</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="p-2 bg-white rounded-3 shadow-sm border">
                          <div className="small text-muted mb-1">평균 포인트</div>
                          <div className="fw-bold">{stats.skull_king.average_points.toFixed(1)} pts</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Wizard Stats */}
                <div className="col-md-6">
                  <div className="p-4 rounded-4 bg-light border border-opacity-10 h-100">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center">
                        <span className="fs-4 me-2">🧙</span>
                        <h6 className="fw-bold mb-0">위자드 (Wizard)</h6>
                      </div>
                      <Link to="/wizard/history" className="btn btn-sm btn-outline-primary py-1 px-3" style={{ fontSize: '0.8rem', borderRadius: '20px' }}>
                        상세 보기
                      </Link>
                    </div>
                    <div className="row g-2 text-center">
                      <div className="col-4">
                        <div className="p-2 bg-white rounded-3 shadow-sm border">
                          <div className="small text-muted mb-1">판수</div>
                          <div className="fw-bold">{stats.wizard.total_games}</div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="p-2 bg-white rounded-3 shadow-sm border">
                          <div className="small text-muted mb-1">승리(1등)</div>
                          <div className="fw-bold text-primary">{stats.wizard.win_count}</div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="p-2 bg-white rounded-3 shadow-sm border">
                          <div className="small text-muted mb-1">승률</div>
                          <div className="fw-bold">
                            {stats.wizard.total_games > 0 
                              ? Math.round((stats.wizard.win_count / stats.wizard.total_games) * 100) 
                              : 0}%
                          </div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="p-2 bg-white rounded-3 shadow-sm border">
                          <div className="small text-muted mb-1">총 획득 포인트</div>
                          <div className="fw-bold text-accent">{stats.wizard.total_points.toLocaleString()} pts</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="p-2 bg-white rounded-3 shadow-sm border">
                          <div className="small text-muted mb-1">평균 포인트</div>
                          <div className="fw-bold">{stats.wizard.average_points.toFixed(1)} pts</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                <span className="text-muted">전적 데이터를 불러오는 중...</span>
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="col-12 mt-5">
          <div className="p-4 border border-danger border-opacity-25 bg-danger bg-opacity-10" style={{ borderRadius: "16px" }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-bold text-danger mb-1">위험 구역</h6>
                <p className="small text-danger mb-0 opacity-75">계정을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.</p>
              </div>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={handleDeleteUser}
                style={{ borderRadius: "8px" }}
              >
                회원 탈퇴
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
