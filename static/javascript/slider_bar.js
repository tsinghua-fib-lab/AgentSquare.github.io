
document.getElementById('sidebar-toggle').addEventListener('mouseenter', function() {
    var sidebar = document.getElementById('sidebar');
    sidebar.style.left = '0px';
    this.style.left = '145px';
});


document.addEventListener('mousemove', function(event) {
    var sidebar = document.getElementById('sidebar');
    var toggle = document.getElementById('sidebar-toggle');

    if (!sidebar.contains(event.target) && !toggle.contains(event.target)) {
        sidebar.style.left = '-144px';
        toggle.style.left = '0px';
    }
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
            var offsetTop = document.getElementById('nav').offsetHeight;

            var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offsetTop * 1.5;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

