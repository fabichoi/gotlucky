import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const { setUser } = useUser();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true); // 마운트 후 모달 표시
  }, []);

  const handleConfirm = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const handleCancel = () => {
    navigate(-1); // 이전 페이지로
  };

  return (
    show && (
      <div
        className="modal show fade d-block"
        tabIndex={-1}
        role="dialog"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">로그아웃 확인</h5>
            </div>
            <div className="modal-body">
              <p>정말 로그아웃하시겠습니까?</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleCancel}>
                취소
              </button>
              <button className="btn btn-danger" onClick={handleConfirm}>
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
}
