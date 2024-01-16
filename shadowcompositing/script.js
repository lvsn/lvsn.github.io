var mybutton;

window.onload = function() {
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
      return new bootstrap.Popover(popoverTriggerEl)
    })

    mybutton = document.getElementById("btn-back-to-top");
    mybutton.addEventListener("click", backToTop);

    window.onscroll = function () {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            mybutton.style.display = "block";
          } else mybutton.style.display = "none";
    };
}

function backToTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

var fg, slider, slider_bt;
function moveDivisor(id) {
    slider = document.getElementById("slider" + id);
    slider_bt = document.getElementById("sliderBt" + id);
    fg = document.getElementById("fg" + id);

    fg.style['width'] = slider.value+"%";
    slider_bt.style['left'] = "calc("+slider.value+"% - 18px)";
}
