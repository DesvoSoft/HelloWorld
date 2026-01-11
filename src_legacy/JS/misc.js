// Username input

//document.getElementById("myH1").textContent = "Hello";

document.getElementById("submitBtn").onclick = function(){
    username = document.getElementById("myText").value;
    document.getElementById("myH1").textContent = `Hello ${username}`;
    document.getElementById("myP").textContent = `The purpose of this page is to experiment with JS`;
}

// Random number generator
let randomNum = Math.floor(Math.random() * 100) + 1;

// Counter

const decreaseBtn = document.getElementById("decreaseBtn");
const resetBtn = document.getElementById("resetBtn");
const increaseBtn = document.getElementById("increaseBtn");
const countLabel = document.getElementById("countLabel");

let count = 0;
count = randomNum;

countLabel.textContent = count

increaseBtn.onclick = function(){
    count++;
    countLabel.textContent = count;
};

decreaseBtn.onclick = function(){
    count--;
    countLabel.textContent = count;
};

resetBtn.onclick = function(){
    count = 0;
    countLabel.textContent = count;
};

