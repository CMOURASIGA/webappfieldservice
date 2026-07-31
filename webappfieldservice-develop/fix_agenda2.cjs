const fs = require('fs');
let content = fs.readFileSync('src/pages/Agenda.tsx', 'utf8');

// For Badge
content = content.replace(/<Badge([^>]*)variant="primary"([^>]*)>/g, '<Badge$1variant="default"$2>');
content = content.replace(/<Badge([^>]*)variant="secondary"([^>]*)>/g, '<Badge$1variant="default"$2>');

// For Button, replace default with primary, outline with secondary
// BUT ONLY FOR BUTTONS!
content = content.replace(/<Button([^>]*)variant="default"([^>]*)>/g, '<Button$1variant="primary"$2>');
content = content.replace(/<Button([^>]*)variant="outline"([^>]*)>/g, '<Button$1variant="secondary"$2>');
// And the `variant="default" | "outline"` dynamic logic:
content = content.replace(/variant=\{([^ ]+) \? "(default|outline)" : "(default|outline)"\}/g, (match, condition, v1, v2) => {
  const newV1 = v1 === 'default' ? 'primary' : 'secondary';
  const newV2 = v2 === 'default' ? 'primary' : 'secondary';
  return `variant={${condition} ? "${newV1}" : "${newV2}"}`;
});

// Remove multiple variants
content = content.replace(/variant="[^"]*"\s*variant="[^"]*"/g, 'variant="primary"');

fs.writeFileSync('src/pages/Agenda.tsx', content);
