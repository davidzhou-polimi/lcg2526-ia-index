let selectedYear = 1960;
let points = [];
const colors = ["#00bffc","#1b39ff","#9c76ff","#000000", ]; 
const dotOffset = 40;
const totalSpicchi = 60; // Numero di spicchi
const startYear = 1960; // Anno di inizio
const endYear = 2020; // Anno di fine
let satelliteData; 
let hoveredPoint = null;
let inconsolataFont, rubikOneFont; // Variabili per i font
let terraImg; //  variabile per l'immagine
let countries = []; // Array per memorizzare i paesi unici
let menuOpen = false; // Variabile per tracciare lo stato del menu
let rocketBodyImage; // Aggiungi questa riga per la variabile dell'immagine del rocket body
let razzinoImage; // variabile per l'immagine del razzino
let smokePositions = []; // Array per memorizzare le posizioni del fumo

let fumoData = []; 
let numFumo = 75; 
let fumoAspectRatio = 1; 
let autoScroll = false;
let autoScrollSpeed = 0.5;
let autoScrollCompleted = false;
let lastUpdateTime = 0;
let ANIMATION_DURATION = 5000; 
let slider;
let rocketImg;
let rocketWidth;
let rocketHeight = 40;
let rotationAngle = 0; // Add this variable to track the rotation angle

// Add these global variables for sound
let sound;
let toggleButton; // Variable for the button
let isPlaying = false; // Tracks the audio state
//global params for country name
let params;
let countryName;
let assetsPath="../assets/"
let DEBUG = false; // Modalità debug

function log(...args) {
  if (DEBUG) {
    console.log(...args);
  }
}

function preload() {
  params = getURLParams();
  countryName = decodeURIComponent(params['countryName'] || 'VIETNAM'); // Default to VIETNAM if not present
  log(countryName);
  // Carica i font
  inconsolataFont = loadFont(assetsPath+"fonts/Inconsolata.ttf");
  rubikOneFont = loadFont(assetsPath+"fonts/RubikOne.ttf");
  terraImg = loadImage(assetsPath+"img/marenero.png");
  imgtitolo = loadImage(assetsPath+"img/titolo.png");
  imgperigeo = loadImage(assetsPath+"img/perigeo2.png");


  satelliteData = loadTable(assetsPath+"datasets/space_decay.csv", 'csv', 'header', 
    () => {
      log("CSV caricato con successo");
      log("Numero di righe:", satelliteData.getRowCount()); // Log per il numero di righe
      log("Colonne:", satelliteData.columns); // Log per le colonne

      
      let uniqueCountries = new Set();
      for (let row of satelliteData.rows) {
        let country = row.get('COUNTRY_CODE');
        if (country && country.trim() !== '') {
          uniqueCountries.add(country);
          // log("Aggiunto paese:", country); // Log per ogni paese aggiunto
        }
      }
      countries = Array.from(uniqueCountries).sort();
      log("Lista finale dei paesi:", countries); // Log per la lista finale
    },
    (error) => {
      console.error("Errore nel caricamento del CSV:", error); // Log per eventuali errori
    }
  );

  payloadImage = loadImage(assetsPath+"img/payload.png", 
    () => log("Immagine payload caricata con successo"), 
    (error) => console.error("Errore nel caricamento dell'immagine payload:", error)
  ); //  l'immagine del payload
  debrisImage = loadImage(assetsPath+"img/debris.png", 
    () => log("Immagine debris caricata con successo"), 
    (error) => console.error("Errore nel caricamento dell'immagine debris:", error)
  ); //  l'immagine dei debris
  tbiImage = loadImage(assetsPath+"img/tbi.png", 
    () => log("Immagine TBI caricata con successo"), 
    (error) => console.error("Errore nel caricamento dell'immagine TBI:", error)
  ); //  l'immagine TBI
  rocketBodyImage = loadImage(assetsPath+"img/rocket-body.png", 
    () => log("Immagine rocket body caricata con successo"), 
    (error) => console.error("Errore nel caricamento dell'immagine rocket body:", error)
  ); //  l'immagine del rocket body
  razzinoImage = loadImage(assetsPath+"img/razzino.png", // Carica l'immagine del razzino
    () => log("Immagine razzino caricata con successo"), 
    (error) => console.error("Errore nel caricamento dell'immagine razzino:", error)
  ); 
  smokeImage = loadImage(assetsPath+"img/fumo.png", () => {
    fumoAspectRatio = smokeImage.width / smokeImage.height;
    log("Immagine fumo caricata con successo");
    
    precalculateFumo();
  }, (error) => console.error("Errore nel caricamento dell'immagine fumo:", error));

  rocketImg = loadImage(assetsPath+"img/razzino.png", img => {
    let ratio = img.width / img.height;
    rocketWidth = rocketHeight * ratio;
  });

}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  textAlign(CENTER, CENTER);

  let buttonPositions = [
    { x: width - 430, y: 30 },
    { x: width - 300, y: 30 },
    { x: width - 160, y: 30 }
];
createButtons(buttonPositions);
// Aggiungi questa riga per rendere i pulsanti fissi
let buttons = selectAll('button');
buttons.forEach(button => {
    button.style('position', 'fixed');
});


  // Genera tutti i punti una volta sola
  for (let year = startYear; year <= endYear; year++) {
    generateDotsForYear(year);
  }
  createHamburgerMenu();
}

