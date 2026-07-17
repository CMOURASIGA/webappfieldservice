const fs = require('fs');
let content = fs.readFileSync('src/components/ui/Select.tsx', 'utf8');

// Change options to optional
content = content.replace(/options: \{ value: string; label: string \}\[\];/, 'options?: { value: string; label: string }[];');

// Change map
content = content.replace(/\{options\.map\(\(opt\) => \(/, '{children || (options && options.map((opt) => (');
content = content.replace(/<\/option>\n          \)\)\}/, '</option>\n          )))}');

// add children to destructured props
content = content.replace(/\{ className, label, error, options, \.\.\.props \}/, '{ className, label, error, options, children, ...props }');

fs.writeFileSync('src/components/ui/Select.tsx', content);
