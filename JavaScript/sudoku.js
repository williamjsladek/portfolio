let numbers = [];
let numbers_state = [];
let current_solution = [];
let given_number_indexes = []; // should be length 53
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

let cells = [];

function generate_puzzle() {
    while (true) {
        for (let i = 0; i < 81; i++) {
            given_number_indexes[i] = i;
        }

        shuffle(given_number_indexes);
        given_number_indexes.splice(Math.floor(Math.random() * 53), 28);
        given_number_indexes.sort((a, b) => a - b);
        cells = [];
        for (let i = 0; i < 81; i++) {
            if (given_number_indexes.indexOf(i) > -1) {
                cells[i] = numbers[i].value;
            } else {
                cells[i] = 0;
            }
        }
        
        if (is_valid(0, 0, 0) == 1) {
            break;
        }
    }
}

function is_valid(i, j, count) {
    if (((i * 9) + j) >= 81) {
        return (count + 1);
    }
    
    if (cells[(i * 9) + j] != 0) {
        if (j == 9) {
            return is_valid(i + 1, j - 9, count);
        } else {
            return is_valid(i, j + 1, count);
        }
    }

    for (let val = 1; val <= 9 && count < 2; val++) {
        if (legal_val(i, j, val)) {

            cells[(i * 9) + j] = val;
            if (j == 9) {
                count = is_valid(i + 1, j - 9, count);
            } else {
                count = is_valid(i, j + 1, count);
            }
        }
    }

    cells[(i * 9) + j] = 0;
    return count;
    
}

function legal_val(i, j, val) {
    for (let k = 0; k < 81; k++) {
        if (cells[k] == val && (
                findRow(k) == i ||
                findColumn(k) == j ||
                find3x3(k) == find3x3((i * 9) + j)
            )
        ) {
            return false;
        }
    }

    return true;
}

new_game = () => {
    init_numbers();
    make_solution();
    generate_puzzle();
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
            let classList = "cell d-flex", value = "";
            if (j == 2 || j == 5) {
                classList += " box_right";
            }
            
            if (given_number_indexes.indexOf((i * 9) + j) > -1) {
                classList += " cToSea";
                value = numbers[(i * 9) + j].value;
            }
            
            str += "<div class=\"" + classList + "\" onclick=\"select_cell(" + ((i * 9) + j) + ")\">" + value + "</div>";
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

            if (given_number_indexes.indexOf((i * 9) + j) > -1) {
                element.innerHTML = numbers[(i * 9) + j].value;
            } else {
                element.innerHTML = "";
            }
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
            } else if (((i * 9) + j) == index && !element.classList.contains("cToSea")) {
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
    // if ever cell has a number
    // check_solution();
    //}
}

function check_solution() {

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