function styleButton(button) {
  button.style('font-family', 'Inconsolata'); // Inconsolata font
  button.style('font-size', '12px');
  button.style('padding', '5px 10px');
  button.style('border', '2px solid black'); 
  button.style('border-radius', '8px'); 
  button.style('background-color', 'white'); 
  button.style('color', 'black'); 
  button.style('cursor', 'pointer'); 
  button.style('text-align', 'center');
}


function windowResized() {
  // ridimensiona canvas quando finestra viene ridimensionata
  resizeCanvas(windowWidth, windowHeight);
  redraw(); 
}

function precalculateFumo() {
  let centerX = width / 2;
  let centerY = height;
  let radius = 320;
  let arcLength = PI * radius; // semicerchio su cui si trova il fumo
  let step = arcLength / numFumo;

  for (let i = 0; i < numFumo; i++) {
    let angle = map(i, 0, numFumo, 180, 360);
    let randomScale = random(0.8, 1.3);
    let randomRotation = random(-30, 30);
    let randomOffsetR = random(-5, 5);

    fumoData.push({
      angle: angle,
      scale: randomScale,
      rotation: randomRotation,
      offsetR: randomOffsetR
    });
  }
}

function createButtons(positions) {
  let buttonWidth = 100;
  let buttonHeight = 40;
  let buttonSpacing = 10;
  let buttonLabels = ['GRAFICO', 'COSA SONO', 'CHI SIAMO'];
  for (let i = 0; i < buttonLabels.length; i++) {
      let button = createButton(buttonLabels[i]);
      let buttonWidth = textWidth(buttonLabels[i]) + 20;
      button.position(positions[i].x, positions[i].y);
      button.size(buttonWidth, buttonHeight);
      button.style('border-radius', '10px');
      button.style('background-color', 'white');
      button.style('border', '2px solid black');
      button.style('font-family', 'Inconsolata');
      button.style('font-weight', 'bold');
      button.style('font-size', '16px');
      button.style('cursor', 'pointer');
      button.style('width', 'auto');
      button.style('padding', '10px 20px');

      if (buttonLabels[i] === 'GRAFICO') {
          button.style('background-color', 'black');
          button.style('color', 'white');
          button.style('border', '2px solid white');
      } else {
          button.style('background-color', 'white');
          button.style('color', 'black');
          button.style('border', '2px solid black');
      }
      
      button.mouseOver(() => {
          if (buttonLabels[i] === 'GRAFICO') {
              button.style('background-color', 'black');
              button.style('color', 'white');
              button.style('border', '2px solid white');
          } else {
              button.style('background-color', 'black');
              button.style('color', 'white');
              button.style('border', '2px solid white');
          }
      });
      button.mouseOut(() => {
          if (buttonLabels[i] === 'GRAFICO') {
              button.style('background-color', 'black');
              button.style('color', 'white');
              button.style('border', '2px solid white');
          } else {
              button.style('background-color', 'white');
              button.style('color', 'black');
              button.style('border', '2px solid black');
          }
      });
      button.mousePressed(() => {
        log(buttonLabels[i] + ' cliccato');
        if (buttonLabels[i] === 'COSA SONO') {
            window.location.href = '../4-explore-a-project/p5/cosasono/index.html';
        } else if (buttonLabels[i] === 'CHI SIAMO') {
            window.location.href = '../4-explore-a-project/p5/chisiamo/index.html';
          } else if (buttonLabels[i] === 'GRAFICO') {
              window.location.href = '../4-explore-a-project/p5/notizie+vista generale/index.html';
}
    });
  }
}


