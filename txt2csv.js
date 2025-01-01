const fs = require('fs');

const args = process.argv.slice(2);
let filename;

for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--filename=')) {
        filename = args[i].split('=')[1];
        break;
    } else if (args[i] === '--filename' && args[i + 1]) {
        filename = args[i + 1];
        break;
    }
}

if (!filename) {
    console.error('Error: --filename argument is required');
    process.exit(1);
}

const data = fs.readFileSync(filename, 'utf8');
const lines = data.split('\n');
const season = lines[0].split(': ')[1].trim();
const statistics = /\s+Opp\s+/.test(data) ? 'Opponent' : 'Traditional'

function moveColumn(columns, from, to) {
    const value = columns.splice(from, 1)[0]
    columns.splice(to, 0, value)
}

function removeColumn(columns, from) {
    const value = columns.splice(from, 1)[0]
}

let header = '';
if (statistics === 'Traditional') {
    columns = lines[1].trim().split(/\s+/)
    columns = columns.map(column => column.toUpperCase());
    // Remove WIN% column
    removeColumn(columns, 4);
    header += ',' + columns.join(',');
}
if (statistics === 'Opponent') {
    let columns = [];
    for (let i = 1; i < lines.length; i++) {
        // Stop when reaching the team data
        if (/^\d+\s+/.test(lines[i])) {
            break;
        }
        columns.push(lines[i].trim());
    }
    columns = columns.join(' ').split(/\s+/);
    columns = columns.filter(column => column !== 'Opp');
    columns = columns.map(column => column.toUpperCase());
    // Remove PTS from its position (2nd to last) and insert after Min
    moveColumn(columns, 24, 5);
    header += ',' + columns.join(',');
}
header_reference = ',TEAM,GP,W,L,MIN,PTS,FGM,FGA,FG%,3PM,3PA,3P%,FTM,FTA,FT%,OREB,DREB,REB,AST,TOV,STL,BLK,BLKA,PF,PFD,+/-'
if (header !== header_reference) {
    console.log(`The extracted header\n${header}\ndiffers from the expected one\n${header_reference}`);
    process.exit(1);
}
let output = `Season,Statistics${header}`

if (statistics === 'Traditional') {
    function processTeamData(index) {
        const teamName = lines[index + 1].trim();
        const stats = lines[index + 2].trim().split(/\s+/);
        // Remove WIN% column
        removeColumn(stats, 3);
        output += `\n${season},${statistics},${teamName},${stats.join(',')}`;
    }
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('Logo')) {
            processTeamData(i);
        }
    }
}

if (statistics === 'Opponent') {
    function processOpponentTeamData(index) {
        const teamData = lines[index].trim().split(/\s+/);
        const teamName = teamData.slice(1, -25).join(' ');
        const stats = teamData.slice(-25);
        // Remove PTS from its position (2nd to last) and insert after Min
        moveColumn(stats, 23, 4);
        output += `\n${season},${statistics},${teamName},${stats.join(',')}`;
    }
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/^\d+\s+/)) {
            processOpponentTeamData(i);
        }
    }
}

console.log(output);
