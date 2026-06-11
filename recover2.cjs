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
    if (!fs.existsSync(logPath)) {
        console.log('Not found: ' + logPath);
        continue;
    }
    
    console.log('Processing: ' + cid);
    const lines = fs.readFileSync(logPath, 'utf8').split('\n');
    let errCount = 0;
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
                            console.log('Found write: ' + args.TargetFile);
                        }
                    } else if (call.name === 'default_api:replace_file_content' || call.name === 'replace_file_content') {
                        if (args.TargetFile && args.TargetContent && args.ReplacementContent && files[args.TargetFile]) {
                            files[args.TargetFile] = files[args.TargetFile].replace(args.TargetContent, args.ReplacementContent);
                            console.log('Found replace: ' + args.TargetFile);
                        }
                    }
                }
            }
        } catch (e) {
            errCount++;
        }
    }
    console.log('Errors: ' + errCount);
}

console.log('Total files found: ' + Object.keys(files).length);