function draw() {
  background(240);

  let boxWidth = 270; // Larghezza dei rettangoli
  let boxHeight = 150; // Altezza standard dei rettangoli 


  
  fill(255); // Colore bianco
  stroke(0); // Bordo nero
  strokeWeight(2); // Spessore del bordo

  
  fill(255); // Colore bianco
  stroke(0); // Bordo nero
  strokeWeight(2); // Spessore del bordo

  
  let rightX = width - boxWidth - 40; // Posizione X per gli ultimi due rettangoli


  fill(255); // Colore bianco
  stroke(0); // Bordo nero
  strokeWeight(2); // Spessore del bordo

  
  fill(255); // Colore bianco
  stroke(0); // Bordo nero
  strokeWeight(2); // Spessore del bordo
  
  textFont(rubikOneFont); // Font Rubik
  textAlign(LEFT, TOP); // Allineamento del testo
  let textY = (height - boxHeight) / 2 -200; 
  
  
  fill(0); 
  strokeWeight(0); // Nessuno stroke per il resto del testo
  textSize(18); // Dimensione del testo per RIFIUTI SPAZIALI, TIPOLOGIE, DIMENSIONE
  textAlign(LEFT, TOP); // Allineamento del testo

  textY += 25; //  posizione Y per "TIPOLOGIE"

  
  textFont(inconsolataFont); // Font Inconsolata
  textSize(14); // Dimensione del testo per PAYLOAD, TBA, ROCKET BODY
  textY += 35; //posizione Y per le voci specifiche

  textY += 70; //  posizione Y per "ROCKET BODY" 

  
  textY += 103; //  posizione Y per il testo
  textFont(rubikOneFont); // Font Rubik
  textSize(18); // Dimensione del testo per DIMENSIONE

  // text("DIMENSIONE", textX, textY); // Resto del testo

  textFont(inconsolataFont); // Font Inconsolata
  textSize(12);
  
  textY += 35; //posizione Y per "DIMENSIONE"
  textFont(inconsolataFont); // Font Inconsolata
  textSize(12);

  textY += 60; 

  textY += 40; 

  // Rubik 
  textFont(rubikOneFont); // Font Rubik
  textSize(18); // Dimensione del testo per DIMENSIONE


  if (imgtitolo) {
    image(imgtitolo, 10, 10, imgtitolo.width * 0.25, imgtitolo.height * 0.25);
  }
  if (mouseX > 50 && mouseX < -30 + imgtitolo.width * 0.25 && mouseY > 30 && mouseY < 20 + imgtitolo.height * 0.25) {
    cursor(HAND);
    if (mouseIsPressed) {
      window.location.href = '../4-explore-a-project/index.html';
      // window.location.href = '../../index.html';
    }
  } else {
    cursor(ARROW);
  }

  push();
  fill(0);
  textSize(50);
  textFont(rubikOneFont);
  strokeWeight(0);
  textAlign(CENTER, CENTER); // allineamento centrato
  // text("VIETNAM", width / 2, 250); // Centra il titolo
  text(countryName, width / 2, 250); // Centra il titolo
  pop();

  drawDots();
  drawSelectedYear();
  drawRadialSlider();
  
  if (hoveredPoint) {
    drawTooltip(hoveredPoint);
  }

  textFont(rubikOneFont); // Font Rubik
  textAlign(LEFT, TOP); // Allineamento del testo
  let textXRight = rightX + 18; // Posizione X del testo a destra
  let textYRight = (height - boxHeight) / 2 -198; // allineato

  fill(0); // Colore
  strokeWeight(0); // Nessuno stroke 
  textSize(18); // Dimensione del testo per RIFIUTI SPAZIALI, TIPOLOGIE, DIMENSIONE
  textAlign(LEFT, TOP); // Allineamento del testo
  // text("PERIGEO", textXRight, textYRight); // Testo "RIFIUTI SPAZIALI"


  textFont(inconsolataFont); // Font Inconsolata
  textSize(14); // Dimensione del testo 
  textYRight += 32; //  posizione Y 
  // text("DISTANZA DALLA TERRA", textXRight, textYRight); 
//Rubik 
  textYRight += 32; 
//

// image(imgperigeo, textXRight, textYRight, imgperigeo.width * 0.17, imgperigeo.height * 0.17);
textYRight += 64; 
textSize(12); // Dimensione del testo 

// text("Il punto di massima vicinanza del detrito \nalla terra, mentre orbita intorno ad essa", textXRight, textYRight); // Voce "DISTANZA DALLA TERRA"
textY += 52; 

textFont(rubikOneFont); // Font Rubik
textSize(18); // Dimensione del testo 
  textYRight += 82; // posizione Y 
  // text("ANNO", textXRight, textYRight); // Testo "ANNO"

  textFont(inconsolataFont); // Font Inconsolata
  textSize(22);
  textYRight += 30
  // text("0000", textXRight, textYRight); // Testo "ANNO"

  textFont(inconsolataFont); // Font Inconsolata
  textSize(12); // Dimensione del testo 
  textYRight += 37; //  posizione Y 
  // text("Anno in cui è stato lanciato il detrito", textXRight, textYRight); // 

  if (imgtitolo) {
    image(imgtitolo, 10, 10, imgtitolo.width * 0.25, imgtitolo.height * 0.25);
  }
  if (mouseX > 50 && mouseX < -30 + imgtitolo.width * 0.25 && mouseY > 30 && mouseY < 20 + imgtitolo.height * 0.25) {
    cursor(HAND);
    if (mouseIsPressed) {
      window.location.href = '../4-explore-a-project/index.html';
    }
  } else {
    cursor(ARROW);
  }
}


