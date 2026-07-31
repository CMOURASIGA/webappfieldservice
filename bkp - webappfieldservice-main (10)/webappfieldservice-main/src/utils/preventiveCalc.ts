import { addDays, addMonths, addYears, parseISO, format, isValid } from "date-fns";

type Periodicity = "Diária" | "Semanal" | "Quinzenal" | "Mensal" | "Trimestral" | "Semestral" | "Anual";

export const calculateNextExecution = (
  periodicity: Periodicity,
  lastExecution?: string,
  startDate?: string
): string | undefined => {
  let baseDateStr = lastExecution || startDate;
  if (!baseDateStr) return undefined;

  const baseDate = parseISO(baseDateStr);
  if (!isValid(baseDate)) return undefined;

  let nextDate = baseDate;

  switch (periodicity) {
    case "Diária":
      nextDate = addDays(baseDate, 1);
      break;
    case "Semanal":
      nextDate = addDays(baseDate, 7);
      break;
    case "Quinzenal":
      nextDate = addDays(baseDate, 15);
      break;
    case "Mensal":
      nextDate = addMonths(baseDate, 1);
      break;
    case "Trimestral":
      nextDate = addMonths(baseDate, 3);
      break;
    case "Semestral":
      nextDate = addMonths(baseDate, 6);
      break;
    case "Anual":
      nextDate = addYears(baseDate, 1);
      break;
  }

  return format(nextDate, "yyyy-MM-dd");
};
