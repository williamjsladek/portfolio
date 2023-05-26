let cells = [];
let numbers = [];
let numbers_state = [];
let given_number_indexes = [];
let done = false;
let difficulty = {current: 63, name: "an Easy", easy: 63, medium: 53, hard: 44, veryHard: 35, exHard: 28};

var content = document.getElementById("sudoku_content");
var win_box = document.getElementById("win_box");
var error_box = document.getElementById("not_done_box");
var diff_menu = document.getElementById("difficulty_menu");
var selected = document.getElementsByClassName("selected");

new_game = () => {
    hide_results();
    content.innerHTML = "<div>Loading Solution</div>";
    setTimeout(function () {
        content.innerHTML = "<div>Generating " + difficulty.name + " Puzzle, Please wait.</div>";
        init_numbers();
        make_solution();
        setTimeout(function () {
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
        }, 750);
    }, 500);
    
}

reset_game = () => {
    hide_results();
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
    hide_results();

    if (selected.length == 0) {
        return;
    } else if (selected.item(0).innerHTML == num) {
        selected.item(0).innerHTML = "";
    } else {
        selected.item(0).innerHTML = num;
    }

    for (let i = 0; i < content.children.length; i++) {
        let row = content.children[i];
        for (let j = 0; j < row.children.length; j++) {
            let element = row.children[j];
            if (element.innerHTML == "") {
                return;
            }
        }
    }

    check_solution();
}

set_difficulty = (diff) => {
    for (let i = 0; i < diff_menu.children.length; i++) {
        diff_menu.children[i].classList.remove("difficulty");
        if (i == diff) {
            diff_menu.children[i].classList.add("difficulty");
        }
    }

    if (diff == 1) {
        difficulty.current = difficulty.medium;
        difficulty.name = "a Medium";
    } else if (diff == 2) {
        difficulty.current = difficulty.hard;
        difficulty.name = "a Hard";
    } else if (diff == 3) {
        difficulty.current = difficulty.veryHard;
        difficulty.name = "a Very Hard";
    } else if (diff == 4) {
        difficulty.current = difficulty.exHard;
        difficulty.name = "an Extremely Hard";
    } else {
        difficulty.current = difficulty.easy;
        difficulty.name = "an Easy";
    }
}

function init_numbers() {
    for (i = 0; i < 81; i++) {
        numbers[i] = JSON.parse(JSON.stringify({value: 0, possibleValues: shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])}));
    }

    numbers_state[0] = JSON.parse(JSON.stringify(numbers));
}

function make_solution() {
    done = false;
    sudokuStep(0);
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

function generate_puzzle() {
    while (true) {
        for (let i = 0; i < 81; i++) {
            given_number_indexes[i] = i;
        }

        shuffle(given_number_indexes);

        given_number_indexes.splice(Math.floor(Math.random() * difficulty.current), (81 - difficulty.current));
        given_number_indexes.sort((a, b) => a - b);
        cells = [];

        for (let i = 0; i < 81; i++) {
            if (given_number_indexes.indexOf(i) > -1) {
                cells[i] = numbers[i].value;
            } else {
                cells[i] = 0;
            }
        }
        
        if (is_valid(0, 0) == 1) {
            break;
        }
    }
}

function is_valid(index, count) {
    if (index == 81) {
        return (count + 1);
    }
    
    if (cells[index] != 0) {
        return is_valid(index + 1, count);
    }

    for (let val = 1; val <= 9 && count < 2; val++) {
        if (legal_val(index, val)) {
            cells[index] = val;
            count = is_valid(index + 1, count);
        }
    }

    cells[index] = 0;
    return count;
}

function legal_val(index, val) {
    for (let k = 0; k < 81; k++) {
        if (cells[k] == val && (
                k == index ||
                findRow(k) == findRow(index) ||
                findColumn(k) == findColumn(index) ||
                find3x3(k) == find3x3(index)
            )
        ) {
            return false;
        }
    }
    return true;
}

function check_solution() {
    for (let i = 0; i < content.children.length; i++) {
        let row = content.children[i];
        for (let j = 0; j < row.children.length; j++) {
            let element = row.children[j];
            if (element.innerHTML != numbers[(i * 9) + j].value) {
                return show_fail();
            }
        }
    }

    show_success();
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

function hide_results() {
    win_box.classList.remove("show");
    error_box.classList.remove("show");
}

function show_fail() {
    error_box.classList.add("show");
}

function show_success() {
    win_box.classList.add("show");
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