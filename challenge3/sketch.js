let player;
let fishes = [];
let bubbles = [];
const numFish = 25;
const numBubbles = 50;

let gameState = "playing";
let gameScore = 0;

let seaColor;

// Calculate linear interpolation (lerp) between two angles (in radians) by always choosing the shortest path around the circle.
function lerpAngle(startAngle, endAngle, amount) {
    let difference = endAngle - startAngle;

    // If the path is longer than 180° (PI radians) in one direction...
    if (difference > PI) {
        // ...go the other way around.
        endAngle -= TWO_PI;
    } else if (difference < -PI) {
        endAngle += TWO_PI;
    }
    return lerp(startAngle, endAngle, amount);
}

// The class for the fish controlled by the player
class Player {
    constructor() {
        this.pos = createVector(width / 2, height / 2);
        this.size = 50;
        this.targetSize = this.size; // To allow growth animation
        this.angle = 0;
    }

    update() {
        // Smoothly move towards the mouse position
        let target = createVector(mouseX, mouseY);
        this.pos.lerp(target, 0.04);

        // Smoothly turn to face the direction of movement
        let targetAngle = atan2(mouseY - this.pos.y, mouseX - this.pos.x);
        this.angle = lerpAngle(this.angle, targetAngle, 0.1);

        // Animate size change
        this.size = lerp(this.size, this.targetSize, 0.1);

        // Player slowly shrinks (metabolism)
        let shrinkage = this.size * 0.0005; // Multiplied by this.size so bigger fish shrink faster
        
        // Don't shrink below the starting size
        if (this.targetSize > 50) {
             this.targetSize -= shrinkage;
        }
    }

    // Increase the size when eating
    grow(amount) {
        //this.size += amount;
        this.targetSize += amount;
    }

    // Draw the fish
    display() {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.angle);

        // Fish Body
        noStroke();
        fill(25, 85, 95); // Orange
        ellipse(0, 0, this.size, this.size * 0.65);
        
        // Fish tail
        beginShape();
        vertex(-this.size * 0.45, 0); // Connects closer to body
        quadraticVertex(-this.size * 0.65, -this.size * 0.2, -this.size * 0.6, -this.size * 0.3); // Top curve
        quadraticVertex(-this.size * 0.8, 0, -this.size * 0.6, this.size * 0.3); // Tip and bottom curve
        quadraticVertex(-this.size * 0.65, this.size * 0.2, -this.size * 0.45, 0); // Bottom connect
        endShape(CLOSE);
        
        /*// Fish Tail
        let tailSize = this.size * 0.4;
        triangle(
            -this.size * 0.5,
            0,
            -this.size * 0.7,
            -tailSize,
            -this.size * 0.7,
            tailSize
        );*/

        // Eye
        fill(255);
        ellipse(this.size * 0.3, 0, this.size * 0.15, this.size * 0.15);
        fill(0);
        ellipse(this.size * 0.32, 0, this.size * 0.08, this.size * 0.08);

        pop();
    }
}

// The class for the other fish (NPCs)
class Fish {
    constructor() {
        this.size = random(20, player.size * 2 + 20); // Fish can be various sizes
        this.speed = random(1, 3);

        // Start fish off-screen
        let startOnLeft = random() > 0.5;

        if (startOnLeft) {
            this.pos = createVector(-this.size * random(1, 10), random(height));
            this.vel = createVector(this.speed, 0);
        } else {
            this.pos = createVector(
                width + this.size * random(1, 10),
                random(height)
            );
            this.vel = createVector(-this.speed, 0);
        }

        this.hue = random(360);
        this.baseColor = color(this.hue, 70, 85);

        // Fish eaten animation
        this.isBeingEaten = false;
        this.eatenTimer = 1.0; // 1.0 = 100%, 0.0 = 0%

        // Property for fluid glow
        this.glowAmount = 0.0;
        this.targetGlowAmount = 0.0;

        // Unique offset for Perlin noise (ensures each fish has a different swim pattern)
        this.yNoiseOffset = random(1000);
    }