function generateDotsForYear(year) {
  let centerX = width / 2;
  let centerY = height;
  let minDistance = 450;
  let maxDistance = min(width, height) * 2.2;

  for (let row of satelliteData.rows) {
    let countryCode = row.get('COUNTRY_CODE');
    if (countryCode !== countryName) continue;
    // if (countryCode !== 'VIETNAM') continue;

    let launchDate = new Date(row.get('LAUNCH_DATE'));
    let launchYear = launchDate.getFullYear();

    if (launchYear === year) {
      // Add console.log to debug PERIAPSIS value
      let periapsisRaw = row.get('PERIAPSIS');
      log('Raw PERIAPSIS value:', periapsisRaw);
      
      let periapsis = parseFloat(row.get('PERIAPSIS'));
      if (isNaN(periapsis)) {
        log('Invalid PERIAPSIS value:', periapsisRaw);
        continue;
      }
      log('Parsed PERIAPSIS value:', periapsis);

      let constrainedPeriapsis = constrain(periapsis, 0, 1000000);
      let distance = map(constrainedPeriapsis, 0, 1000000, minDistance, maxDistance);

      let angle = map(year - startYear, 0, endYear - startYear, 180, 360);
      angle += random(-8, 8);

      let x = centerX + distance * cos(angle);
      let y = centerY + distance * sin(angle);

      let objectType = row.get('OBJECT_TYPE');
      let dotColor;
      switch (objectType) {
        case 'PAYLOAD':
          dotColor = colors[0];
          break;
        case 'ROCKET BODY':
          dotColor = colors[1];
          break;
        case 'DEBRIS':
          dotColor = colors[2];
          break;
        default :
          dotColor = colors[3];
      }

      let rcsSize = row.get('RCS_SIZE');
      let dotSize = 2;
      switch (rcsSize) {
        case 'LARGE':
          dotSize = 8;
          break;
        case 'MEDIUM':
          dotSize = 5;
          break;
        case 'SMALL':
          dotSize = 3;
          break;
      }

      points.push({ 
        x, 
        y, 
        year: launchYear, 
        color: dotColor,
        size: dotSize,
        objectId: row.get('OBJECT_ID'),
        site: row.get('SITE'),
        objectType: row.get('OBJECT_TYPE'),
        rcsSize: row.get('RCS_SIZE'),
        periapsis: periapsis  // Make sure we're using the parsed value
      });
    }
  }
}

