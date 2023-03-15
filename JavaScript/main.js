var nav = document.getElementById("nav");
var navContent = document.getElementById("nav-content");
var menuIcon = document.getElementById("menu-icon");
// nav.onload = togglehiddenNav();
menuIcon.addEventListener("click", togglehiddenNav);

function togglehiddenNav() {
    nav.classList.toggle("collapsed");
    menuIcon.classList.toggle("menu-icon-toggle");
}