var fg, slider, slider_bt;

window.onload = function(e) {
    fg = document.getElementById("fg");
    slider = document.getElementById("slider");
    slider_bt = document.getElementById("sliderBt");
}

function moveDivisor() {
    fg.style['width'] = slider.value+"%";
    slider_bt.style['left'] = "calc("+slider.value+"% - 18px)";
}
