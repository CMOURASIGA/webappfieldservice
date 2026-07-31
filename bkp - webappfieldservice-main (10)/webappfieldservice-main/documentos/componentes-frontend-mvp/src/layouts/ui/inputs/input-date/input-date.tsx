import React from "react";

type DateInputProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  id?: string;
};

const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  label = "Selecione uma data:",
  id = "date",
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        type="date"
        id={id}
        name={id}
        value={value}
        onChange={handleChange}
      />
    </div>
  );
};

export default DateInput;
