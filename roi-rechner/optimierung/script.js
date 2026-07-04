// Optimierungs-Sheet: Accordion + Tag-Filter

document.querySelectorAll('.opt-item-head').forEach(head => {
  head.addEventListener('click', () => {
    const item = head.closest('.opt-item');
    const body = item.querySelector('.opt-item-body');
    const isOpen = item.classList.contains('open');
    item.classList.toggle('open', !isOpen);
    body.hidden = isOpen;
  });
});

const filterBtns = document.querySelectorAll('.opt-filter');
const items = document.querySelectorAll('.opt-item');
const emptyMsg = document.querySelector('.opt-empty');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    let visibleCount = 0;

    items.forEach(item => {
      const tags = item.dataset.tags.split(' ');
      const show = filter === 'all' || tags.includes(filter);
      item.hidden = !show;
      if (show) visibleCount++;
    });

    emptyMsg.hidden = visibleCount > 0;
  });
});
