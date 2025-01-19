let isAdminLoggedIn = false;

document.addEventListener('DOMContentLoaded', () => {
  loadContent('biography');
});

function loadContent(section) {
  if (section === 'management') {
    loadManagementContent();
    return;
  }

  fetch(`/api/${section}`)
    .then(response => response.json())
    .then(data => {
      const mainContent = document.getElementById('main-content');
      
      if (section === 'biography') {
        mainContent.innerHTML = `<h2>${data.title}</h2><p>${data.content}</p>`;
      } else if (section === 'tables') {
        mainContent.innerHTML = '<h2>Tables</h2>' +
          data.categories.map(category => `<h3>${category}</h3><div class="flex-container">` +
          data.tables[category].map(item => `<div class="flex-item">${item}</div>`).join('') + '</div>').join('');
      } else if (section === 'reports') {
        mainContent.innerHTML = '<h2>Reports</h2>' +
          data.map(report => `<div class="report"><h3>${report.title}</h3><p>${report.content}</p>${isAdminLoggedIn ? `<button class="btn btn-danger" onclick="deleteReport('${report._id}')">Delete</button>` : ''}</div>`).join('');
      } else if (section === 'links') {
        mainContent.innerHTML = '<h2>Links</h2>' +
          data.map(link => `<div class="link"><a href="${link.url}" target="_blank">${link.url}</a><p>Category: ${link.category}</p>${isAdminLoggedIn ? `<button class="btn btn-danger" onclick="deleteLink('${link._id}')">Delete</button>` : ''}</div>`).join('');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      const mainContent = document.getElementById('main-content');
      mainContent.innerHTML = '<p>Error loading content. Please try again later.</p>';
    });
}

function loadManagementContent() {
  const mainContent = document.getElementById('main-content');

  if (isAdminLoggedIn) {
    mainContent.innerHTML = `
      <h2>Management</h2>
      <button id="logout-button" class="btn btn-primary">Logout</button>
      <div id="admin-options">
        <h3>Management Options</h3>
        <ul class="list-unstyled">
          <li><a href="#" onclick="showAdminSection('reports')">Manage Reports</a></li>
          <li><a href="#" onclick="showAdminSection('links')">Manage Links</a></li>
        </ul>
      </div>
    `;
    document.getElementById('logout-button').addEventListener('click', logout);
  } else {
    mainContent.innerHTML = `
      <h2>Management</h2>
      <form id="login-form">
        <div class="form-group">
          <label for="username">Username:</label>
          <input type="text" id="username" name="username" class="form-control" required>
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" name="password" class="form-control" required>
        </div>
        <button type="submit" class="btn btn-primary">Login</button>
      </form>
    `;
    document.getElementById('login-form').addEventListener('submit', login);
  }
}

function showTable(category) {
  fetch(`/api/tables`)
    .then(response => response.json())
    .then(data => {
      const mainContent = document.getElementById('main-content');
      mainContent.innerHTML = `<h2>${category}</h2>`;
      const tableItems = data.tables[category] || [];
      mainContent.innerHTML += `
        <div class="flex-container">
          ${tableItems.map(item => `<div class="flex-item">${item}</div>`).join('')}
        </div>
      `;
    })
    .catch(error => console.error('Error:', error));
}

function login(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        isAdminLoggedIn = true;
        loadManagementContent();
      } else {
        alert('Login failed');
      }
    })
    .catch(error => console.error('Error:', error));
}

function logout() {
  fetch('/logout', { method: 'POST' })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        isAdminLoggedIn = false;
        loadManagementContent();
      }
    })
    .catch(error => console.error('Error:', error));
}

function showAdminSection(section) {
  const mainContent = document.getElementById('main-content');
  if (section === 'reports') {
    mainContent.innerHTML = `
      <h3>Manage Reports</h3>
      <form id="report-form">
        <div class="form-group">
          <label for="report-title">Title:</label>
          <input type="text" id="report-title" name="title" class="form-control" required>
        </div>
        <div class="form-group">
          <label for="report-content">Content:</label>
          <textarea id="report-content" name="content" class="form-control" required></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Add Report</button>
      </form>
    `;
    document.getElementById('report-form').addEventListener('submit', addReport);
  } else if (section === 'links') {
    mainContent.innerHTML = `
      <h3>Manage Links</h3>
      <form id="link-form">
        <div class="form-group">
          <label for="link-url">URL:</label>
          <input type="url" id="link-url" name="url" class="form-control" required>
        </div>
        <div class="form-group">
          <label for="link-category">Category:</label>
          <input type="text" id="link-category" name="category" class="form-control" required>
        </div>
        <button type="submit" class="btn btn-primary">Add Link</button>
      </form>
    `;
    document.getElementById('link-form').addEventListener('submit', addLink);
  }
}

function addReport(event) {
  event.preventDefault();
  const title = document.getElementById('report-title').value;
  const content = document.getElementById('report-content').value;

  fetch('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Report added successfully');
        loadContent('reports'); // Load reports again to show the newly added report
      } else {
        alert('Failed to add report');
      }
    })
    .catch(error => console.error('Error:', error));
}

function addLink(event) {
  event.preventDefault();
  const url = document.getElementById('link-url').value;
  const category = document.getElementById('link-category').value;

  fetch('/api/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, category })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Link added successfully');
        loadContent('links'); // Load links again to show the newly added link
      } else {
        alert('Failed to add link');
      }
    })
    .catch(error => console.error('Error:', error));
}

function deleteReport(id) {
  fetch(`/api/reports/${id}`, {
    method: 'DELETE'
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Report deleted successfully');
        loadContent('reports'); // Load reports again to reflect the deletion
      } else {
        alert('Failed to delete report');
      }
    })
    .catch(error => console.error('Error:', error));
}

function deleteLink(id) {
  fetch(`/api/links/${id}`, {
    method: 'DELETE'
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Link deleted successfully');
        loadContent('links'); // Load links again to reflect the deletion
      } else {
        alert('Failed to delete link');
      }
    })
    .catch(error => console.error('Error:', error));
}