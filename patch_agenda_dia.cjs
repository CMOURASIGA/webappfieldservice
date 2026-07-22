const fs = require('fs');
let content = fs.readFileSync('src/pages/Agenda.tsx', 'utf8');

content = content.replace(
  /const weekDays = eachDayOfInterval\(\{ start: currentWeekStart, end: currentWeekEnd \}\);/,
  `const weekDays = viewMode === "Dia" ? [currentDate] : eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd });`
);

// We need to re-fetch the weekDays if it's dynamic based on viewMode. Since it's inside the component body, it works.

// In renderAgendaWeek, replace weekDays references. It will automatically adapt.
fs.writeFileSync('src/pages/Agenda.tsx', content);
