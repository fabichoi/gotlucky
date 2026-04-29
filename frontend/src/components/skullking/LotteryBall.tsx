import React from "react";

interface LotteryBallProps {
  value: number | string;
  size?: "small" | "large";
  color?: string;
  className?: string;
}

const LotteryBall: React.FC<LotteryBallProps> = ({
  value,
  size = "small",
  color = "var(--accent-color)",
  className = "",
}) => {
  const isLarge = size === "large";
  
  const style: React.CSSProperties = {
    width: isLarge ? "140px" : "80px",
    height: isLarge ? "140px" : "80px",
    fontSize: isLarge ? "4rem" : "2.5rem",
    border: `3px solid ${color}`,
    borderWidth: isLarge ? "6px" : "3px",
    boxShadow: isLarge ? "0 10px 25px rgba(0,0,0,0.15)" : "none",
  };

  return (
    <div className={`lottery-ball ${className}`} style={style}>
      {value}
    </div>
  );
};

export default LotteryBall;
