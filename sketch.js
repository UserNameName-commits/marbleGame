// --- Global Variables (p5.js equivalents) ---
let originalMarbles;        // Stores the initial set of marble colors (e.g., "Red", "Blue") for the current game
let currentMarblesInBag;    // Represents marbles currently in the bag (colors) for the current game

let bagImage;               // Image for the bag icon (optional, can be removed)

// Game State Variables
let currentGameState = "MENU"; // States: "MENU", "GAME1_NO_REPLACEMENT", "GAME2_WITH_REPLACEMENT", "GAME_OVER"
let withReplacementMode = false; // Determined by the current game setup
let drawsMade;
let redMarblesPulled;
let maxDraws;               // Max draws allowed for the current game
let minRedToWin;            // Min red marbles needed to win
let maxRedToWin;            // Max red marbles needed to win (for range wins)
let gameOutcomeMessage = ""; // Message displayed at game end

// UI Element properties (coordinates, dimensions)
let bagX = 200;
let bagY = 150;
let bagWidth = 150;
let bagHeight = 150;

let pulledMarbleDisplayX = 450;
let pulledMarbleDisplayY = 150;
let pulledMarbleDisplaySize = 80;

let buttonWidth = 180; // Wider buttons for game selection
let buttonHeight = 40;

// Button positions
let game1ButtonX = 50;
let game1ButtonY = 100;
let game2ButtonX = 50;
let game2ButtonY = 150;
let pullButtonX = 50;
let pullButtonY = 300;
let playAgainButtonX = 500;
let playAgainButtonY = 350;

// Labels
let bagStatusText = "Marbles in bag: "; // This will hold the complete string
let pulledMarbleStatusText = "Pulled: ---";
let pulledMarbleColor = "None";


// --- preload() function: Loads assets before setup() ---
function preload() {
  // Load bag image (optional)
  // Make sure bag_icon.png is in the same directory as index.html
  bagImage = loadImage("bag_icon.png", 
                       // Success callback
                       () => console.log("bag_icon.png loaded successfully!"),
                       // Error callback
                       (err) => {
                         console.log("Warning: Could not load bag_icon.png. Using a simple rectangle for the bag.");
                         console.error("Error loading image:", err);
                         bagImage = null; // Ensure bagImage is null on failure
                       });
}

// --- setup() function: Runs once when the sketch starts ---
function setup() {
  createCanvas(700, 400); // Set window size (width, height)
  // In p5.js, canvas is automatically added to the HTML body.
  // We don't call resetBag() or resetGame() here, as we start in "MENU" state.
} // End of setup() function

// --- draw() function: Runs continuously ---
function draw() {
  background(200, 220, 255); // Light blue background

  if (currentGameState === "MENU") {
    drawMenuScreen();
  } else if (currentGameState === "GAME1_NO_REPLACEMENT" || currentGameState === "GAME2_WITH_REPLACEMENT") {
    drawGameScreen();
  } else if (currentGameState === "GAME_OVER") {
    drawGameOverScreen();
  }
} // End of draw() function

// --- mousePressed() function: Called when a mouse button is pressed ---
function mousePressed() {
  // Check if mouse is within canvas boundaries before processing clicks
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    if (currentGameState === "MENU") {
      if (isMouseOver(game1ButtonX, game1ButtonY, buttonWidth, buttonHeight)) {
        setupGame1NoReplacement();
      } else if (isMouseOver(game2ButtonX, game2ButtonY, buttonWidth, buttonHeight)) {
        setupGame2WithReplacement();
      }
    } else if (currentGameState === "GAME1_NO_REPLACEMENT" || currentGameState === "GAME2_WITH_REPLACEMENT") {
      if (isMouseOver(pullButtonX, pullButtonY, buttonWidth, buttonHeight)) {
        pullMarble();
        checkGameEndCondition(); // Check if game ends after each pull
      }
    } else if (currentGameState === "GAME_OVER") {
      if (isMouseOver(playAgainButtonX, playAgainButtonY, buttonWidth, buttonHeight)) {
        currentGameState = "MENU"; // Go back to menu to choose game
        gameOutcomeMessage = ""; // Clear message
      }
    }
  }
} // End of mousePressed() function

