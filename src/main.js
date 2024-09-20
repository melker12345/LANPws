import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const term = new Terminal({
  cursorBlink: true,  // Enable blinking cursor for better user experience
  fontFamily: '"Courier New", monospace',
  fontSize: 18,
  theme: {
    background: '#000',
    foreground: '#fff'
  }
});

// Load the fit add-on
const fitAddon = new FitAddon();
term.loadAddon(fitAddon);

const ws = new WebSocket('ws://localhost:8080');  // Connect to WebSocket server

// Attach the terminal to the DOM
term.open(document.getElementById('terminal'));

// Fit the terminal to the container
fitAddon.fit();

// Adjust the terminal size on window resize
window.addEventListener('resize', () => fitAddon.fit());

// Buffer to store command input
let commandBuffer = "";

// Handle terminal input
term.onData(data => {
  if (data === '\r') {
    // When Enter is pressed, send the current buffer to the WebSocket
    ws.send(commandBuffer + '\r');
    term.write('\r\n');  // Move to a new line in the terminal
    commandBuffer = "";  // Clear the buffer after sending the command
  } else if (data === '\u007F') {  // Handle Backspace (ASCII 127)
    if (commandBuffer.length > 0) {
      // Remove the last character from the buffer
      commandBuffer = commandBuffer.slice(0, -1);
      // Move cursor back and erase the last character in the terminal
      term.write('\b \b');
    }
  } else {
    // Add the typed character to the buffer
    commandBuffer += data;
    // Echo the character in the terminal (only display it, don't send it yet)
    term.write(data);
  }
});

// Receive output from the WebSocket server and display it in the terminal
ws.onmessage = (event) => {
  term.write(event.data);  // Write server response to terminal
};

ws.onopen = () => {
  term.write('Connected to PowerShell Web Terminal...\r\n');  // Connection success message
};

ws.onerror = (error) => {
  term.write(`WebSocket error: ${error}\r\n`);  // Handle WebSocket errors
};

ws.onclose = () => {
  term.write('Connection closed...\r\n');  // Handle WebSocket disconnection
};