function drawDots() {
  hoveredPoint = null; 

  for (let point of points) {
    if (point.year <= selectedYear) {
      let alpha = map(abs(point.year - selectedYear), 0, 60, 255, 50);
      alpha = constrain(alpha, 50, 255);

      let d = dist(mouseX, mouseY, point.x, point.y);
      if (d < point.size) {
        hoveredPoint = point;
        strokeWeight(2);
        stroke(0);
      }

      // Sostituisci il cerchio con l'immagine del payload solo se il tipo è 'PAYLOAD'
      if (point.objectType === 'PAYLOAD') {
        let enlargedSize = point.size * 3; // Ingrandisci l'immagine del payload
        image(payloadImage, point.x - enlargedSize / 2, point.y - enlargedSize / 2, enlargedSize, enlargedSize); // Usa l'immagine del payload
      } 
      // Sostituisci il cerchio con l'immagine dei debris solo se il tipo è 'DEBRIS'
      else if (point.objectType === 'DEBRIS') {
        let enlargedSize = point.size * 3; // Ingrandisci l'immagine dei debris
        image(debrisImage, point.x - enlargedSize / 2, point.y - enlargedSize / 2, enlargedSize, enlargedSize); // Usa l'immagine dei debris
      } 
      // Sostituisci il cerchio con l'immagine TBI solo se il tipo è 'TO BE IDENTIFIED'
      else if (point.objectType === 'TO BE IDENTIFIED') {
        let enlargedSize = point.size * 3; // Ingrandisci l'immagine TBI
        image(tbiImage, point.x - enlargedSize / 2, point.y - enlargedSize / 2, enlargedSize, enlargedSize); // Usa l'immagine TBI
      } 
      // Sostituisci il cerchio con l'immagine del rocket body solo se il tipo è 'ROCKET BODY'
      else if (point.objectType === 'ROCKET BODY') {
        let enlargedSize = point.size * 3; // Ingrandisci l'immagine del rocket body
        let aspectRatio = rocketBodyImage.width / rocketBodyImage.height; // Calcola il rapporto di aspetto
        let imgWidth = enlargedSize; // Larghezza dell'immagine
        let imgHeight = enlargedSize / aspectRatio; // Calcola l'altezza mantenendo il rapporto di aspetto
        image(rocketBodyImage, point.x - imgWidth / 2, point.y - imgHeight / 2, imgWidth, imgHeight); // Usa l'immagine del rocket body
      } 
      else {
        fill(point.color); // Assicurati di riempire con il colore corretto
        noStroke();
        ellipse(point.x, point.y, point.size, point.size); // Mantieni il cerchio per gli altri tipi
      }
    }
  }

  if (hoveredPoint) {
    drawTooltip(hoveredPoint);
  }
}