// --- Game Setup Functions ---

function setupGame1NoReplacement() {
  currentGameState = "GAME1_NO_REPLACEMENT";
  withReplacementMode = false;
  maxDraws = 5;
  minRedToWin = 2;
  maxRedToWin = 5; // To allow for "at least 2" up to max draws

  // Game 1: 6 red, 19 blue (Total 25 marbles)
  originalMarbles = [];
  for (let i = 0; i < 6; i++) originalMarbles.push("Red");
  for (let i = 0; i < 19; i++) originalMarbles.push("Blue"); // 25 - 6 = 19 blue
  console.log("Setting up Game 1: " + originalMarbles.length + " total marbles (6 Red, 19 Blue).");

  resetGame();
}

function setupGame2WithReplacement() {
  currentGameState = "GAME2_WITH_REPLACEMENT";
  withReplacementMode = true;
  maxDraws = 10;
  minRedToWin = 3;
  maxRedToWin = 8;

  // Game 2: 12 red, 18 blue (Total 30 marbles)
  originalMarbles = [];
  for (let i = 0; i < 12; i++) originalMarbles.push("Red");
  for (let i = 0; i < 18; i++) originalMarbles.push("Blue"); // 30 - 12 = 18 blue
  console.log("Setting up Game 2: " + originalMarbles.length + " total marbles (12 Red, 18 Blue).");

  resetGame();
}

// --- Game State Management ---

function resetGame() {
  drawsMade = 0;
  redMarblesPulled = 0;
  resetBag(); // This populates currentMarblesInBag
  gameOutcomeMessage = ""; // Clear any previous outcome message
  pulledMarbleColor = "None"; // Reset pulled marble display
  pulledMarbleStatusText = "Pulled: ---";
  console.log("Game reset. Starting " + currentGameState);
  console.log("DEBUG (resetGame): originalMarbles size = " + originalMarbles.length);
  console.log("DEBUG (resetGame): currentMarblesInBag size = " + currentMarblesInBag.length);
  updateUI(); // Refresh UI
}

function checkGameEndCondition() {
  if (drawsMade >= maxDraws) {
    currentGameState = "GAME_OVER";
    let won = (redMarblesPulled >= minRedToWin && redMarblesPulled <= maxRedToWin);

    if (won) {
      gameOutcomeMessage = "YOU WIN! You pulled " + redMarblesPulled + " red marbles.";
    } else {
      gameOutcomeMessage = "YOU LOSE! You pulled " + redMarblesPulled + " red marbles.";

      // Determine the specific losing message based on win conditions
      if (minRedToWin === maxRedToWin) { // Exact number win condition
          gameOutcomeMessage += " (Needed exactly " + minRedToWin + ")";
      } else if (maxRedToWin >= maxDraws && minRedToWin > 0) { // "At least" win condition (like Game 1: at least 2, up to 5 draws)
          gameOutcomeMessage += " (Needed at least " + minRedToWin + ")";
      } else if (minRedToWin > 0 && maxRedToWin < maxDraws) { // "Between" win condition (like Game 2: between 3 and 8)
          gameOutcomeMessage += " (Needed between " + minRedToWin + " and " + maxRedToWin + ")";
      } else { // Generic lose message if other conditions don't apply
          gameOutcomeMessage += " (Did not meet win condition)";
      }
    }
  } else if (!withReplacementMode && currentMarblesInBag.length === 0) {
      // For "without replacement", game might end early if bag is empty
      currentGameState = "GAME_OVER";
      gameOutcomeMessage = "BAG EMPTY! You ran out of marbles. Pulled " + redMarblesPulled + " red marbles.";
      // Check win/loss based on current red count if bag emptied before max draws
      if (redMarblesPulled >= minRedToWin && redMarblesPulled <= maxRedToWin) {
        gameOutcomeMessage += "\n(You still won based on your draws!)";
      } else {
        gameOutcomeMessage += "\n(You lost based on your draws.)";
      }
  }
}

// --- Drawing Screens ---

