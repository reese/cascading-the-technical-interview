const FIZZ = "F̵͔̥̯̟͝I̴̢͈͚̺͛̋͝͝Z̷͍̜̼̲͛̈́Ẕ̴̟̤͛̍͝";

const NO_MASTERS = "N̶̮̐͐̚Ó̵͕̖̏͑̿_̷̳͍͛̔̑͌M̶̛̼̜̆͂A̸̛̦͝Ş̸̠̥͆̀T̶̰͙̼̘̔̌̑́Ė̶͍̒͋Ȑ̵͈̻S̷̩̟͔̓̀̀";

input.addEventListener('input', ({ target: { value } }) => {
    const elements = document.getElementsByClassName(FIZZ);
    const elementsToRemove = []
    for (elem of elements)
        elementsToRemove.push(elem);
    elementsToRemove.map(e => e.remove());

    const container = document.getElementById(NO_MASTERS);

    for (let i = 0; i < value; i++) {
        const div = document.createElement('div');
        div.className = FIZZ;
        div.style.height = '14px';
        div.innerHTML = i;
        container.appendChild(div);
    }
});

