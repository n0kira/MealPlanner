document.querySelectorAll('.page-container ul li a').forEach(link => {
  link.addEventListener('click', (e) => {
    document.getElementById('menu-toggle').checked = false;
    document.querySelectorAll(`.view`).forEach(view => {
      view.classList.add('hidden');
    });

    const id = link.getAttribute('data-target');
    document.getElementById(id).classList.remove('hidden');
    document.getElementById('title').textContent = link.textContent;
  });
});
