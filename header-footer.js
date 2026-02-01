(function () {
  var header = document.querySelector('.dr-header');
  if (!header) return;

  var toggle = header.querySelector('.dr-header-toggle');
  var navList = header.querySelector('.dr-nav-list');
  if (!toggle || !navList) return;

  toggle.addEventListener('click', function () {
    var isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isExpanded));
    header.classList.toggle('dr-header--open', !isExpanded);
  });
})();