    update() {
        // Only move if not being eaten
        if (this.isBeingEaten) {
            this.eatenTimer -= 0.08; // Animate shrinking/fading
        } else {
            // Horizontal movement
            this.pos.add(this.vel);

            // ** Add natural drift **
            let noiseValue = noise(this.yNoiseOffset);

            // Map to a range [-1 to 1] to get a direction
            let yDrift = map(noiseValue, 0, 1, -1, 1);

            // Apply drift
            this.pos.y += yDrift * 1;   // Wiggle stronger/weaker (Amplitude)
            this.yNoiseOffset += 0.01;  // Wiggle faster/slower (Frequency)
            
            // Keep fish from drifting off the top/bottom
            this.pos.y = constrain(this.pos.y, this.size / 2, height - this.size / 2);

            // Glow if smaller than player
            if (this.size < player.size) {
                this.targetGlowAmount = 1.0;
            } else {
                this.targetGlowAmount = 0.0;
            }
        }

        this.glowAmount = lerp(this.glowAmount, this.targetGlowAmount, 0.2);
    }

    // Check if the fish is off the screen
    isOffscreen() {
        return (
            (this.vel.x > 0 && this.pos.x > width + this.size * 2) ||
            (this.vel.x < 0 && this.pos.x < -this.size * 2)
        );
    }

    display() {
        push();
        translate(this.pos.x, this.pos.y);

        if (this.isBeingEaten) {
            scale(this.eatenTimer);
        }

        // Flip fish sprite based on direction
        if (this.vel.x < 0) {
            scale(-1, 1);
        }

        /*
        if (this.size > player.size && !this.isBeingEaten) {
            // Danger border
            noStroke();
            fill(0, 80, 100, 0.4); // Semi-transparent red glow
            ellipse(0, 0, this.size * 1.1, this.size * 0.6 * 1.1); 

            // Danger glow
            drawingContext.shadowBlur = this.size * 0.4; // Glow size
            drawingContext.shadowColor = color(this.baseColor, 0.7);
        }*/

        // Edible glow
        if (player.size > this.size && !this.isBeingEaten) {
            let maxBlur = this.size * 0.4;
            let maxOpacity = 0.7;

            drawingContext.shadowBlur = maxBlur * this.glowAmount;
            drawingContext.shadowColor = color(this.baseColor, maxOpacity * this.glowAmount);
        }

        // Body
        if (this.isBeingEaten) {
            fill(this.hue, 70, 85, this.eatenTimer);
        } else {
            fill(this.hue, 70, 85);
        }
        noStroke();
        ellipse(0, 0, this.size, this.size * 0.6);

        // Tail
        beginShape();
        vertex(-this.size * 0.45, 0);
        quadraticVertex(-this.size * 0.65, -this.size * 0.2, -this.size * 0.6, -this.size * 0.3);
        quadraticVertex(-this.size * 0.8, 0, -this.size * 0.6, this.size * 0.3);
        quadraticVertex(-this.size * 0.65, this.size * 0.2, -this.size * 0.45, 0);
        endShape(CLOSE);

        drawingContext.shadowBlur = 0;  // Reset

        // Eye
        if (this.isBeingEaten) {
            fill(0, this.eatenTimer); // Fade out eye
        } else {
            fill(0);
        }
        ellipse(this.size * 0.3, 0, this.size * 0.1, this.size * 0.1);

        pop();
    }
}

// The class for background bubbles
class Bubble {
    constructor() {
        // Multiply by 1.25 to start the bubbles lower so they appear more naturally rather than all at once
        this.pos = createVector(random(width), height * 1.25 + random(100));
        this.size = random(5, 25);
        this.speed = random(1, 3);
    }

    update() {
        this.pos.y -= this.speed;
        // Add a sine wave wiggle for more natural movement
        this.pos.x += sin(frameCount * 0.05 + this.pos.y * 0.1) * 0.5;

        // Reset bubble when it goes off the top of the screen
        if (this.pos.y < -this.size) {
            this.pos.x = random(width);
            this.pos.y = height + this.size;
        }
    }

