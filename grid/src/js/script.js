import {Grid} from "../compjs/js/grid.js";
import {CompJS} from "../compjs/js/compjs.js";
import {COMPJS_SELECTORS, COMPJS_VARIABLES} from "../compjs/js/compjs-props.js";


// Add grid to page
const compjs = new CompJS("src/compjs");

const grid1 = new Grid(1);
const grid2 = new Grid(2);

fetch("src/json/grid-data-1.json")
    .then(response => response.json())
    .then(json => grid1.loadJSON(json))
    .then(() => grid1.addLockIcon())
    .then(() => fetch("src/json/grid-data-2.json"))
    .then(response => response.json())
    .then(json => grid2.loadJSON(json))
    .then(() => grid2.addLockIcon())
    .catch(error => console.error(error));

