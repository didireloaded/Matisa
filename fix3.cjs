const fs = require('fs');
const path = require('path');

function fixFiles(dir) {
    if (!fs.existsSync(dir)) return;
    for (const f of fs.readdirSync(dir)) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            if (f !== 'node_modules' && f !== '.git' && f !== '.vite') {
                fixFiles(fullPath);
            }
        } else {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.startsWith('"') && content.includes('\\n')) {
                content = content.replace(/^"/, '').replace(/"$/, '');
                content = content.replace(/\\\\n/g, '\\n').replace(/\\\\"/g, '"');
                content = content.replace(/\\n/g, '\n');
                content = content.replace(/\\"/g, '"');
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Fixed manually: ' + fullPath);
            }
        }
    }
}
fixFiles(process.cwd());
