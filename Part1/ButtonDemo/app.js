// get hold of the element by the div tag id
const app = document.getElementById("app");

// define the function run() as an object and update some attribute related
// to the above element
window.run = () => app.innerText="Javascript in Action!";

// set the HTML pertaining to the div element; in this case, an event.
// The style of the button is managed through the accompanying CSS file
app.innerHTML = '<button onclick="run()">Load</button>';