// ... existing code ...
function drawTooltip(point) {
  // Add console.log to debug tooltip values
  log('Tooltip point data:', point);
  
  let tooltipX = mouseX + 20;
  let tooltipY = mouseY;
  let tooltipW = 200;
  let tooltipH = 120;

  if (tooltipX + tooltipW > width) tooltipX = mouseX - tooltipW - 20;
  if (tooltipY + tooltipH > height) tooltipY = mouseY - tooltipH;

  // Disegna il tooltip
  fill(255);
  stroke(0);
  strokeWeight(1);
  rect(tooltipX, tooltipY, tooltipW, tooltipH + 10, 5);

  noStroke();
  fill(0);
  textAlign(LEFT);
  textSize(14);
  textFont(inconsolataFont);
  textStyle(BOLD);

  let leftPadding = 25;
  let verticalPadding = 2;
  let lineHeight = 20;
  
  
  let periapsisValue = point.periapsis;
  if (periapsisValue === undefined || isNaN(periapsisValue)) {
    periapsisValue = 'N/A';
  } else {
    periapsisValue = Math.round(periapsisValue) + ' km';
  }
  
  text(`ID oggetto: ${point.objectId}`, tooltipX + leftPadding, tooltipY + verticalPadding + lineHeight);
  text(`Sito di lancio: ${point.site}`, tooltipX + leftPadding, tooltipY + verticalPadding + lineHeight * 2);
  text(`Tipo: ${point.objectType}`, tooltipX + leftPadding, tooltipY + verticalPadding + lineHeight * 3);
  text(`Forza segnale: ${point.rcsSize}`, tooltipX + leftPadding, tooltipY + verticalPadding + lineHeight * 4);
  text(`Perigeo: ${periapsisValue}`, tooltipX + leftPadding, tooltipY + verticalPadding + lineHeight * 5);

  textAlign(CENTER, CENTER);
}


function drawSelectedYear() {
  let centerX = width / 2;
  let centerY = height;

  //stile per l'anno selezionato
  textSize(32);
  textFont(rubikOneFont);  
  strokeWeight(4);         
  stroke(0);             
  fill(255);            
  textAlign(CENTER, CENTER);
  text(selectedYear, centerX, centerY - 55); // Mostra l'anno selezionato
}

function drawRadialSlider() {
  let centerX = width / 2;
  let centerY = height;
  let radius = 320;
  let startAngle = 180;
  let endAngle = 360;

  noFill();
  stroke(192);
  strokeWeight(2);
  arc(centerX, centerY, (radius + 20) * 2, (radius + 20) * 2, startAngle, endAngle);

  for (let year = startYear; year <= endYear; year += 10) {
    let angle = map(year, startYear, endYear, startAngle, endAngle);
    let x1 = centerX + (radius + 10) * cos(angle);
    let y1 = centerY + (radius + 10) * sin(angle);
    let x2 = centerX + (radius + 30) * cos(angle);
    let y2 = centerY + (radius + 30) * sin(angle);

    strokeWeight(1);
    line(x1, y1, x2, y2);
    noStroke();
    fill(0);
    textSize(25);
    textFont(inconsolataFont);

    let textY = centerY + (radius + 40) * sin(angle) - 10;
    text(year, centerX + (radius + 60) * cos(angle), textY);
  }

  
  if (mouseIsPressed) {
    let mouseAngle = atan2(mouseY - centerY, mouseX - centerX);
    if (mouseAngle < 0) mouseAngle += 360;
    
    
    let mouseDist = dist(mouseX, mouseY, centerX, centerY);
    let arcDist = abs(mouseDist - (radius + 20));
    
    
    if (arcDist < 30 && mouseAngle >= startAngle && mouseAngle <= endAngle) {
      selectedYear = floor(map(mouseAngle, startAngle, endAngle, startYear, endYear + 1));
      selectedYear = constrain(selectedYear, startYear, endYear);
      autoScrollCompleted = true;
      autoScroll = false;
    }
  }

  let sliderAngle = map(selectedYear, startYear, endYear, startAngle, endAngle);
  let sliderX = centerX + (radius + 20) * cos(sliderAngle);
  let sliderY = centerY + (radius + 20) * sin(sliderAngle);

 
  smokePositions.push({ x: sliderX, y: sliderY });

 
  for (let fumo of fumoData) {
    if (fumo.angle <= sliderAngle) {
      let fumoX = centerX + (radius + 20 + fumo.offsetR) * cos(fumo.angle);
      let fumoY = centerY + (radius + 20 + fumo.offsetR) * sin(fumo.angle);
      
      push();
      translate(fumoX, fumoY);
      rotate(radians(fumo.rotation));
      imageMode(CENTER);
      image(smokeImage, 0, 0, 
        25 * fumo.scale, 
        (25 / fumoAspectRatio) * fumo.scale
      );
      pop();
    }
  }

  // Draw rocket with orbital rotation
  let imgWidth = razzinoImage.width * 0.15;
  let imgHeight = razzinoImage.height * 0.15;
  push();
  translate(sliderX, sliderY);
  if (sliderAngle == startAngle) {
    rotate(radians(sliderAngle) - 90);
  } else if (sliderAngle == endAngle) {
    rotate(radians(sliderAngle) + 90);
  } else {
    //  l'angolo di rotazione graduale tra posizione iniziale e finale
    let startRotation = radians(startAngle) - 90;
    let endRotation = radians(endAngle) + 90;
    let progress = (sliderAngle - startAngle) / (endAngle - startAngle);
    let currentRotation = lerp(startRotation, endRotation, progress);
    rotate(currentRotation);
  }
  imageMode(CENTER);
  image(razzinoImage, 0, 0, imgWidth, imgHeight);
  pop();
}

