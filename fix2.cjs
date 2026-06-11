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
            if (content.startsWith('"')) {
                try {
                    let parsed = eval('(' + content + ')');
                    if (typeof parsed === 'string') {
                        fs.writeFileSync(fullPath, parsed, 'utf8');
                        console.log('Fixed: ' + fullPath);
                    }
                } catch(e) {
                    console.log('Failed to eval: ' + fullPath);
                }
            }
        }
    }
}
fixFiles(process.cwd());
