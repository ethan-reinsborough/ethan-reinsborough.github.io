// Tab Switching Logic
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Remove active class from all tabs and content
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));

    // Add active class to the clicked tab and corresponding content
    tab.classList.add('active');
    const tabId = tab.getAttribute('data-tab');
    document.getElementById(tabId).classList.add('active');
  });
});

// Server Status Toggle Logic
const toggleButtons = document.querySelectorAll('.toggle-status');

toggleButtons.forEach(button => {
  button.addEventListener('click', () => {
    const status = button.getAttribute('data-status');
    const light = document.querySelector(`.status-light[data-status="${status}"]`);
    light.classList.toggle('red');
    light.classList.toggle('green');
  });
});