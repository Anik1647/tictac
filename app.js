let boxes = document.querySelectorAll(".box");
let resetBtn = document.querySelector("#reset-btn");
let turn0 = true; // true -> O's turn, false -> X's turn

// All possible winning patterns
const winPatterns = [
    [0, 1, 2],
    [0, 3, 6],
    [0, 4, 8],
    [1, 4, 7],
    [2, 5, 8],
    [2, 4, 6],
    [3, 4, 5],
    [6, 7, 8]
];

// Add click event to all boxes
boxes.forEach((box) => {
    box.addEventListener("click", () => {
        if (box.innerText === "") {   // prevent overwriting
            if (turn0) {
                box.innerText = "O";
                turn0 = false;
            } else {
                box.innerText = "X";
                turn0 = true;
            }
        }
        checkWinner();
    });
});

// Function to check winner
function checkWinner() {
    for (let pattern of winPatterns) {
        let pos1 = boxes[pattern[0]].innerText;
        let pos2 = boxes[pattern[1]].innerText;
        let pos3 = boxes[pattern[2]].innerText;

        if (pos1 !== "" && pos1 === pos2 && pos2 === pos3) {
            alert(`${pos1} wins! 🎉`);
            disableBoxes();
            return;
        }
    }
    // Check for draw
    if ([...boxes].every(box => box.innerText !== "")) {
        alert("It's a Draw! 🤝");
    }
}

// Disable all boxes after game ends
function disableBoxes() {
    boxes.forEach(box => box.style.pointerEvents = "none");
}

// Reset Game
resetBtn.addEventListener("click", () => {
    boxes.forEach(box => {
        box.innerText = "";
        box.style.pointerEvents = "auto";
    });
    turn0 = true;
});
