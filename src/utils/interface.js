import differenceInMilliseconds from 'date-fns/difference_in_milliseconds';
import {
  clearSprites,
  drawPermanentNTSprites,
  drawKeyPresses,
  currKeyPresses,
} from '../draw/drawings';


const KEY_CODES = {
  H: 72,
  Q: 81,
  V: 86,
};


// FIFO queue for delaying chat messages
const messageQueue = [];

/**
 * Enqueues the message in the message queue to be chatted when appropriate.
 * @param {string} message - the message to chat
 */
export function chat(message) {
  messageQueue.push(message);
}


// TagPro keeps you from sending a chat message faster than every
// 500ms. This delay accounts for that plus a 100ms buffer.
const chatDelay = 500 + 100;

// Keep track of the time the last message was sent
let lastMessageTime = 0;

/**
 * Checks if we've waited long enough since the last message was chatted, and
 * if so chats the first thing in the queue if it exists.
 */
export function dequeueChatMessages() {
  const now = new Date();
  const timeDiff = differenceInMilliseconds(now, lastMessageTime);

  if (messageQueue.length && timeDiff > chatDelay) {
    tagpro.socket.emit('chat', {
      message: messageQueue.shift(), // Dequeue the first message
      toAll: 0,
    });
    lastMessageTime = now;
  }
}


let autonomous = true;
export function isAutonomousMode() {
  return autonomous;
}


let visuals = true;
export function isVisualMode() {
  return visuals;
}


export function chatHelpMenu() {
  const menu = [
    '--- Help Menu',
    '--- H: print this help menu',
    '--- Q: toggle autonomous mode',
    '--- V: toggle visuals',
    '---',
  ];
  menu.forEach(item => {
    chat(item);
  });
}


/**
 * Sends key events to move in a list of directions.
 * @param {{x: string, y: string}} directions - directions to move
 * @param {(string|undefined)} directions.x - either 'RIGHT', 'LEFT', or undefined
 * @param {(string|undefined)} directions.y - either 'DOWN', 'UP', or undefined
 */
function press(directions) {
  if (directions.x !== currKeyPresses.x) {
    tagpro.sendKeyPress('left', directions.x !== 'LEFT');
    tagpro.sendKeyPress('right', directions.x !== 'RIGHT');
  }

  if (directions.y !== currKeyPresses.y) {
    tagpro.sendKeyPress('down', directions.y !== 'DOWN');
    tagpro.sendKeyPress('up', directions.y !== 'UP');
  }

  drawKeyPresses(directions); // only updates drawings that need to be updated

  // Update the global key presses state
  currKeyPresses.x = directions.x;
  currKeyPresses.y = directions.y;
}


export function onKeyDown(event) {
  switch (event.keyCode) {
    // Chat the help menu
    case KEY_CODES.H: {
      chatHelpMenu();
      break;
    }
    // If letter pressed is Q, toggle autonomous controls
    case KEY_CODES.Q: {
      autonomous = !autonomous;
      press({ x: null, y: null }); // Release all keys
      const autonomyMode = autonomous ? 'AUTONOMOUS' : 'MANUAL';
      chat(`Autonomy mode updated: now ${autonomyMode}!`);
      break;
    }
    // Toggle visuals
    case KEY_CODES.V: {
      visuals = !visuals;
      const chatMsg = visuals ? 'ENABLED' : 'DISABLED';
      chat(`Visual mode update: now ${chatMsg}!`);
      if (!visuals) {
        clearSprites();
      } else {
        drawPermanentNTSprites();
      }
      break;
    }
    default:
  }
}


/**
 * Sends key events to move to a destination.
 * @param {{x: number, y: number}} destination - object with the position to move to, in pixels,
 *   x and y
 */
export function move(destination) {
  // TODO: address deadband variable with a comment
  const deadband = 4;
  const directions = {};

  if (destination.x > deadband) {
    directions.x = 'RIGHT';
  } else if (destination.x < -deadband) {
    directions.x = 'LEFT';
  }

  if (destination.y > deadband) {
    directions.y = 'DOWN';
  } else if (destination.y < -deadband) {
    directions.y = 'UP';
  }

  press(directions);
}


/**
 * Overriding this function to get a more accurate velocity of players. Velocity is saved in
 *   player.vx and vy. The refresh rate on our access to server size physics is only 4 Hz. We can
 *   check our client-side velocity at a much higher refresh rate (60 Hz), so we use this and store
 *   it in the me object. Units are in meters/second. 1 meter = 2.5 tiles.
 */
export function setupVelocity() {
  Box2D.Dynamics.b2Body.prototype.GetLinearVelocity = function accurateVelocity() {
    tagpro.players[this.player.id].vx = this.m_linearVelocity.x * 55;
    tagpro.players[this.player.id].vy = this.m_linearVelocity.y * 55;
    return this.m_linearVelocity;
  };
}
