let xMax = visualViewport.width;
let yMax = visualViewport.height;
let flowerPositions = [];
let mousePressStart = null;
let lastFlowerTime = 0;
let cursorImg = [];
let currentCursor = 0;
let waterImg;
let waterVisible = false;

function preload() {
    cursorImg[0] = loadImage("assets/cursor1.png");
    cursorImg[1] = loadImage("assets/cursor2.png");
    waterImg = loadImage("assets/water.gif");
}

function setup() {
    createCanvas(xMax, yMax);
    noCursor();
    imageMode(CENTER);
    waterImg.pause();
}

function draw() {
    background("#87cdebff");
    noStroke();
    rectMode(CENTER);

    // nuvole in movimento
    fill("#c5e9faff");

    // differenti altezze
    let cloudY1 = yMax / 8;
    let cloudY2 = yMax / 3;
    let cloudY3 = yMax / 4;

    // differenti velocità
    let cloudX1 = (frameCount * 0.5) % (xMax + 200) - 100;
    let cloudX2 = (frameCount * 0.3 + 200) % (xMax + 200) - 100;
    let cloudX3 = (frameCount * 0.4 + 400) % (xMax + 200) - 100;

    ellipse(cloudX1, cloudY1, 100, 45);
    ellipse(cloudX1 + 30, cloudY1 + 35, 150, 45);
    ellipse(cloudX1 - 30, cloudY1 + 30, 140, 45);

    ellipse(cloudX2, cloudY2, 100, 50);
    ellipse(cloudX2 + 30, cloudY2 + 30, 140, 50);
    ellipse(cloudX2 - 30, cloudY2 + 35, 120, 50);

    ellipse(cloudX3, cloudY3, 90, 30);
    ellipse(cloudX3 + 30, cloudY3 + 25, 80, 30);
    ellipse(cloudX3 - 30, cloudY3 + 20, 90, 30);

    // prato
    let groundHeight = yMax / 4;

    fill("#61a13bff");
    ellipse(xMax/2, yMax - groundHeight / 2, xMax * 2, groundHeight * 2);

    /*// fiore al centro
    let flowerX = width / 2;
    let flowerY = height / 2 + 100;

    fill("#116e11ff");
    rect(flowerX, flowerY + 25, 15, 150);

    // petali che oscillano (ease in-out)
    fill("#ffee00ff");

    let oscillation = sin(frameCount * 0.03) * PI / 8;

    for (let angle = 0; angle < 360; angle += 45)
    {
        push();
        translate(flowerX, flowerY - 50);
        rotate(radians(angle) + oscillation);
        ellipse(0, 35, 30, 70);
        pop();
    }

    fill("#634c4cff");
    circle(flowerX, flowerY - 50, 50);

    fill("#116e11ff");
    push();
    translate(flowerX - 15, flowerY + 70);
    rotate(oscillation);
    ellipse(0, 0, 40, 20);
    pop();
    
    push();
    translate(flowerX + 15, flowerY + 40);
    rotate(-oscillation);
    ellipse(0, 0, 40, 20);
    pop();*/

    /*text("X: " + mouseX + " Y: " + mouseY, 10, 50);
    fill(255, 0, 0, 100);
    circle(mouseX, mouseY, 150);*/

    if (mouseIsPressed && mousePressStart && millis() - mousePressStart > 750) {
        // genera un fiore ogni 1200 ms circa
        if (millis() - lastFlowerTime > 1500) {
            let groundHeight = yMax / 4;

            // confini del prato
            let minX = 50;
            let maxX = xMax - 50;
            /*let minY = yMax - groundHeight / 1.5;
            let maxY = yMax - groundHeight * 1.5;*/
            let minY = yMax - groundHeight * 1.5;
            let maxY = yMax;

            // posizione orizzontale del fiore basata sulla posizione del mouse
            let flowerX = mouseX;

            // posizione verticale casuale del fiore
            let flowerY = random(minY, maxY);

            /*// Posizione random attorno al mouse, ma limitata ai confini del prato
            let flowerX = constrain(mouseX + random(-50, 50), minX, maxX);
            let flowerY = constrain(mouseY + random(-50, 50), minY, maxY);*/

            // salva il tempo di nascita del fiore
            let bornTime = millis();

            // colore casuale del fiore
            let petalColor = color(random(255), random(255), random(255));
            
            flowerPositions.push({x: flowerX, y: flowerY, color: petalColor, bornTime: bornTime});
            lastFlowerTime = millis();
        }
    }

    // Ordina i fiori per Y crescente (dal più alto al più basso)
    let sortedFlowers = flowerPositions.slice().sort((a, b) => a.y - b.y);

    // Modifica il ciclo di disegno dei fiori:
    for (let pos of sortedFlowers) {
        // Calcola il fattore di scala (da 0 a 1 nei primi 500 ms)
        let scaleFactor = constrain((millis() - pos.bornTime) / 500, 0, 1);
        drawFlower(pos.x, pos.y, pos.color, scaleFactor);
    }

    if (!waterVisible) tint(255, 0);
    else tint(255, 255);

    image(waterImg, mouseX - 50, mouseY + 100, 50, 200);

    tint(255, 255);
    image(cursorImg[currentCursor], mouseX, mouseY, 100, 100);
}

// funzione per disegnare un fiore
function drawFlower(flowerX, flowerY, petalColor, scaleFactor) {
    push();
    translate(flowerX, flowerY);
    scale(scaleFactor);
    
    fill("#116e11ff");
    rect(0, 25, 15, 150);

    fill(petalColor);
    let oscillation = sin(frameCount * 0.03) * PI / 8;
    for (let angle = 0; angle < 360; angle += 45) {
        push();
        translate(0, - 50);
        rotate(radians(angle) + oscillation);
        ellipse(0, 35, 30, 70);
        pop();
    }

    fill("#fff3c2ff");
    circle(0, - 50, 50);

    fill("#116e11ff");
    push();
    translate(- 15, + 70);
    rotate(oscillation);
    ellipse(0, 0, 40, 20);
    pop();
    
    push();
    translate(15, 40);
    rotate(-oscillation);
    ellipse(0, 0, 40, 20);
    pop();

    pop();
}

// salva il tempo di pressione del mouse
function mousePressed() {
    mousePressStart = millis();
    currentCursor = 1;
    waterImg.play();
    waterVisible = true;
}

function mouseReleased() {
    mousePressStart = null;
    currentCursor = 0;
    waterImg.reset();
    waterImg.pause();
    waterVisible = false;
}