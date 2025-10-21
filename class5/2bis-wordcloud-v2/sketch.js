let placedWords = [];
let wordData;
let words = [];
let drawIndex = 0; // animation index
let animating = true;

function preload() {
  wordData = loadJSON("../assets/datasets/word_freq.json"); // {"data": [["word", freq], ...]}
}

function setup() {
  createCanvas(900, 700);
  textAlign(CENTER, CENTER);
  colorMode(HSB);
  frameRate(30);
  noStroke();

  // Sort by frequency descending
  words = wordData.data;
  words.sort((a, b) => b[1] - a[1]);
}

function draw() {
  background(20);

  // Place next word (animation)
  if (animating && drawIndex < words.length) {
    placeWord(words[drawIndex]);
    drawIndex++;
  }

  // Draw placed words with fade-in effect
  for (let i = 0; i < placedWords.length; i++) {
    drawWord(
      placedWords[i].word,
      placedWords[i].fontSize,
      placedWords[i].x,
      placedWords[i].y,
      placedWords[i].rotation,
      placedWords[i].opacity,
      placedWords[i].hue
    );

    // Gradual fade-in
    if (placedWords[i].opacity < 255) {
      placedWords[i].opacity += 10;
    }
  }

  // Once all words placed, stop animating
  if (drawIndex >= words.length) {
    animating = false;
  }
}

function placeWord([word, freq]) {
  let centerX = width / 2;
  let centerY = height / 2;

  // 🔹 Dynamic font scaling
  let minSize = min(width, height) * 0.035;
  let maxSize = min(width, height) * 0.12;
  let fontSize = map(freq, words[words.length - 1][1], words[0][1], minSize, maxSize);

  // 🔹 Shrink long words a bit
  textSize(fontSize);
  if (textWidth(word) > width * 0.4) fontSize *= 0.85;

  let angles = [0, PI / 4, PI / 2, (3 * PI) / 4];
  let radius = 0;
  let angle = 0;
  let placed = false;

  // 🔹 Spiral placement
  for (let tries = 0; tries < 2000; tries++) {
    radius += fontSize * 0.08;
    angle += 0.25;

    let x = centerX + radius * cos(angle);
    let y = centerY + radius * sin(angle);
    let rotation = random(angles);

    let bbox = getWordBBox(word, fontSize, x, y, rotation);

    if (!isOverlapping(bbox) && isInsideCanvas(bbox)) {
      bbox.word = word;
      bbox.fontSize = fontSize;
      bbox.rotation = rotation;
      bbox.opacity = 0;

      // 🔹 Color mapped to frequency
      bbox.hue = map(freq, words[words.length - 1][1], words[0][1], 220, 30); // blue→red scale

      placedWords.push(bbox);
      placed = true;
      break;
    }
  }

  if (!placed) {
    console.log("Skipped:", word);
  }
}

function drawWord(word, size, x, y, angle, opacity = 255, hue = 200) {
  push();
  translate(x, y);
  rotate(angle);
  textSize(size);

  // 🔹 Soft glow + outline
  stroke(0, 0, 100, opacity * 0.3);
  strokeWeight(2);
  fill(hue, 80, 90, opacity);
  text(word, 0, 0);
  pop();
}

function getWordBBox(word, size, x, y, angle) {
  textSize(size);
  let w = textWidth(word);
  let h = size;

  // Account for rotation
  let rotW = abs(w * cos(angle)) + abs(h * sin(angle));
  let rotH = abs(w * sin(angle)) + abs(h * cos(angle));

  return { x, y, w: rotW, h: rotH };
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

function mousePressed() {
  // 🔹 Restart animation when clicked
  placedWords = [];
  drawIndex = 0;
  animating = true;
}