function drawMenuScreen() {
  fill(0);
  textSize(24);
  textAlign(CENTER, CENTER);
  text("Choose Your Game!", width / 2, 50);

  drawButton(game1ButtonX, game1ButtonY, buttonWidth, buttonHeight, "Game 1: No Replacement (5 draws)");
  drawButton(game2ButtonX, game2ButtonY, buttonWidth, buttonHeight, "Game 2: With Replacement (10 draws)");
}

function drawGameScreen() {
  // Draw the bag icon or a simple rectangle for the bag
  if (bagImage !== null) {
    image(bagImage, bagX - bagWidth / 2, bagY - bagHeight / 2, bagWidth, bagHeight);
  } else {
    fill(100); stroke(0); rectMode(CENTER); rect(bagX, bagY, bagWidth, bagHeight, 10);
  }

  // Draw bag status text
  fill(0); textSize(18); textAlign(CENTER, CENTER);
  text(bagStatusText, bagX, bagY + bagHeight / 2 + 20); // Correct: bagStatusText already contains the number

  // Draw "Pulled Marble" section
  textAlign(CENTER, TOP);
  text("Last Pulled:", pulledMarbleDisplayX, pulledMarbleDisplayY - pulledMarbleDisplaySize / 2 - 30);
  drawMarbleCircle(pulledMarbleColor, pulledMarbleDisplayX, pulledMarbleDisplayY, pulledMarbleDisplaySize);
  text(pulledMarbleStatusText, pulledMarbleDisplayX, pulledMarbleDisplayY + pulledMarbleDisplaySize / 2 + 5);

  // Draw game specific info
  fill(0); textSize(20); textAlign(LEFT, TOP);
  text("Draws: " + drawsMade + " / " + maxDraws, 50, 250);
  text("Red Marbles: " + redMarblesPulled, 50, 275);

  // Draw Pull Button (and handle its disabled state)
  drawButton(pullButtonX, pullButtonY, buttonWidth, buttonHeight, "Pull Marble");
}

function drawGameOverScreen() {
  fill(0);
  textSize(28);
  textAlign(CENTER, CENTER);
  text("GAME OVER!", width / 2, 100);

  textSize(22);
  text(gameOutcomeMessage, width / 2, 200);

  drawButton(playAgainButtonX, playAgainButtonY, buttonWidth, buttonHeight, "Play Again!");
}

// --- Core Simulation Logic ---

/**
 * Handles the logic for pulling a marble from the bag.
 * Updates the UI to show the pulled marble and bag status.
 */
function pullMarble() {
  // If the bag is empty and we are in "without replacement" mode, disable pulling.
  // The button's draw logic also handles visual disabling.
  if (drawsMade >= maxDraws || (!withReplacementMode && currentMarblesInBag.length === 0)) {
    return; // Do nothing if pulling is disabled for game reasons
  }

  // If in "with replacement" mode, and currentMarblesInBag is empty,
  // but originalMarbles *does* have items, we should re-populate currentMarblesInBag.
  // This can happen if the bag was emptied in a previous "without replacement" game
  // and then switched to "with replacement" without a full reset.
  if (currentMarblesInBag.length === 0 && withReplacementMode && originalMarbles.length > 0) {
      resetBag(); // Repopulate for with-replacement if somehow emptied
  }

  // Also check if originalMarbles is empty at the very start of a pull attempt,
  // which implies a fundamental problem with the game setup.
  if (originalMarbles.length === 0) {
      pulledMarbleStatusText = "ERROR: Original bag is empty!";
      pulledMarbleColor = "Empty";
      console.log("ERROR: Original bag of marbles is empty. Cannot pull any more.");
      return;
  }

  let randomIndex = floor(random(currentMarblesInBag.length)); // p5.js random
  let pulledMarble;

  if (withReplacementMode) {
    pulledMarble = currentMarblesInBag[randomIndex]; // Get marble, but don't remove
    pulledMarbleColor = pulledMarble; // Store the color string
    pulledMarbleStatusText = "Pulled: " + pulledMarbleColor + " (replaced)";
  } else {
    pulpledMarble = currentMarblesInBag.splice(randomIndex, 1)[0]; // Get and remove marble
    pulledMarbleColor = pulledMarble; // Store the color string
    pulledMarbleStatusText = "Pulled: " + pulledMarbleColor + " (not replaced)";
  }

  console.log("Pulled a " + pulledMarbleColor + " marble.");
  drawsMade++;
  if (pulledMarbleColor === "Red") {
    redMarblesPulled++;
  }

  updateUI(); // Refresh the UI
}

