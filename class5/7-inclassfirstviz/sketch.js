//variabili globali
let xMax = 400;
let yMax = 600;

let xRocket = xMax / 2;
let yRocket = yMax * 0.6;

let table;
let star_img;
let stars_valid = [];

function isStarSizeValid(value) {
    //se il dato ingresso è corretto o meno
    //restituire un booleano
    return value > 0;
}

//caricare asset prima che la pagina web venga caricata
function preload() {
    table = loadTable("../assets/datasets/stars.csv", "csv", "header");
    star_img = loadImage("../assets/img/star.png");
}

function setup() {
    createCanvas(xMax, yMax);
    frameRate(30);
    //filtrare i dati
    //tramite isStarSizeValid
    //applichiamo la funzione di filtro

    //scorriamo i valori con un ciclo
    //e filtriamo
    for (let i = 0; i < table.getRowCount(); i++) {
        let star_value = table.getNum(i, "starSize");
        if (isStarSizeValid(star_value)) {
            stars_valid.push(star_value);
        }
    }

    // Ordiniamo l'array
    stars_valid.sort((a, b) => a - b)

    angleMode(DEGREES);
}

function drawStarsFromFile() {
    for (let k = 0; k < table.getRowCount(); k++) {
        let starX = ((k * 37) % width) + (k % 3) * 5;
        let starY = ((k * 73) % height) + (k % 7);
        let starSize = table.getNum(k, "starSize");
        image(star_img, starX, starY, starSize, starSize);
    }
}

function draw() {
    background("#C0E1FC");

    fill(0); //bianco
    textSize(20);
    text("mouseX: " + mouseX + ", mouseY: " + mouseY, 20, 20);

    //disegnare la stella più piccola
    // e la stella più grossa
    //stars_valid
    //image(star_img, 50, 50, min(stars_valid), min(stars_valid));
    //image(star_img, 100, 100, max(stars_valid), max(stars_valid));

    // drawStarsFromFile();

    // 1. Rappresentare le statistiche
    // 1.A Quante stelle valide ci sono
    text("Stelle valide: " + stars_valid.length, 20, height - 20);
    // 1.B Il valor medio della dimensione delle stelle
    text("Dimensione media: " + getMean(stars_valid), 20, height - 40);
    // 1.C La deviazione standard
    // ...

    // 2. Disegnare il grafico
    // 2.A Assegnare le etichette agli assi
    // 2.B Rappresentare i dati
    drawStarSizePlot(stars_valid);
}

function getMean(arr) {
    return round(arr.reduce((sum, v) => sum + v) / arr.length, 2);
}

function drawStarSizePlot(arr) {
    // Asse x e asse y
    let xMinChart = 30;
    let xMaxChart = width - 20;
    let yMaxChart = height / 2;
    let yMinChart = 40;

    // Assegnare le etichette
    push();
    // Asse x
    line(xMinChart, yMaxChart, xMaxChart, yMaxChart);
    // Asse y
    line(xMinChart, yMaxChart, xMinChart, yMinChart);
    // Etichetta asse x
    push();
    translate(xMinChart, yMinChart);
    rotate(-90);    // In radianti, -PI/2
    text("Size", -textWidth("Size"), -xMinChart / 3);
    pop();
    // Rappresentare le dimensioni delle stelle
    arr.forEach((star, i) => {
        // Coordinate x e y
        let x = map(i, 0, arr.length, xMinChart + 5, xMaxChart - 5);
        let y = map(star, min(arr), max(arr), yMaxChart + 5, yMinChart - 5);
        // Draw image
        image(star_img, x, y, star, star);
    });
    pop();
}