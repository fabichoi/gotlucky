import React, { useState, useEffect } from "react";

interface CompactStepperProps {
  id: string;
  initialValue: number;
  min: number;
  max: number;
  step?: number;
  isBonus?: boolean;
  onChange?: (value: number | string) => void;
}

const CompactStepper: React.FC<CompactStepperProps> = ({
  id,
  initialValue,
  min,
  max,
  step = 1,
  isBonus = false,
  onChange,
}) => {
  const [value, setValue] = useState<number | string>(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const adjust = (amount: number) => {
    let current = value === "" ? 0 : Number(value);
    let next = current + amount;
    if (next < min) next = min;
    if (next > max) next = max;
    setValue(next);
    if (onChange) onChange(next);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setValue("");
      if (onChange) onChange("");
    } else {
      const num = parseInt(val);
      if (!isNaN(num)) {
        setValue(num);
        if (onChange) onChange(num);
      }
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-between bg-white rounded-pill shadow-sm p-1 border"
      style={{ width: "100%", maxWidth: "125px", margin: "0 auto" }}
    >
      <button
        className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
        style={{
          width: "36px",
          height: "36px",
          fontWeight: "900",
          color: "var(--text-main)",
          fontSize: "1.2rem",
          padding: 0,
        }}
        type="button"
        onClick={() => adjust(-step)}
      >
        −
      </button>
      <input
        type="number"
        id={id}
        className="form-control border-0 p-0 text-center fw-900 bg-transparent"
        style={{
          width: isBonus ? "36px" : "30px",
          fontSize: isBonus ? "0.95rem" : "1.2rem",
          color: "var(--text-main)",
        }}
        value={value}
        onChange={handleInputChange}
      />
      <button
        className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
        style={{
          width: "36px",
          height: "36px",
          fontWeight: "900",
          color: "var(--text-main)",
          fontSize: "1.2rem",
          padding: 0,
        }}
        type="button"
        onClick={() => adjust(step)}
      >
        +
      </button>
    </div>
  );
};

export default CompactStepper;
