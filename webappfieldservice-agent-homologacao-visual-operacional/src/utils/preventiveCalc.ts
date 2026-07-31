import { addDays, addMonths, addYears, parseISO, format, isValid } from "date-fns";

export const calculateNextExecution = (
  periodicity: string,
  lastExecution?: string,
  startDate?: string
): string | undefined => {
  let baseDateStr = lastExecution || startDate;
  if (!baseDateStr) return undefined;

  const baseDate = parseISO(baseDateStr);
  if (!isValid(baseDate)) return undefined;

  let nextDate = baseDate;

  switch (periodicity.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")) {
    case "diaria":
      nextDate = addDays(baseDate, 1);
      break;
    case "semanal":
      nextDate = addDays(baseDate, 7);
      break;
    case "quinzenal":
      nextDate = addDays(baseDate, 15);
      break;
    case "mensal":
      nextDate = addMonths(baseDate, 1);
      break;
    case "trimestral":
      nextDate = addMonths(baseDate, 3);
      break;
    case "semestral":
      nextDate = addMonths(baseDate, 6);
      break;
    case "anual":
      nextDate = addYears(baseDate, 1);
      break;
  }

  return format(nextDate, "yyyy-MM-dd");
};
