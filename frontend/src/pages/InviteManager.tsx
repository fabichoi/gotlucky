import { useState, useEffect } from "react";
import { fetchInvites, generateInvite } from "../api/gameApi";
import LoadingSpinner from "../components/LoadingSpinner";

export default function InviteManager() {
  const [codes, setCodes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCodes = async () => {
    try {
      const data = await fetchInvites();
      setCodes(data);
    } catch (err) {
      console.error("Failed to load codes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCodes();
  }, []);

  const handleGenerate = async () => {
    try {
      await generateInvite();
      loadCodes();
    } catch (err) {
      alert("코드 생성 실패");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("코드가 복사되었습니다: " + text);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="container py-5" style={{ maxWidth: "800px" }}>
      <div className="glass-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold m-0">초대 코드 관리</h2>
          <button className="btn btn-primary" onClick={handleGenerate}>새 코드 생성</button>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>코드</th>
                <th>상태</th>
                <th>가입자</th>
                <th>생성일</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {codes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">생성된 코드가 없습니다.</td>
                </tr>
              ) : (
                codes.map(code => (
                  <tr key={code.id}>
                    <td>
                      <code className="bg-light px-2 py-1 rounded fw-bold" style={{ fontSize: "1.1rem" }}>{code.code}</code>
                    </td>
                    <td>
                      {code.is_used ? (
                        <span className="badge bg-secondary">사용됨</span>
                      ) : (
                        <span className="badge bg-success">사용 가능</span>
                      )}
                    </td>
                    <td>{code.user?.name || "-"}</td>
                    <td className="small text-muted">{new Date(code.created_at).toLocaleDateString()}</td>
                    <td className="text-end">
                      {!code.is_used && (
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => copyToClipboard(code.code)}
                        >
                          복사
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
