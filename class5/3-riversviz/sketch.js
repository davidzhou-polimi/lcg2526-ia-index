let riversData;
let lengths =[];
let nameLengths = [];
let minLength;
let maxLength;
let maxArea, minArea;
function preload(){
  //https://p5js.org/reference/p5/loadTable/
  riversData = loadTable("../assets/datasets/rivers-data-reduced.csv");
  //https://p5js.org/reference/p5/p5.Table/

}

function setup() {
  createCanvas(500, 500);
  //questo dopo avergli mostrato num righe
  //array x lunghezza
  //obj x mappare lung e nome
  let areas = [];
  for(let i=1; i < riversData.getRowCount(); i++){
    lengths.push(riversData.get(i,3));
    areas.push(riversData.get(i,4));
    let m = {name:riversData.get(i,1), len:riversData.get(i,3), area:riversData.get(i,4)};
    nameLengths.push(m);
  }
  maxLength = max(lengths);
  minLength = min(lengths);
  maxArea = min(areas);
  minArea = max(areas);
  nameLengths.sort( (a,b) => b.len - a.len);
  areas.length =0;
/*  
More info https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
 function compareFn(a, b) {
    if (a is less than b by some ordering criterion) {
      return -1;
    } else if (a is greater than b by the ordering criterion) {
      return 1;
    }
    // a must be equal to b
    return 0;
  }
   */
  // lengthSs.sort();
angleMode(DEGREES);

}

function draw() {
  background(220);
  // Draw background grid for data
  let xMax = 390;
  let xMin = 40;
  let yMax = 200;
  let yMargin =20;
  stroke(155);
  strokeWeight(2);
  //yaxis
  line(xMin, yMax, xMin, yMargin);
  //xaxis
  line(xMin, yMax, xMax, yMax);
  strokeWeight(1);
  stroke(155);
  for (let i = 0; i < nameLengths.length; i++) {
    let x = map(i, 0, nameLengths.length-1, xMin, xMax);
    line(x, yMargin, x, yMax);
}

//y axis
push();
translate(xMin-5,yMax-yMargin);
rotate(270);
fill(0);//black text
textSize(20)
text("River Length", 0, 0);
pop();

//x axis
push();
translate(xMax/2,yMax+yMargin);
fill(0);//black text
textSize(20)
text("River name", 0, 0);
pop();

// Draw lines based on home run data
noFill();
stroke(0);
beginShape();
for(let i = 0; i < nameLengths.length; i++) {
    // Scale the mouseX value from 0 to 720 to a range between 0 and 360
    // let circleHue = map(mouseX, 0, width, 0, 360);
  let x = map(i, 0, nameLengths.length-1, xMin, xMax);
  let y = map(nameLengths[i].len, minLength, maxLength, yMax, yMargin);
  // fill(0);//black text
  //show push and pop
  push();
  translate(x-5, y);
  rotate(-20);
  let customSize = map(nameLengths[i].area,minArea,maxArea, 5, 25);
  textSize(customSize);
  text(nameLengths[i].name, 0,0);
  strokeWeight(3);
  pop();
  vertex(x, y);
}
endShape();

  //print max values
  let numVals = riversData.getRowCount();
   stroke("white");
   strokeWeight(1);
   fill(0);//black text
   textSize(50)
   text("Rows: "+numVals+"\ncol 3 is "+
    riversData.get(0,3), 5, 300);
    //header as first row
    //cols starts counting from 0;
}


/* We started with primitives. In this case, the
word primitive means a single piece of data. For instance, a variable
might hold a number or a string.

An array is created to store a list of elements within a single variable
name. For instance, Example 11-7 on page 171 stores hundreds
of numbers that are used to set the stroke value of lines. 

An object is a variable that holds a collection of related variables
and functions.

Variables and objects can be defined within the code, but they
can also be loaded from a file in the sketch folder. The examples
that follow in this chapter will demonstrate this.
*/

//1.understand csv
//read into arays
//axis+grids
//draw--> sort
//objs for label