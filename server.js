const WebSocket = require('ws');
const { spawn } = require('child_process');

const wss = new WebSocket.Server({ host: '0.0.0.0', port: 8080 });

wss.on('connection', (ws) => {
    console.log('Client connected');

    // Start PowerShell session
    let psSession = spawn('powershell.exe', ['-NoExit', '-Command', '-'], {
        stdio: ['pipe', 'pipe', 'pipe']
    });

    // Send PowerShell output to the WebSocket client (xterm.js)
    psSession.stdout.on('data', (data) => {
        ws.send(data.toString());  // Send raw data to terminal
    });

    psSession.stderr.on('data', (data) => {
        ws.send(`Error: ${data.toString()}`);
    });

    psSession.on('close', () => {
        ws.send('PowerShell session closed');
    });

    // Handle WebSocket input (from xterm.js client)
    ws.on('message', (message) => {
        // Handle backspace character (delete previous character in terminal)
        if (message === '\b') {
            psSession.stdin.write('\x08');  // Send backspace to PowerShell stdin
        } else {
            // Forward the input data to the PowerShell session's stdin
            psSession.stdin.write(message);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        psSession.kill();  // Terminate the PowerShell session when the client disconnects
    });
});

console.log('WebSocket server running on ws://localhost:8080');
