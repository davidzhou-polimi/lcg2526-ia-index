
let xMax = 400;
let yMax = 600;

// Il razzo parte dal centro in basso
let xRocket = xMax / 2;
let yRocket = yMax * 0.6;

// Variabile per la velocità del razzo
let rocketSpeed = 0;
// Accelerazione costante (più lenta)
let rocketAcceleration = 0.02;

let xp = [];
let yp = [];

function setup() {
    createCanvas(400, 600);
}

function draw() {
    background("#1e2a4fff");
    sparkle();
    // sfondoStellato();

    // Mostra un testo bianco con coordinate del mouse sul canvas
    fill("#ffffff");
    textSize(20);
    textAlign(LEFT);
    text("X: " + mouseX + " Y: " + mouseY, 10, 25);

    // Aprire contesto di disegno
    push();

    if (mouseIsPressed) {
        // Aumenta la velocità gradualmente
        rocketSpeed += rocketAcceleration;
        yRocket -= rocketSpeed;
        // Quando esce dallo schermo riposiziono in basso
        if (yRocket < -150) {
            yRocket = yMax + 100;
        }
        //sparkle();
        launch();
    } else {
        // Reset posizione e velocità
        yRocket = yMax * 0.6;
        rocketSpeed = 0;
    }

        
    fill("#d6d6d6ff");
    triangle(xRocket + 20, yRocket + 60, xRocket + 80, yRocket + 120, xRocket + 40, yRocket + 20,);
    triangle(xRocket - 20, yRocket + 60, xRocket - 80, yRocket + 120, xRocket - 40, yRocket + 20,);

    fill("#edececff");
    stroke(40);
    rectMode(CENTER);
    // x, y, width, height
    rect(xRocket, yRocket, 80, 180, 40, 40, 8, 8);

    fill("#dd6161ff");
    triangle(xRocket - 40, yRocket - 60, xRocket, yRocket - 120, xRocket + 40, yRocket - 60,);

    fill("#4894bdff");
    stroke(255);
    strokeWeight(3);
    ellipse(xRocket, yRocket, 50, 50);

    fill("#ffffff");
    textSize(30);
    stroke(1.5);
    textAlign(CENTER);
    text(round(rocketSpeed, 2) + " km/h", xMax/2, yMax - 20);

    // Fine contesto di disegno
    pop();
}

function launch() {
    push();

    // Translate the coordinate space so that (0, 0) matches mouse coordinates.
    translate(xRocket, yRocket + 90);

    // Define a random inner and outer radius for each star.
    let innerRadius = random(5, 20);
    let outerRadius = random(20, 75);

    fill("#fde571ff");
    stroke("#cd6363ff");
    strokeWeight(4);
    // Draw the flame shape (capovolta)
    beginShape();
    vertex(0, outerRadius); // punta in alto
    vertex(innerRadius, innerRadius); // lato destro alto
    vertex(outerRadius * 0.6, outerRadius * 0.7); // lato destro medio
    vertex(0, -outerRadius); // fondo, molto più in basso
    vertex(-outerRadius * 0.6, outerRadius * 0.7); // lato sinistro medio
    vertex(-innerRadius, innerRadius); // lato sinistro alto
    endShape(CLOSE);

    pop();
}

function sfondoStellato() {
    push();

    noStroke();
    
    for (let i = 0; i < 120; i++) {
        let starX = (i * 37) % width + (i % 3) * 5;
        let starY = (i * 73) % height + (i % 7) * 5;
        // star(starX, starY);
        if (i % 2 == 0) { 
            fill(255, 255, 150);
            ellipse(starX, starY, 1);
        }
        // Per ogni i divisibile per 3
        else if (i % 3 == 0) {
            fill(200, 100, 255);
            ellipse(starX, starY, 1.5);
        }
        else {
            fill(255, 255, 100);
            ellipse(starX, starY, 2.8);
        }
    }

    pop();
}

function sparkle() {
    push();

    for (let i = 0; i < 100; i++) {
        xp.push(constrain(random(width), 10, width - 10));
        yp.push(constrain(random(height), 10, height - 10));

        star(xp[i], yp[i]);

        // rect(xp[i], yp[i], 5, 5);
    }

    pop();
}

function star(x, y) {
    push();

    // Translate the coordinate space so that (0, 0) matches mouse coordinates.
    translate(x, y);

    // Define a random inner and outer radius for each star.
    let innerRadius = random(1, 3);
    let outerRadius = random(8, 12);

    stroke("#beb585ff");

    // Draw the star shape.
    beginShape();
    vertex(-innerRadius, innerRadius);
    vertex(0, outerRadius);
    vertex(innerRadius, innerRadius);
    vertex(outerRadius, 0);
    vertex(innerRadius, -innerRadius);
    vertex(0, -outerRadius);
    vertex(-innerRadius, -innerRadius);
    vertex(-outerRadius, 0);
    endShape(CLOSE);

    pop();
}