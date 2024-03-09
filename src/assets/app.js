import './style.css';
import './ispconfig.js';
import './responsive.js';
import Alpine from "alpinejs";
import Tooltip from "@ryangjchandler/alpine-tooltip";

Alpine.plugin(Tooltip);

window.Alpine = Alpine;
window.Alpine.start();
