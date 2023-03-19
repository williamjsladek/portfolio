let numbers = [];
let numbers_state = [];
let done = false;

var content = document.getElementById("sudoku_content");

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
    sudokuStep(index);
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
    done = false;
    init_numbers();
    make_solution();
    content.innerHTML = "";
    for (i = 0; i < 81; i++) {
        content.innerHTML += numbers[i].value + " ";
        if (findColumn(i) == 8) {
            content.innerHTML += "<br>";
        }
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