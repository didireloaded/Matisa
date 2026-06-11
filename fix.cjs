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
            if (content.startsWith('"') && content.endsWith('"')) {
                try {
                    let parsed = JSON.parse(content);
                    if (typeof parsed === 'string') {
                        fs.writeFileSync(fullPath, parsed, 'utf8');
                        console.log('Fixed: ' + fullPath);
                    }
                } catch(e) {
                    console.log('Failed to parse: ' + fullPath);
                }
            }
        }
    }
}
fixFiles(process.cwd());
