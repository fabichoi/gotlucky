import React from "react";

interface SkullKingModalProps {
  show: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const SkullKingModal: React.FC<SkullKingModalProps> = ({
  show,
  title = "알림",
  message,
  onConfirm,
  onCancel,
  confirmText = "확인",
  cancelText = "취소",
}) => {
  if (!show) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{
        zIndex: 1050,
        backdropFilter: "blur(5px)",
        backgroundColor: "rgba(0,0,0,0.4)",
      }}
    >
      <div
        className="bg-white p-4 rounded-4 shadow-lg text-center mx-3 pop-in"
        style={{
          minWidth: "300px",
          maxWidth: "400px",
        }}
      >
        <h5 className="fw-bold mb-3" style={{ color: "var(--text-main)" }}>
          {title}
        </h5>
        <p
          className="mb-4 fw-bold text-muted"
          style={{ whiteSpace: "pre-wrap", fontSize: "0.95rem" }}
        >
          {message}
        </p>
        <div className="d-flex gap-2 justify-content-center">
          {onCancel && (
            <button
              className="btn btn-light px-4 py-2 rounded-pill fw-bold"
              onClick={onCancel}
            >
              {cancelText}
            </button>
          )}
          <button
            className="btn btn-primary px-4 py-2 rounded-pill fw-bold"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>

    </div>
  );
};

export default SkullKingModal;
