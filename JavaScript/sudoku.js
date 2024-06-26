let cells = [];
let numbers = [];
let numbers_state = [];
let given_number_indexes = [];
let done = false;
let difficulty = {current: 63, name: "an Easy", easy: 63, medium: 53, hard: 44, veryHard: 35, exHard: 28, impossible: 19};

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
            let gentime = performance.now();
            generate_puzzle();
            let gentimeEnd = performance.now();
            console.log("gen exe time:", gentimeEnd - gentime, "ms,", (gentimeEnd - gentime)/ 1000, "s");
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
    } else if (diff == 5) {
        difficulty.current = difficulty.impossible;
        difficulty.name = "an Impossible";
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

function generate_puzzle_step() {
    // stop if remaining indexes is less than or equal to difficulty
    if (given_number_indexes.length < difficulty.current) {
        return true;
    }

    // generate a list to remove pairs of indexes from the remaining indexes
    let index_list = JSON.parse(JSON.stringify(given_number_indexes));
    shuffle(index_list);
    let paired_index_set = new Set;
    for (let i = 0; i < index_list.length; i++) {
        let item = [0 + index_list[i], 80 - index_list[i]].sort((a, b) => a - b);
        if (!paired_index_set.has(item)) {
            paired_index_set.add(item);
        }
    }

    //remove it and the inverse (80 - picked)
    // must be able to then pick the next pair in the list
    let paired_index_list = Array.from(paired_index_set);

    while (paired_index_list.length > 0) {
        let item = paired_index_list[0];
        // console.log(item);

        //removes the first pair
        given_number_indexes.splice(given_number_indexes.indexOf(item[0]), 1);

        // in the case of item [40, 40]
        // if gni contains the second index, remove it
        if (given_number_indexes.includes(item[1])) {
            given_number_indexes.splice(given_number_indexes.indexOf(item[1]), 1);
        }

        for (let i = 0; i < 81; i++) {
            if (given_number_indexes.indexOf(i) > -1) {
                cells[i] = numbers[i].value;
            } else {
                cells[i] = 0;
            }
        }
        
        let validPerformStart = performance.now();
        // validator
        if (is_valid(0, 0) == 1) {
            let validPerformEnd = performance.now();
            console.log("valid success exe time:", validPerformEnd -validPerformStart, "ms," , (validPerformEnd -validPerformStart) / 1000, "s");
            if (generate_puzzle_step()) {
                return true;
            }
        } else {
            let validPerformEnd = performance.now();
            console.log("valid fail exe time:", validPerformEnd -validPerformStart, "ms," , (validPerformEnd -validPerformStart) / 1000, "s");
        }

        given_number_indexes.push(item[0]);

        if (!given_number_indexes.includes(item[1])) {
            given_number_indexes.push(item[1]);
        }

        paired_index_list.splice(paired_index_list.indexOf(item), 1);
    }

}

function generate_puzzle() {
    for (let i = 0; i < 81; i++) {
        given_number_indexes[i] = i;
    }

    generate_puzzle_step();


    //reference code for generating puzzles given a solution
    /*
    while (true) {
        for (let i = 0; i < 81; i++) {
            given_number_indexes[i] = i;
        }

        let removed_number_indexes = [];
        let pick_from_indexes = [];

        for (let i = 0; i < 81; i++) {
            pick_from_indexes[i] = i;
        }

        while (removed_number_indexes.length < 9) {
            let i = Math.floor(Math.random() * pick_from_indexes.length);
            removed_number_indexes[removed_number_indexes.length] = pick_from_indexes[i];
            
            for (let j = 0; j < 81; j++) {
                if (pick_from_indexes.indexOf(j) != -1) {
                    if (findRow(j) == findRow(removed_number_indexes[removed_number_indexes.length - 1])) {
                        pick_from_indexes.splice(pick_from_indexes.indexOf(j), 1);
                    } else if (findColumn(j) == findColumn(removed_number_indexes[removed_number_indexes.length - 1])) {
                        pick_from_indexes.splice(pick_from_indexes.indexOf(j), 1);
                    } else if (find3x3(j) == find3x3(removed_number_indexes[removed_number_indexes.length - 1])) {
                        pick_from_indexes.splice(pick_from_indexes.indexOf(j), 1);
                    }
                }
            }
        }

        for (let i = 0; i < 9; i++) {
            removed_number_indexes[i + 9] = 80 - removed_number_indexes[i];
        }

        removed_number_indexes = [...new Set(removed_number_indexes)];
        removed_number_indexes.sort((a, b) => a - b);

        for (let i = 0; i < removed_number_indexes.length; i++) {
            given_number_indexes.splice(given_number_indexes.indexOf(removed_number_indexes[i]), 1);
        }

        for (let i = removed_number_indexes.length; i < 81 - difficulty.current; i += 2) {
            let j1 = Math.floor(Math.random() * given_number_indexes.length);
            j1 = given_number_indexes[j1];
            j2 = 80 - j1;
            given_number_indexes.splice(given_number_indexes.indexOf(j1), 1);
            given_number_indexes.splice(given_number_indexes.indexOf(j2), 1);
        }

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
    */
}

function is_valid(index, count) {
    if (index == 81) {
        return (count + 1);
    } else if (count > 1) {
        return count;
    }
    
    if (cells[index] != 0) {
        return is_valid(index + 1, count);
    }

    for (let val = 1; val <= 9 && count < 2; val++) {
        if (legal_val(index, val)) {
            cells[index] = val;
            count = is_valid(index + 1, count);
            if (count > 1) {
                return count;
            }
        }
    }

    cells[index] = 0;
    return count;
}

function is_validV2() {
    // objetive is to make a more space complex alogirthm rather than a brute force algorithm
    // idea 1: instead of an array of 81, have a 3d array of 9 by 9 by 9 with all possible values
    // -- first two dimentions are the column and row indexes
    // -- last dimention is a list of 1 to 9, represents possible values
    // -- main function: start with indexes that have the smallest number of possible values
    // -- -- 
    
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

function randomInt(int) {
    return Math.floor(Math.random() * int);
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
        randIndex = randomInt(index);
        index--;
        [array[index], array[randIndex]] = [array[randIndex], array[index]];
    }

    return array;
}