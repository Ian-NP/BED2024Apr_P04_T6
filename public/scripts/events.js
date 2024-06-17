window.onload = function() {
    var buttons = document.querySelectorAll("#Tag-Buttons button");
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function() {
            this.classList.toggle('clicked');
        });
    }
};