    display() {
        noStroke();
        fill("#ffffff26");
        ellipse(this.pos.x, this.pos.y, this.size, this.size);
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100, 1);
    noCursor();

    seaColor = color("#ecfeff");

    // Initialize the player and arrays
    player = new Player();
    for (let i = 0; i < numFish; i++) fishes.push(new Fish());
    for (let i = 0; i < numBubbles; i++) bubbles.push(new Bubble());
}

function draw() {
    //background(seaColor);

    // Draw the underwater background gradient
    let topColor = color(210, 80, 50);
    let bottomColor = color(220, 90, 20);
    for (let y = 0; y < height; y++) {
        let inter = map(y, 0, height, 0, 1);
        let c = lerpColor(topColor, bottomColor, inter);
        stroke(c);
        line(0, y, width, y);
    }

    // Handle game state
    if (gameState === "playing") {
        runGame();
    } else if (gameState === "gameOver") {
        showGameOver();
    }
}

function runGame() {
    // Update and display bubbles
    for (let bubble of bubbles) {
        bubble.update();
        bubble.display();
    }

    // Update and display player
    player.update();
    player.display();

    // Iterate backwards to safely remove items from the array
    for (let i = fishes.length - 1; i >= 0; i--) {
        let fish = fishes[i];
        fish.update();
        fish.display();

        // Check for collision
        let d = dist(
            player.pos.x,
            player.pos.y,
            fish.pos.x,
            fish.pos.y
        );
        // Make the "hitbox" slightly smaller (e.g., 80%) than the visible sprite
        let collisionThreshold = (player.size / 2 + fish.size / 2) * 0.8;

        // Only check for collisions if the fish isn't already being eaten
        if (d < collisionThreshold && !fish.isBeingEaten) {
            if (player.size > fish.size) {
                // Check !fish.isBeingEaten to trigger grow() only once
                if (!fish.isBeingEaten) {
                    let earnedScore = fish.size * 0.1;
                    
                    player.grow(earnedScore);
                    fish.isBeingEaten = true; 

                    gameScore += earnedScore;
                }
            } else {
                // Game over if you touch a bigger fish
                gameState = "gameOver";
            }
        }

        // Replace fish that swim off-screen
        if (fish.isOffscreen() || (fish.isBeingEaten && fish.eatenTimer <= 0)) {
            fishes.splice(i, 1);
        }
    }

    // Ensure population always refills
    while (fishes.length < numFish) {
        fishes.push(new Fish());
    }

    // Create a single array for all fish (NPCs + Player) to be drawn
    let allFishToDraw = [...fishes, player];
    
    // Sort fishes by size (smallest to largest)
    allFishToDraw.sort((a, b) => a.size - b.size);
    
    // Draw all fish in sorted order
    // This makes the largest fish always appear "in front"
    for (let fish of allFishToDraw) {
        fish.display();
    }

    // Display score
    fill(255);
    textSize(24);
    textAlign(LEFT, TOP);
    text("Score: " + floor(gameScore), 20, 20);
    textSize(18);
    text("Current size: " + floor(player.size), 20, 50);
}

function showGameOver() {
    // Dark overlay
    background(0, 0, 0, 0.5);

    // Game over text
    textAlign(CENTER, CENTER);
    fill(0, 0, 100);
    textSize(64);
    textStyle(BOLD);
    text("GAME OVER!", width / 2, height / 2 - 40);
    textSize(32);
    textStyle(NORMAL);
    text("Your score: " + floor(gameScore), width / 2, height / 2 + 30);
    textSize(20);
    textStyle(ITALIC);
    text("Click to Restart", width / 2, height / 2 + 160);
}

function mousePressed() {
    // Restart the game on click if it's over
    if (gameState === "gameOver") {
        player = new Player();
        fishes = [];
        for (let i = 0; i < numFish; i++) {
            fishes.push(new Fish());
        }
        gameState = "playing";
        gameScore = 0;
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
