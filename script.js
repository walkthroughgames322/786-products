// Admin Code
const ADMIN_CODE = "786786";

// UI Elements
const searchInput = document.getElementById('searchInput');
const playlistButtonsContainer = document.getElementById('playlistButtons');
const productList = document.getElementById('productList');
const adminBtn = document.getElementById('adminBtn');
const addProductBtn = document.getElementById('addProductBtn');

let isAdmin = false;
let products = [];
let playlists = [];

// 🧰 Your Google Apps Script Web App Endpoint
const API_URL = "https://script.google.com/macros/s/AKfycbyHGfoU7lTLBPhZchBHr8p2dXjxkaqndQWZndis2fKDY2UobHqkCiQdaC9YQtfLF-vtRg/exec";

// 📥 Fetch all products from Google Sheet
async function fetchData() {
  try {
    const res = await fetch(API_URL);
    const all = await res.json();
    products = all;
    playlists = [...new Set(products.map(p => p.playlist))];
    renderPlaylistButtons();
    renderProducts();
  } catch (err) {
    console.error("Failed to fetch data:", err);
  }
}

// 📤 Send changes to Google Sheet via POST
async function sendData(payload) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });
    const text = await res.text();
    if (text === "Added" || text === "Updated" || text === "Deleted") {
      fetchData();
    } else {
      console.error("Unexpected response:", text);
    }
  } catch (err) {
    console.error("Failed to send data:", err);
  }
}

// 🎛️ Render playlist buttons
function renderPlaylistButtons() {
  if (!playlistButtonsContainer) return;
  playlistButtonsContainer.innerHTML = '';
  
  const allBtn = document.createElement('button');
  allBtn.textContent = 'All Products';
  allBtn.className = 'playlist-btn active';
  allBtn.onclick = () => filterBy('', allBtn);
  playlistButtonsContainer.appendChild(allBtn);

  playlists.forEach(name => {
    const btn = document.createElement('button');
    btn.textContent = name;
    btn.className = 'playlist-btn';
    btn.onclick = () => filterBy(name, btn);
    playlistButtonsContainer.appendChild(btn);
  });
}

// 🔍 Filter and display products
function filterBy(playlist, btn) {
  document.querySelectorAll('.playlist-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderProducts(searchInput.value.toLowerCase(), playlist);
}

function renderProducts(search = '', filter = '') {
  if (!productList) return;
  productList.innerHTML = '';

  let list = products.filter(p => !filter || p.playlist === filter);

  if (search) {
    list = list.filter(p => p.name.toLowerCase().includes(search));
  }

  if (list.length === 0) {
    productList.innerHTML = '<div class="no-results">No products found</div>';
    return;
  }

  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image-container">
        ${p.image ? `<img src="${p.image}" alt="${p.name}"/>` : '<div class="no-image">No Image</div>'}
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <p>Playlist: ${p.playlist}</p>
        <a href="${p.link}" target="_blank">View Product</a>
        ${isAdmin ? `
          <div class="product-actions">
            <button onclick="editProduct('${p.id}')">Edit</button>
            <button onclick="deleteProduct('${p.id}')">Delete</button>
          </div>` : ''}
      </div>`;
    productList.appendChild(card);
  });
}

// 🔐 Admin login
adminBtn.addEventListener('click', () => {
  const code = prompt("Enter Admin Code");
  if (code === ADMIN_CODE) {
    isAdmin = true;
    addProductBtn.style.display = 'inline-block';
    renderProducts();
    alert("Admin mode enabled");
  } else {
    alert("Wrong code");
  }
});

// ➕ Add product
addProductBtn.addEventListener('click', () => {
  const name = prompt("Product Name");
  const link = prompt("Product Link");
  const playlist = prompt("Playlist");
  const image = prompt("Image URL (or leave blank)");

  if (name && link && playlist) {
    const id = Date.now().toString();
    sendData({ action: 'add', id, name, link, playlist, image: image || '' });
  } else {
    alert("All fields except image are required");
  }
});

// ✏️ Edit product
function editProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const name = prompt("Name", p.name);
  const link = prompt("Link", p.link);
  const playlist = prompt("Playlist", p.playlist);
  const image = prompt("Image URL", p.image);

  if (name && link && playlist) {
    sendData({ action: 'update', id, name, link, playlist, image });
  } else {
    alert("Name, link, and playlist are required");
  }
}

// 🗑️ Delete product
function deleteProduct(id) {
  if (confirm("Delete this product?")) {
    sendData({ action: 'delete', id });
  }
}

// 🔎 Search filter
searchInput.addEventListener('input', (e) => {
  const filter = document.querySelector('.playlist-btn.active')?.textContent === "All Products" 
    ? '' : document.querySelector('.playlist-btn.active')?.textContent;
  renderProducts(e.target.value.toLowerCase(), filter);
});

// 🚀 Init
fetchData();
