var fg, slider, slider_bt;

function moveDivisor(id) {
    slider = document.getElementById("slider" + id);
    slider_bt = document.getElementById("sliderBt" + id);
    fg = document.getElementById("fg" + id);

    fg.style['width'] = slider.value+"%";
    slider_bt.style['left'] = "calc("+slider.value+"% - 18px)";
}
