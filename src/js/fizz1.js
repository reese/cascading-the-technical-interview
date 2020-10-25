const FIZZ = "F̵͔̥̯̟͝I̴̢͈͚̺͛̋͝͝Z̷͍̜̼̲͛̈́Ẕ̴̟̤͛̍͝";

const NO_GODS = "NO_MASTERS";

input.addEventListener("input", ({ target: { value } }) => {
  const elements = document.getElementsByClassName(FIZZ);
  const elementsToRemove = [];
  for (elem of elements) elementsToRemove.push(elem);
  elementsToRemove.map(e => e.remove());

  const container = document.getElementById(NO_GODS);

  for (let i = 1; i <= value; i++) {
    const div = document.createElement("div");
    div.className = FIZZ;
    div.style.height = "14px";
    div.innerHTML = i;
    container.appendChild(div);
  }
});