/**
 * Resets the current marbles in the bag to the original set.
 * Useful when switching modes or starting a new simulation.
 */
function resetBag() {
  // Create a new mutable copy using spread operator
  currentMarblesInBag = [...originalMarbles];
  // Randomly shuffle the marbles when the bag is reset
  // Fisher-Yates (Knuth) shuffle in JavaScript
  for (let i = currentMarblesInBag.length - 1; i > 0; i--) {
    const j = floor(random(i + 1)); // p5.js random
    [currentMarblesInBag[i], currentMarblesInBag[j]] = [currentMarblesInBag[j], currentMarblesInBag[i]]; // ES6 swap
  }
  pulledMarbleColor = "None"; // Reset the pulled marble display
  pulledMarbleStatusText = "Pulled: ---";
  console.log("Bag reset. Marbles: " + currentMarblesInBag.length);
}

/**
 * Updates the UI elements (labels, button state) based on the current state.
 */
function updateUI() {
  // This line is responsible for building the correct string for display
  bagStatusText = "Marbles in bag: " + currentMarblesInBag.length;
  // The drawButton function already handles the button's disabled state based on current game logic
}

// --- Drawing Helper Functions ---

/**
 * Draws a button on the screen.
 * @param {number} x X-coordinate of the button's top-left corner.
 * @param {number} y Y-coordinate of the button's top-left corner.
 * @param {number} w Width of the button.
 * @param {number} h Height of the button.
 * @param {string} label Text to display on the button.
 */
function drawButton(x, y, w, h, label) {
  let isDisabled = false;
  if (currentGameState === "GAME1_NO_REPLACEMENT" || currentGameState === "GAME2_WITH_REPLACEMENT") {
    // Disable pull button if max draws reached or bag is empty (for no replacement)
    isDisabled = (drawsMade >= maxDraws || (!withReplacementMode && currentMarblesInBag.length === 0));
  } // Menu and Play Again buttons are generally not disabled

  if (isMouseOver(x, y, w, h) && !isDisabled) {
    fill(80, 180, 255); // Lighter blue on hover
  } else if (isDisabled) {
    fill(150); // Greyed out if disabled
  } else {
    fill(50, 150, 255); // Default blue
  }
  stroke(0);
  rectMode(CORNER);
  rect(x, y, w, h, 7);

  fill(255);
  textSize(16);
  textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + h / 2);
}

/**
 * Draws a colored circle representing a marble.
 * @param {string} colorName The name of the marble color (e.g., "Red", "Blue", "None", "Empty").
 * @param {number} centerX The X-coordinate of the circle's center.
 * @param {number} centerY The Y-coordinate of the circle's center.
 * @param {number} diameter The diameter of the circle.
 */
function drawMarbleCircle(colorName, centerX, centerY, diameter) {
  noStroke();

  if (colorName.toLowerCase() === "red") {
    fill(255, 0, 0);
  } else if (colorName.toLowerCase() === "blue") {
    fill(0, 0, 255);
  } else {
    fill(220);
    stroke(100);
    strokeWeight(1);
  }

  ellipseMode(CENTER);
  ellipse(centerX, centerY, diameter, diameter);

  if (colorName.toLowerCase() === "red" || colorName.toLowerCase() === "blue") {
    fill(255, 255, 255, 80);
    ellipse(centerX - diameter * 0.15, centerY - diameter * 0.15, diameter * 0.4, diameter * 0.4);
  }
}

/**
 * Checks if the mouse cursor is over a rectangular area.
 * @param {number} x X-coordinate of the area's top-left corner.
 * @param {number} y Y-coordinate of the area's top-left corner.
 * @param {number} w Width of the area.
 * @param {number} h Height of the area.
 * @return {boolean} True if the mouse is over the area, false otherwise.
 */
function isMouseOver(x, y, w, h) {
  return mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
}