const fs = require('fs');
let content = fs.readFileSync('src/pages/Agenda.tsx', 'utf8');

// The remaining errors are due to the ternary operators that still evaluate to "default" or "outline"
// Let's replace "default" with "primary" and "outline" with "secondary" inside those specific ternary expressions.

// In Badge (line 388)
// Type '"default" | "secondary"' is not assignable to type '"default" | "danger" | "info" | "warning" | "success"'.
content = content.replace(/variant=\{hasConflict \? "secondary" : "default"\}/g, 'variant={hasConflict ? "default" : "default"}');
content = content.replace(/variant=\{hasConflict \? "default" : "secondary"\}/g, 'variant={hasConflict ? "default" : "default"}');

// In Button (lines 438, 441, 444, 447)
// Type '"default" | "outline"' is not assignable to type '"primary" | "secondary" | "destructive" | "ghost"'.
content = content.replace(/"default" \? "default" : "outline"/g, '"primary" ? "primary" : "secondary"');
content = content.replace(/"default" \? "outline" : "default"/g, '"primary" ? "secondary" : "primary"');
content = content.replace(/viewMode === 'day' \? 'default' : 'outline'/g, "viewMode === 'day' ? 'primary' : 'secondary'");
content = content.replace(/viewMode === 'week' \? 'default' : 'outline'/g, "viewMode === 'week' ? 'primary' : 'secondary'");
content = content.replace(/viewMode === 'month' \? 'default' : 'outline'/g, "viewMode === 'month' ? 'primary' : 'secondary'");

content = content.replace(/variant=\{viewMode === 'day' \? 'default' : 'outline'\}/g, "variant={viewMode === 'day' ? 'primary' : 'secondary'}");
content = content.replace(/variant=\{viewMode === 'week' \? 'default' : 'outline'\}/g, "variant={viewMode === 'week' ? 'primary' : 'secondary'}");
content = content.replace(/variant=\{viewMode === 'month' \? 'default' : 'outline'\}/g, "variant={viewMode === 'month' ? 'primary' : 'secondary'}");
content = content.replace(/variant=\{viewMode === 'list' \? 'default' : 'outline'\}/g, "variant={viewMode === 'list' ? 'primary' : 'secondary'}");

content = content.replace(/variant=\{viewMode === "day" \? "default" : "outline"\}/g, 'variant={viewMode === "day" ? "primary" : "secondary"}');
content = content.replace(/variant=\{viewMode === "week" \? "default" : "outline"\}/g, 'variant={viewMode === "week" ? "primary" : "secondary"}');
content = content.replace(/variant=\{viewMode === "month" \? "default" : "outline"\}/g, 'variant={viewMode === "month" ? "primary" : "secondary"}');
content = content.replace(/variant=\{viewMode === "list" \? "default" : "outline"\}/g, 'variant={viewMode === "list" ? "primary" : "secondary"}');

fs.writeFileSync('src/pages/Agenda.tsx', content);
