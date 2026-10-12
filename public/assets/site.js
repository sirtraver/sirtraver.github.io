(()=>{const path=location.pathname;for(const a of document.querySelectorAll('nav a'))if(path.startsWith(a.getAttribute('href')))a.setAttribute('aria-current','page')})();
