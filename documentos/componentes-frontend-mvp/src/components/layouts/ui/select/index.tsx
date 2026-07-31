import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cnc-ti/layout-basic";

type SelectComponentProps = {
  options: { value: string; label: string }[];
  placeholder: string;
  onChange: (value: string) => void;
  value?: string;
  clear?: boolean;
  loading?: boolean;
  disabled?: boolean;
};

const SelectComponent: React.FC<SelectComponentProps> = ({
  options,
  placeholder,
  onChange,
  value,
  clear,
  loading,
  disabled,
}) => {
  const handleChange = (selectedValue: string) => {
    if (selectedValue === "__clear__") {
      onChange("");
    } else {
      onChange(selectedValue);
    }
  };

  return (
    <Select disabled={disabled} value={value} onValueChange={handleChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.length >= 1 && clear && (
          <SelectItem value="__clear__">Limpar seleção</SelectItem>
        )}
        {loading && <div>Carregando...</div>}
        {!loading &&
          options.map((option, index) => (
            <SelectItem
              key={index}
              value={option.value}
              className="cursor-pointer hover:bg-gray-100"
            >
              {option.label}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
};

export default SelectComponent;