function createHamburgerMenu() {
  let menuButton = createButton('Cambia Paese'); //bottone
  menuButton.class('hamburger-menu');
  menuButton.position(width / 2 - 105, 300); // il bottone va centrato orizzontalmente (105px è la metà della larghezza del menu)
  menuButton.style('font-size', '16px'); 
  menuButton.style('background-color', 'white'); 
  menuButton.style('border', '2px solid black'); 
  menuButton.style('font-family', 'RubikOne'); 
  menuButton.style('padding', '10px 20px'); 
  menuButton.style('width', '220px'); 
  menuButton.mousePressed(() => {
    toggleMenu();
  });
  
  let dropdownMenu = createDiv('');
  dropdownMenu.class('dropdown-menu');
  dropdownMenu.position(width / 2 - 105, 350); 
  dropdownMenu.style('display', 'none');
  dropdownMenu.style('width', '200px'); 
  dropdownMenu.style('height', 'auto'); 
  dropdownMenu.style('background-color', 'white');
  dropdownMenu.style('border-radius', '10px');
  dropdownMenu.style('padding', '10px'); 
  dropdownMenu.style('border', '2px solid black'); 

  //stile slider menù a tendina
  dropdownMenu.style('overflow-y', 'auto'); 
  dropdownMenu.style('overflow-x', 'hidden'); 
  dropdownMenu.style('background-color', 'white');
  dropdownMenu.style('color', 'black'); 

  // Aggiungi stili per la barra dello slider
  let style = document.createElement('style');
  style.innerHTML = `
    .dropdown-menu::-webkit-scrollbar {
      width: 8px; /* Larghezza della barra dello slider */
    }
    .dropdown-menu::-webkit-scrollbar-track {
      background: white; /* Sfondo della barra dello slider */
    }
    .dropdown-menu::-webkit-scrollbar-thumb {
      background: black; /* Colore della barra dello slider */
      border-radius: 10px; /* Angoli arrotondati della barra */
    }
  `;
  document.head.appendChild(style);

  if (countries && countries.length > 0) {
    countries.forEach(country => {
      let countryItem = createDiv(country);
      countryItem.parent(dropdownMenu);
      countryItem.class('country-item');
      countryItem.style('color', 'black');
      countryItem.style('text-align', 'center'); // Centra il testo dei paesi
      countryItem.style('font-family', 'RubikOne'); // Imposta il font RubikOne
      
      // Aggiungi un evento di clic per ogni paese
      countryItem.mousePressed(() => {
        // Default: use query parameter
        window.location.href = `./index.html?countryName=${encodeURIComponent(country)}`;
      });
      
      log("Aggiunto paese al menu:", country); // Log per debug
    });
  } else {
    log("Nessun paese disponibile"); // Log se non ci sono paesi
  }
}

