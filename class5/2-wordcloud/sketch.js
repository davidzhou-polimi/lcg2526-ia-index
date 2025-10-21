let wordData;
let placedWords = [];
let words = [];
let drawIndex = 0; // for animation
let animating = true;

function preload() {
  wordData = loadJSON("../assets/datasets/word_freq.json"); // {"data": [["word", freq], ...]}
}

function setup() {
  let canvas = createCanvas(windowWidth / 2, windowHeight / 2);
  angleMode(RADIANS);
  textAlign(CENTER, CENTER);
  noLoop();
  //sort the words to visualize the biggest first
  words = wordData.data;
  words.sort((a, b) => b[1] - a[1]);
}

function draw(){
  background(40);
  drawWords();
}

function windowResized() {
  resizeCanvas(windowWidth / 2, windowHeight / 2);
  placedWords = [];
  clear(); // clear the canvas
  background(40);
  drawWords();
}


function drawWords() {
  placedWords = [];

  //find center of the canvas
  let centerX = width / 2;
  let centerY = height / 2;

  // Scale font sizes relative to canvas size
  let minSize = min(width, height) * 0.035;
  let maxSize = min(width, height) * 0.12;

  for (let i = 0; i < words.length; i++) {
    let [word, freq] = words[i];
    //remap the font size based on minimum and maximum values and its relative frequency value
    let fontSize = map(freq, words[words.length - 1][1], words[0][1], minSize, maxSize);
    let angles = [0, PI / 4, PI / 2, (3 * PI) / 4];

    let placed = false;
    let radius = 0;
    let angle = 0;

    //try to map at most 1K times
    for (let tries = 0; tries < 1000; tries++) {
      radius += fontSize * 0.1;
      angle += 0.25;
      // words follow a spiral path outward from the center.
      // this ensures dense central packing and consistent coverage.
      let x = centerX + radius * cos(angle);
      let y = centerY + radius * sin(angle);
      //the naive random mapping reduce the amount of words
      // let rotation = random(0, 2*PI);
      let rotation = random(angles);

      let bbox = getWordBBox(word, fontSize, x, y, rotation);
      if (!isOverlapping(bbox) && isInsideCanvas(bbox)) {
        drawWord(word, fontSize, x, y, rotation);
        placedWords.push(bbox);
        placed = true;
        break;
      }
    }

    if (!placed) {
      console.log('Skipped:', word);
    }
  }
}

function drawWord(word, size, x, y, angle) {
  push();
  translate(x, y);
  rotate(angle);
  textSize(size);
  fill(random(60, 160), random(60, 160), random(60, 160));
  text(word, 0, 0);
  pop();
}

function getWordBBox(word, size, x, y, angle) {
  textSize(size);
  let w = textWidth(word);
  let h = size;

  //Approximates the rotated bounding box to account for angled text.
  //This prevents rotated words from clipping through each other.
  let rotW = abs(w * cos(angle)) + abs(h * sin(angle));
  let rotH = abs(w * sin(angle)) + abs(h * cos(angle));

  return {
    x: x,
    y: y,
    w: rotW,
    h: rotH
  };
}

function isOverlapping(b) {
  for (let other of placedWords) {
    if (
      abs(b.x - other.x) < (b.w + other.w) / 2 &&
      abs(b.y - other.y) < (b.h + other.h) / 2
    ) {
      return true;
    }
  }
  return false;
}

function isInsideCanvas(b) {
  return (
    b.x - b.w / 2 >= 0 &&
    b.y - b.h / 2 >= 0 &&
    b.x + b.w / 2 <= width &&
    b.y + b.h / 2 <= height
  );
}