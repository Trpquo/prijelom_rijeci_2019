let width, height;
let c, ctx, txt = "", settings = {}, box;
const step = 25;

function showGrid(col) {
    ctx.save();
    ctx.strokeStyle = col;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(step, step);
    ctx.lineTo(step, height - step);
    ctx.lineTo(width - step, height - step);
    ctx.stroke();
    ctx.font = "10px Tahoma";
    let i = step;
    while (i < width - step || i < height - step) {
        if (i < height - step) {
            ctx.textAlign = "right"
            ctx.fillText(String(i), step - 7, i + 5);
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(step - 5, i);
            ctx.lineTo(step + 5, i);
            ctx.stroke();

            ctx.lineWidth = 0.25;
            ctx.moveTo(step + 5, i);
            ctx.lineTo(width - step, i)
            ctx.stroke();
        }
        if (i < width - step) {
            ctx.textAlign = "center";
            ctx.fillText(String(i), i, height - step + 15);
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(i, height - step - 5);
            ctx.lineTo(i, height - step + 5);
            ctx.stroke();

            ctx.lineWidth = 0.25;
            ctx.moveTo(i, height - step + 5);
            ctx.lineTo(i, step)
            ctx.stroke();
        }

        i += step;
    }
    ctx.closePath();
    ctx.restore();
}

function drawing() { 
    box.print();
}

function calcSize() {
    height = window.innerHeight;
    width = document.getElementById("prijelom").offsetWidth;
    c.width = width;
    c.height = height;
    // console.log("Calculating settings", "\nWidth:", width, "px");
    settings = getSettings();
    if (box) {
        box.updateSettings(settings);
    }
    else {
        box = new TextBox(text=txt, x=50, y=50, settings);
    }
    ctx.draw();
}

function calcText() {
    txt = getText();

    if (box) {
        box.updateText(txt);
    }
    ctx.draw();
}

function getSettings() {
    let form = document.getElementById("unos");
    let postavke = {};
    
    let inputs = form.getElementsByTagName("input");

    for (i in inputs) {
        if (inputs[i].type && inputs[i].name) {
            if (inputs[i].type === "checkbox") {
                postavke[inputs[i].name] = inputs[i].checked;
            }
            else if (inputs[i].type === "radio") {
                if (inputs[i].checked) {
                    postavke[inputs[i].name] = inputs[i].value;
                }
            }
            else if (inputs[i].name === "wdth" || inputs[i].name === "hght") {
                postavke[inputs[i].name] = inputs[i].value;                
            }
            else {
                postavke[inputs[i].name] = parseFloat(inputs[i].value);
            }
        }
    }
    postavke["ffamily"] = document.getElementById("ffamily").value;

    return postavke;
}

function getText() {
    return window.txt.value;
}

function attachListeners() {
    window.onresize = ctx.calcSize;
    window.txt.onkeyup = ctx.calcText;

    let inputs = document.getElementsByTagName("input");

    for (i in inputs) {
        if (inputs[i].name) {
            inputs[i].onchange = ctx.calcSize;
        }
    }

    document.getElementById("ffamily").onchange = ctx.calcSize;

}

document.onload = function() {
    c = document.getElementById("prikaz");
    ctx = c.getContext("2d");
    ctx.showGrid = showGrid;
    ctx.calcSize = calcSize;
    ctx.calcText = calcText;
    ctx.draw = drawing;
    ctx.calcSize();
    ctx.calcText();
    attachListeners();
}();