function toggleMenu() {
  let dropdown = select('.dropdown-menu');
  if (dropdown.style('display') === 'none') {
    dropdown.style('display', 'block');
    setTimeout(() => {
      dropdown.addClass('show');
    }, 10);
  } else {
    dropdown.removeClass('show');
    setTimeout(() => {
      dropdown.style('display', 'none');
    }, 300);
  }
}

function updateRazzinoPosition(sliderValue) {
    const curvePoint = getCurvePoint(sliderValue); //  il punto sulla curva
    const tangentAngle = getTangentAngle(sliderValue); // l'angolo tangente

    // Posiziona Razzino
    razzino.position.set(curvePoint.x, curvePoint.y); // Imposta la posizione del razzino
    razzino.rotation.z = radians(tangentAngle); // Ruota Razzino per essere tangente
}

// Funzione per calcolare il punto sulla curva
function getCurvePoint(value) {
    let centerX = width / 2;
    let centerY = height;
    let radius = 320; // Raggio dell'arco
    let startAngle = 180; // Angolo di inizio
    let endAngle = 360; // Angolo di fine

    // Calcola l'angolo corrispondente al valore
    let angle = map(value, startYear, endYear, startAngle, endAngle);
    
    // Calcola le coordinate del punto sulla curva
    let x = centerX + radius * cos(radians(angle));
    let y = centerY + radius * sin(radians(angle));

    return { x, y }; // Restituisce un oggetto con le coordinate x e y
}

// Funzione per calcolare l'angolo della tangente
function getTangentAngle(value) {
    let startAngle = 180; // Angolo di inizio
    let endAngle = 360; // Angolo di fine

    // Calcola l'angolo corrispondente al valore
    let angle = map(value, startYear, endYear, startAngle, endAngle);
    log("Input Value:", value, "Calculated Angle:", angle); // Log per il debug
    return angle; // Restituisce l'angolo della tangente
}


function easeOutQuad(t) {
  return t * (2 - t);
}


function mousePressed() {
  if (autoScroll || !autoScrollCompleted) {
    return false;
  }
}

function drawSliderTimeline() {
  //  l'anno selezionato sopra lo slider
  stroke(0);
  strokeWeight(0);
  fill(0);
  textFont(inconsolataFont);
  textSize(20);
  text(selectedYear, width / 2, height - 100);

  //  le etichette degli anni estremi
  noStroke();
  fill(0);
  textFont(inconsolataFont);
  textSize(14);
  text('1960', (width - 700) / 2 - 60, height - 57);
  text('2020', (width + 700) / 2 + 40, height - 57);

  // la linea principale dello slider
  stroke(192);
  strokeWeight(2);
  let startX = (width - 700) / 2;
  let endX = startX + 700;
  let passedX = map(selectedYear, 1960, 2020, startX, endX);
  line(passedX, height - 55, endX, height - 55);

  // i pallini di delimitazione
  fill(0);
  ellipse(startX, height - 55, 10, 10);
  ellipse(endX, height - 55, 10, 10);

  // selectedYear se il mouse è sopra lo slider e viene premuto
  if (
    mouseIsPressed &&
    mouseY > height - 90 &&
    mouseY < height - 30 &&
    mouseX > startX &&
    mouseX < endX
  ) {
    autoScrollCompleted = true;
    autoScroll = false;
    let mouseXPosition = constrain(mouseX, startX, endX);
    let mouseIndex = map(mouseXPosition, startX, endX, 0, 60);
    selectedYear = int(map(mouseIndex, 0, 60, 1960, 2020));
    slider.value(selectedYear);
  }

  // Disegna il razzo sopra lo slider
  let rocketX = map(selectedYear, 1960, 2020, startX, endX);
  if (rocketX <= endX) {
    drawRocket(rocketX, height - 55);
  }
}


function drawRocket(x, y) {
  push();
  translate(x, y);
  rotate(90);  // Ruota il razzo di 90°
  imageMode(CENTER);
  image(rocketBodyImage, 0, 0, rocketBodyImage.width * 0.15, rocketBodyImage.height * 0.15);
  pop();
}
