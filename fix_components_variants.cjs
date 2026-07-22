const fs = require('fs');

let backButton = fs.readFileSync('src/components/ui/BackButton.tsx', 'utf8');
backButton = backButton.replace(/variant="outline"/g, 'variant="secondary"');
backButton = backButton.replace(/size="icon"/g, 'size="sm" className="p-2 mr-4"');
fs.writeFileSync('src/components/ui/BackButton.tsx', backButton);

let cardFooter = fs.readFileSync('src/components/ui/CardFooterActions.tsx', 'utf8');
cardFooter = cardFooter.replace(/variant="outline"/g, 'variant="secondary"');
cardFooter = cardFooter.replace(/variant="default"/g, 'variant="primary"');
fs.writeFileSync('src/components/ui/CardFooterActions.tsx', cardFooter);

