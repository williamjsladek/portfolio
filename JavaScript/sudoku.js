let cells = [];
let numbers = [];
let numbers_state = [];
let given_number_indexes = [];
let done = false;
let difficulty = {current: 63, name: "an Easy", easy: 63, medium: 53, hard: 44, veryHard: 36, exHard: 30, impossible: 19};
let note_mode = false;
let selected_number_input = 0;

var content = document.getElementById("sudoku_content");
var win_box = document.getElementById("win_box");
var error_box = document.getElementById("not_done_box");
var diff_menu = document.getElementById("difficulty_menu");
var note_button = document.getElementById("note_toggle");
var game_bar = document.getElementById("new_game_acions");
var selected = document.getElementsByClassName("selected");

new_game = () => {
    if (note_mode == true) {
        toggleNoteMode();
    }

    selectNumber(selected_number_input);
    hide_results();
    content.innerHTML = "<div>Loading Solution</div>";

    setTimeout(function () {    
        game_bar.classList.add("hidden");
    }, 0);

    setTimeout(function () {

        content.innerHTML = "<div>Generating " + difficulty.name + " Puzzle, Please wait.</div>";
        init_numbers();
        make_solution();
        setTimeout(function () {
            let gentime = performance.now();
            generate_puzzle();
            let gentimeEnd = performance.now();
            console.log("gen exe time:", gentimeEnd - gentime, "ms,", (gentimeEnd - gentime)/ 1000, "s");
            
            // create new sudoku grid
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
                    let classList = "cell", value = "";
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

                if (game_bar.classList.contains("hidden")) {
                    game_bar.classList.remove("hidden");
                }
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
    
    if (note_mode == true) {
        toggleNoteMode();
    }

    selectNumber(selected_number_input);
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

    if (selected_number_input != 0) {
        inputNumber(selected_number_input);
    }
}

inputNumber = (num) => {
    hide_results();

    // if no cell is selected do nothing
    if (selected.length == 0) {
        return;

    // entering a number. If its the number in the cell, empy it
    } else if (note_mode == false && selected.item(0).innerHTML == num) {
        selected.item(0).innerHTML = "";

    // entering a number. Regardless of the contents of the cell, make the contents the number
    } else if (note_mode == false) {
        selected.item(0).innerHTML = num;


    // if there is a note grid:
    //      check to see if the number we want to note is already there
    //          if it is, remove it
    //          if is is not, add it


    // entering a note.
    // if there is a number where we want to put a note, do nothing
    } else if (note_mode == true) {
        if (selected.item(0).innerHTML.length == 1) {
            return;
        }
    // if there is no note_grid, i.e. empty cell but we want to enter a note:
    //      create a div and give it the class note_grid
    //      create the 3x3 note grid
        if (selected.item(0).hasChildNodes() == false) {
            let temp_note_grid = document.createElement("div");
            temp_note_grid.classList.add("note_grid");
            for (let i = 1; i <= 9; i++) {
                let temp_note_class_name = "note_" + i;
                let temp_note_node = document.createElement("div");
                temp_note_node.classList.add(temp_note_class_name);
                temp_note_grid.appendChild(temp_note_node);
            }


            selected.item(0).appendChild(temp_note_grid);
        }

    // make sure the noe grid exists, then remove/add the number we want to note respectively
        if (selected.item(0).firstElementChild.classList.contains("note_grid")) {
            if (selected.item(0).firstElementChild.children.item(num - 1).innerHTML == num) {
                selected.item(0).firstElementChild.children.item(num - 1).innerHTML = "";
            } else {
                selected.item(0).firstElementChild.children.item(num - 1).innerHTML = num;
            }
        }
    }


    // end function if there are any empty cells
    // NEED TO FIX TO ALLOW FOR NOTES
    // --- a cell with notes should also execute a return
    for (let i = 0; i < content.children.length; i++) {
        let row = content.children[i];
        for (let j = 0; j < row.children.length; j++) {
            let element = row.children[j];
            if (element.innerHTML == "") {
                return;
            }
            // returns if the first child has a class called note_grid
            // it will if there are notes
            if (element.innerHTML.includes("note_grid")) {
                console.log("hit note");
                
                return;
            }
        }
    }

    check_solution();
}

selectNumber = (num) => {
    if (num == 0) {
        return;
    }

    // if no number input is currently selected:
    // add class to the selected input number
    // set selected number input to selected number
    if (selected_number_input == 0) {
        document.getElementById("input_number_" + num).classList.add("input_number_active");
        selected_number_input = num;
        return;
    }

    // if the number clicked is different from the currently selected input number
    // remove class from old input number
    // add class to new input number
    // set selected number input to selected number
    if (selected_number_input != num) {
        if (document.getElementById("input_number_" + selected_number_input).classList.contains("input_number_active")) {
            document.getElementById("input_number_" + selected_number_input).classList.remove("input_number_active");
        }

        document.getElementById("input_number_" + num).classList.add("input_number_active");
        selected_number_input = num;
        return;
    }

    // if the number clicked is the same as the current input number, toggle it off and set number input to 0
    // remove class from the old input number
    // set selected number input to 0
    if (selected_number_input == num) {
        if (document.getElementById("input_number_" + selected_number_input).classList.contains("input_number_active")) {
            document.getElementById("input_number_" + selected_number_input).classList.remove("input_number_active");
        }

        selected_number_input = 0;
        return;
    }
}

toggleNoteMode = () => {
    note_mode = !note_mode;

    if (note_mode == true && note_button.classList.contains("note_toggle_active") == false) {
        note_button.classList.add("note_toggle_active");
    } else if (note_mode == false && note_button.classList.contains("note_toggle_active") == true) {
        note_button.classList.remove("note_toggle_active");
    }
}

clearNumber = () => {
    console.log("claer hit");
    hide_results();

    if (selected.length == 0) {
        return;
    }

    selected.item(0).innerHTML = "";
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

    //remove an index and it's inverse (80 - picked)
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
            console.log("valid success exe time:", validPerformEnd - validPerformStart, "ms," , (validPerformEnd - validPerformStart) / 1000, "s");
            if (generate_puzzle_step()) {
                return true;
            }
        } else {
            let validPerformEnd = performance.now();
            console.log("valid fail exe time:", validPerformEnd - validPerformStart, "ms," , (validPerformEnd - validPerformStart) / 1000, "s");
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
    let check_row = findRow(index);
    for (let k = check_row * 9; k < (check_row * 9) + 9; k++) {
        if (cells[k] == val) {
            return false;
        }
    }

    let check_col = findColumn(index);
    for (let k = check_col; k < 81; k += 9) {
        if (cells[k] == val) {
            return false;
        }
    }

    let check_box = find3x3(index);
    for (let k = (check_box * 3) + (divide(check_box, 3) * 18); k < ((check_box * 3) + (divide(check_box, 3) * 18)) + 21; k++) {
        if (cells[k] == val) {
            return false;
        }

        if (k % 3 == 2) {
            k += 6;
        }
    }

    /**
     * 00 01 02 | 03 04 05 | 06 07 08
     * 09 10 11 | 12 13 14 | 15 16 17
     * 18 19 20 | 21 22 23 | 24 25 26
     * ------------------------------
     * 27 28 29 | 30 31 32 | 33 34 35
     * 36 37 38 | 39 40 41 | 42 43 44
     * 45 46 47 | 48 49 50 | 51 52 53
     * ------------------------------
     * 54 55 56 | 57 58 59 | 60 61 62
     * 63 64 65 | 66 67 68 | 69 70 71
     * 72 73 74 | 75 76 77 | 78 79 80
     */

    return true;
}

function check_solution() {
    console.log("check solution hit");
    
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