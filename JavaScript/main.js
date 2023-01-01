var nav = document.getElementById("nav");
var navContent = document.getElementById("nav-content");
var menuIcon = document.getElementById("menu-icon");
// nav.onload = togglehiddenNav();
menuIcon.addEventListener("click", togglehiddenNav);

function togglehiddenNav() {
    // console.log("test");
    nav.classList.toggle("collapsed");
    // nav.classList.toggle("cToGrey-bcToJet");
    menuIcon.classList.toggle("menu-icon-toggle");
    // menuIcon.classList.toggle("cToGrey-bcToJet");
    // navContent.classList.toggle("hidden");
}