const fs = require('fs');
const path = require('path');

const conversations = [
    'da776925-0691-487c-b04a-8583a9dc2249',
    'ab6125ef-a05d-42dc-8e5e-9501c463b33f',
    '78d60758-0853-45e3-b7d5-51063b758d22',
    'ea8c9a98-302b-4828-b9a1-6492014e1594',
    '1261df28-a9c2-4674-b661-d8f792c02a84',
    '72f6fa51-ebc6-4209-8daf-8cf2edce5931',
    'f39d620e-501a-48c5-8dc2-dde5bf3e5985',
    'f8a3eba5-7dc5-4e5e-b7c2-12031f25e733'
];

const brainDir = 'C:\\\\Users\\\\PC\\\\.gemini\\\\antigravity\\\\brain';
const outputDir = 'C:\\\\Users\\\\PC\\\\Documents\\\\APPS\\\\Matisa';
const files = {};

for (const cid of conversations) {
    const logPath = path.join(brainDir, cid, '.system_generated', 'logs', 'transcript.jsonl');
    if (!fs.existsSync(logPath)) continue;
    
    const lines = fs.readFileSync(logPath, 'utf8').split('\n');
    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            const entry = JSON.parse(line);
            if (entry.tool_calls) {
                for (const call of entry.tool_calls) {
                    const args = call.arguments;
                    if (!args) continue;
                    
                    if (call.name === 'default_api:write_to_file' || call.name === 'write_to_file') {
                        if (args.TargetFile && args.CodeContent) {
                            files[args.TargetFile] = args.CodeContent;
                        }
                    } else if (call.name === 'default_api:replace_file_content' || call.name === 'replace_file_content') {
                        if (args.TargetFile && args.TargetContent && args.ReplacementContent && files[args.TargetFile]) {
                            files[args.TargetFile] = files[args.TargetFile].replace(args.TargetContent, args.ReplacementContent);
                        }
                    } else if (call.name === 'default_api:multi_replace_file_content' || call.name === 'multi_replace_file_content') {
                        if (args.TargetFile && args.ReplacementChunks && files[args.TargetFile]) {
                            let content = files[args.TargetFile];
                            for (const chunk of args.ReplacementChunks) {
                                content = content.replace(chunk.TargetContent, chunk.ReplacementContent);
                            }
                            files[args.TargetFile] = content;
                        }
                    }
                }
            }
        } catch (e) {}
    }
}

for (const [filepath, content] of Object.entries(files)) {
    if (!filepath.toLowerCase().includes('matisa')) continue;
    const relPath = filepath.replace(/\\\\/g, '/').split('Matisa/')[1];
    if (!relPath) continue;
    
    const fullPath = path.join(outputDir, relPath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Recovered: ' + relPath);
}
