let numbers = [];
let numbers_state = [];
let current_solution = [];
let done = false;

var content = document.getElementById("sudoku_content");
var selected = document.getElementsByClassName("selected");

function init_numbers() {
    for (i = 0; i < 81; i++) {
        numbers[i] = JSON.parse(JSON.stringify({value: 0, possibleValues: shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])}));
    }
    numbers_state[0] = JSON.parse(JSON.stringify(numbers));
}

function shuffle(array) {
    let index = array.length, randIndex;
    
    while (index != 0) {
        randIndex = Math.floor(Math.random() * index);
        index--;
        [array[index], array[randIndex]] = [array[randIndex], array[index]];
    }

    return array;
}

function make_solution() {
    var index = 0;
    done = false;
    sudokuStep(index);
    current_solution = numbers;
}

function sudokuStep(index) {
    if (index > 80) {
        return done = true;
    } else if (numbers[index].possibleValues.length == 0) {
        return false;
    } else {
        for (let i = 0; i < numbers[index].possibleValues.length; i++) {
            numbers = JSON.parse(JSON.stringify(numbers_state[index]));
            numbers[index].value = numbers[index].possibleValues[i];
            
            for (let j = index + 1; j < 81; j++) {
                if (numbers[j].possibleValues.indexOf(numbers[index].possibleValues[i]) > -1) {
                    if (findRow(index) == findRow(j)) {
                        numbers[j].possibleValues.splice(numbers[j].possibleValues.indexOf(numbers[index].possibleValues[i]), 1);
                    } else if (findColumn(index) == findColumn(j)) {
                        numbers[j].possibleValues.splice(numbers[j].possibleValues.indexOf(numbers[index].possibleValues[i]), 1);
                    } else if (find3x3(index) == find3x3(j)) {
                        numbers[j].possibleValues.splice(numbers[j].possibleValues.indexOf(numbers[index].possibleValues[i]), 1);
                    }
                }
            }

            numbers_state[index + 1] = JSON.parse(JSON.stringify(numbers));

            if (sudokuStep(index + 1)) {
                break;
            }
        }
        
        return done;
    }
}

new_game = () => {
    init_numbers();
    make_solution();
    content.innerHTML = "";
    for (let i = 0; i < 9; i ++) {
        let str = "";
        if (i == 0) {
            str += "<div class=\"top_row row\">";
        } else if (i == 2 || i == 5 || i == 8) {
            str += "<div class=\"bottom_row row\">";
        } else {
            str += "<div class=\"row\">";
        }

        for (let j = 0; j < 9; j++) {
            if (j == 2 || j == 5) {
                str += "<div class=\"cell box_right d-flex\" onclick=\"select_cell(" + ((9 * i) + j) + ")\">" + numbers[(9 * i) + j].value + "</div>";
            } else {
                str += "<div class=\"cell d-flex\" onclick=\"select_cell(" + ((9 * i) + j) + ")\">" + numbers[(9 * i) + j].value + "</div>";
            }
        }

        str += "</div>";
        content.insertAdjacentHTML('beforeend', str);
    }
}

reset_game = () => {
    for (let i = 0; i < content.children.length; i++) {
        let row = content.children[i];
        for (let j = 0; j < row.children.length; j++) {
            let element = row.children[j];
            
            if (element.classList.contains("selected")) {
                element.classList.remove("selected");
            }

            element.innerHTML = current_solution[(i * 9) + j].value;
        }
    }
}

select_cell = (index) => {
    for (let i = 0; i < content.children.length; i++) {
        let row = content.children[i];
        for (let j = 0; j < row.children.length; j++) {
            let element = row.children[j];
            if (element.classList.contains("selected") && ((i * 9) + j) != index) {
                element.classList.remove("selected");
            } else if (((i * 9) + j) == index) {
                element.classList.add("selected");
            }
        }
    }
}

inputNumber = (num) => {
    if (selected.length == 0) {
        return;
    } else {
        selected.item(0).innerHTML = num;
    }
}

function divide(num, denom) {
    return Math.floor(num / denom);
}

function findRow(index) {
    return divide(index, 9);
}

function findColumn(index) {
    return index % 9;
}

function find3x3(index) {
    return (3 * divide(divide(index, 9), 3)) + divide(index % 9, 3);
}