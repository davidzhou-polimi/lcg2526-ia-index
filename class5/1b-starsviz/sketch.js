//variables for canva
let xMax = 400;
let yMax = 600;
//other global variables
let table;
let star_img;

let bckgcolor = "#C0E1FC"

let star_values= [];
let meanSize;
let stdDevSize;


function preload() {
  table = loadTable("../assets/datasets/stars.csv", "csv", "header");
  star_img = loadImage("../assets/img/star.png");
}


function ruleOne(value){
  return value >= 0;
}


function setup() {
  createCanvas(xMax, yMax);
  frameRate(30);
  //prefiltering
  for(let i = 0; i < table.getRowCount();i++){
    let starVal = table.getNum(i, "starSize");
    if(ruleOne(starVal)){
     star_values.push(starVal);
    }
  }
  angleMode(DEGREES);
  // sort decreasing order
  // star_values.sort( (a,b) => b - a );
  // sort increasing order
  star_values.sort((a,b) => a - b );

}


//mode 1
function meanOfArray(inputArr){
  let sum=0;
  for(let i=0; i < inputArr.length; i++){
    sum+=inputArr[i];
  }
  return sum/inputArr.length;
}

function stdDevOfArray(inputArr){
  let m = meanOfArray(inputArr);
  let variance=0;
  for(let i=0; i < inputArr.length; i++){
    let tmp = inputArr[i] - m;
    variance += Math.pow(tmp, 2);
  }
  variance = variance / inputArr.length;
  return Math.sqrt(variance);

}

//mode 2
function mean(arr) {
  const sum = arr.reduce((a, b) => a + b, 0);
  return sum / arr.length;
}

function standardDeviation(arr) {
  const m = mean(arr);
  const variance = arr.reduce((sum, x) => sum + (x - m) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}


function drawStarsFromArray(list_stars) {
  let xStar = 50;
  let yStar = 100;
  for(let i = 0; i < list_stars.length; i++) {
    image(star_img, xStar+i*2, yStar+i*2, list_stars[i], list_stars[i]);
  }
}


function drawStarsAsChart(list_stars) {
  //asse x e asse y
  push();
  stroke(155);
  strokeWeight(2);
  let xMin = 40;
  let xMax = 390;
  let yMin = 40;
  let yMax = 220;
  //asse y, fissata una x variato y
  line(xMin,yMax,xMin,yMin);
  //asse x
  line(xMin, yMax, xMax ,yMax);
  //aggiungere label asse y, label ruotata
  push();
  noStroke();
  textSize(20);
  translate(35,80);
  rotate(-90);
  text("Size", 0,0);
  pop();
  //aggiungere label asse x
  noStroke();
  textSize(20);
  text("Stars", 150, 240);
  // strokeWeight(5);
  // stroke(0);
  //ridefinire una scala di rappr -- > map 
  for(let i = 0; i < list_stars.length; i++) {
    //map --> valore, intervallo iniziale,
    //intervallo di destinazione
    //intervallo iniziale (0, lunghezze.length)
    //intervallo destinazione (xMin, xMax)
    let xStar = map(i, 0, list_stars.length, xMin+5, xMax);
    //intervallo di inizio 
    //intervallo di destinazione
    let yStar = map(list_stars[i], min(list_stars), max(list_stars), yMax, yMin);
    image(star_img, xStar, yStar, list_stars[i], list_stars[i]);
    point(xStar,yStar);
  }
  pop();
}

function draw() {
  background(bckgcolor);
  // noLoop();
  fill(0); //nero
  textSize(20);
  text("mouseX: " + mouseX + ",\
     mouseY: " + mouseY,20,20);
  meanSize = meanOfArray(star_values);
  // meanSize = mean(star_values);
  stdDevSize = stdDevOfArray(star_values);
  // stdDevSize = standardDeviation(star_values);
  drawStarsFromArray(star_values);
  drawStarsAsChart(star_values);
  text("Valid Stars: " + star_values.length + "\n \
     Mean size: " + meanSize.toFixed(2)  + "\n \
     Std dev " + stdDevSize.toFixed(2) , 20, yMax -100 );
}