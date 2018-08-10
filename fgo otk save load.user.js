// ==UserScript==
// @name         fgo otk save load
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://f23ko.com/program/final_otk.html
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

function saveBox() {
    $("#box-svt input[type='text']").each(function (index, t ){
        t.setAttribute("value", t.value);
    });

    $("#box-svt input[type='number']").each(function (index, t ){
        t.setAttribute("value", t.value);
    });

    $("#box-svt select").each(function (index, t ){
        t.setAttribute("selectedIndex", t.selectedIndex);
    });

    $("#box-craft input[type='text']").each(function (index, t ){
        t.setAttribute("value", t.value);
    });

    $("#box-craft input[type='number']").each(function (index, t ){
        t.setAttribute("value", t.value);
    });

    $("#box-craft select").each(function (index, t ){
        t.setAttribute("selectedIndex", t.selectedIndex);
    });

    $("#box-team input[type='text']").each(function (index, t ){
        t.setAttribute("value", t.value);
    });

    $("#box-team input[type='number']").each(function (index, t ){
        t.setAttribute("value", t.value);
    });

    $("#box-team select").each(function (index, t ){
        t.setAttribute("selectedIndex", t.selectedIndex);
    });

    localStorage.setItem("box-svt", $("#box-svt")[0].innerHTML);
    localStorage.setItem("box-craft", $("#box-craft")[0].innerHTML);
    localStorage.setItem("box-team", $("#box-team")[0].innerHTML);

    alert("save ok");
}

function loadBox() {
    $("#box-svt")[0].innerHTML = localStorage.getItem("box-svt");
    $("#box-craft")[0].innerHTML = localStorage.getItem("box-craft");
    $("#box-team")[0].innerHTML = localStorage.getItem("box-team");

    $("#box-svt input[type='text']").each(function (index, t ){
        t.value = t.getAttribute("value");
    });

    $("#box-svt input[type='number']").each(function (index, t ){
        t.value = t.getAttribute("value");
    });

    $("#box-svt select").each(function (index, t ){
        t.selectedIndex = t.getAttribute("selectedIndex");
    });

    $("#box-craft input[type='text']").each(function (index, t ){
        t.value = t.getAttribute("value");
    });

    $("#box-craft input[type='number']").each(function (index, t ){
        t.value = t.getAttribute("value");
    });

    $("#box-craft select").each(function (index, t ){
        t.selectedIndex = t.getAttribute("selectedIndex");
    });

    $("#box-team input[type='text']").each(function (index, t ){
        t.value = t.getAttribute("value");
    });

    $("#box-team input[type='number']").each(function (index, t ){
        t.value = t.getAttribute("value");
    });

    $("#box-team select").each(function (index, t ){
        t.selectedIndex = t.getAttribute("selectedIndex");
    });

    alert("load ok");
}


var buttonDiv = document.createElement("div");

var saveButton = document.createElement("button");
saveButton.innerHTML = "save";

var loadButton = document.createElement("button");
loadButton.innerHTML = "load";

buttonDiv.appendChild(saveButton);
buttonDiv.appendChild(loadButton);

document.body.appendChild(buttonDiv);
buttonDiv.style.position = 'absolute';
buttonDiv.style.top = 0;

saveButton.addEventListener ("click", saveBox);
loadButton.addEventListener ("click", loadBox);


})();