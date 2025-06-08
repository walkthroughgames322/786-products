// Admin Code - Change this to your preferred code
const ADMIN_CODE = "786786";

// Your deployed Google Apps Script web app URL (replace with your actual URL)
const API_URL = 'https://script.google.com/macros/s/AKfycbyHGfoU7lTLBPhZchBHr8p2dXjxkaqndQWZndis2fKDY2UobHqkCiQdaC9YQtfLF-vtRg/exec';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const adminBtn = document.createElement('button');
const adminLoginContainer = document.createElement('div');
const adminCodeInput = document.createElement('input');
const submitCodeBtn = document.createElement('button');
const adminControls = document.createElement('div');

// Product Form Elements
const productForm = document.createElement('form');
const productFormContainer = document.createElement('div');
const playlistForm = document.createElement('form');
const playlistFormContainer = document.createElement('div');

// State
let isAdmin = false;
let currentProducts = []; // Will fetch from server
let playlists = ['Cosmetics', 'Electronics', 'Kitchen']; // Will be managed locally (no playlist API yet)

// Initialize Admin UI
function initAdminUI() {
    // Admin Login Button
    adminBtn.textContent = 'Admin';
    adminBtn.classList.add('admin-btn');
    document.querySelector('.search-container').appendChild(adminBtn);

    // Admin Login Container
    adminLoginContainer.classList.add('admin-login-container', 'hidden');
    adminLoginContainer.innerHTML = `
        <h3>Admin Login</h3>
        <p>Enter admin code to access controls</p>
    `;
    
    adminCodeInput.type = 'password';
    adminCodeInput.placeholder = 'Enter admin code';
    adminCodeInput.classList.add('admin-code-input');
    
    submitCodeBtn.textContent = 'Submit';
    submitCodeBtn.classList.add('submit-code-btn');
    
    adminLoginContainer.appendChild(adminCodeInput);
    adminLoginContainer.appendChild(submitCodeBtn);
    document.body.appendChild(adminLoginContainer);

    // Admin Controls
    adminControls.classList.add('admin-controls', 'hidden');
    adminControls.innerHTML = `
        <button class="admin-control-btn" id="logoutBtn">Logout</button>
        <button class="admin-control-btn" id="addProductBtn">Add Product</button>
        <button class="admin-control-btn" id="managePlaylistsBtn">Manage Playlists</button>
    `;
    document.body.appendChild(adminControls);

    // Product Form
    productFormContainer.classList.add('form-container', 'hidden');
    productFormContainer.innerHTML = `
        <div class="form-header">
            <h3>Add/Edit Product</h3>
            <button class="close-form-btn">&times;</button>
        </div>
    `;
    
    productForm.innerHTML = `
        <div class="form-group">
            <label for="productImage">Product Image</label>
            <input type="file" id="productImage" accept="image/*">
        </div>
        <div class="form-group">
            <label for="productName">Product Name</label>
            <input type="text" id="productName" required>
        </div>
        <div class="form-group">
            <label for="productLink">Product Link</label>
            <input type="url" id="productLink" required>
        </div>
        <div class="form-group">
            <label for="productPlaylist">Playlist</label>
            <select id="productPlaylist" required></select>
        </div>
        <input type="hidden" id="productId">
        <button type="submit" class="form-submit-btn">Save Product</button>
    `;
    
    productFormContainer.appendChild(productForm);
    document.body.appendChild(productFormContainer);

    // Playlist Form
    playlistFormContainer.classList.add('form-container', 'hidden');
    playlistFormContainer.innerHTML = `
        <div class="form-header">
            <h3>Manage Playlists</h3>
            <button class="close-form-btn">&times;</button>
        </div>
        <div class="playlist-controls">
            <input type="text" id="newPlaylistName" placeholder="New playlist name">
            <button id="addPlaylistBtn">Add Playlist</button>
        </div>
        <ul id="playlistList"></ul>
    `;
    document.body.appendChild(playlistFormContainer);

    // Event Listeners
    setupEventListeners();
}

// Fetch all products from server
async function fetchProducts() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        currentProducts = data;
        renderProducts();
        renderPlaylistButtons();
    } catch (error) {
        alert('Error fetching products from server: ' + error.message);
        currentProducts = []; // fallback empty
        renderProducts();
        renderPlaylistButtons();
    }
}

// Send product data to server for add/update/delete
async function sendProductToServer(product, action) {
    const payload = { ...product, action };
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error('Failed to ' + action + ' product');
        const text = await res.text();
        return text;
    } catch (error) {
        alert('Error saving product: ' + error.message);
        throw error;
    }
}

// Render playlist buttons
function renderPlaylistButtons() {
    const playlistButtonsContainer = document.getElementById('playlistButtons');
    if (!playlistButtonsContainer) return;

    playlistButtonsContainer.innerHTML = '';

    // Create "All Products" button
    const allButton = document.createElement('button');
    allButton.textContent = 'All Products';
    allButton.classList.add('playlist-btn', 'active');
    allButton.addEventListener('click', () => {
        document.querySelectorAll('.playlist-btn').forEach(btn => btn.classList.remove('active'));
        allButton.classList.add('active');
        renderProducts();
    });
    playlistButtonsContainer.appendChild(allButton);

    // Create buttons for each playlist
    playlists.forEach(playlist => {
        const button = document.createElement('button');
        button.textContent = playlist;
        button.classList.add('playlist-btn');
        button.addEventListener('click', () => {
            document.querySelectorAll('.playlist-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderProducts('', playlist);
        });
        playlistButtonsContainer.appendChild(button);
    });
}

// Set up event listeners
function setupEventListeners() {
    // Search input event listener
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const activePlaylist = document.querySelector('.playlist-btn.active');
            const playlistFilter = activePlaylist && activePlaylist.textContent !== 'All Products' 
                ? activePlaylist.textContent 
                : '';
            renderProducts(e.target.value.toLowerCase(), playlistFilter);
        });
    }

    // Admin button click
    adminBtn.addEventListener('click', () => {
        adminLoginContainer.classList.toggle('hidden');
    });

    // Submit code button
    submitCodeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (adminCodeInput.value === ADMIN_CODE) {
            isAdmin = true;
            adminLoginContainer.classList.add('hidden');
            adminControls.classList.remove('hidden');
            adminCodeInput.value = '';
            renderProducts();
        } else {
            alert('Incorrect admin code');
        }
    });

    // Logout button
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        isAdmin = false;
        adminControls.classList.add('hidden');
        renderProducts();
    });

    // Add product button
    document.getElementById('addProductBtn')?.addEventListener('click', () => {
        showProductForm();
    });

    // Manage playlists button
    document.getElementById('managePlaylistsBtn')?.addEventListener('click', () => {
        showPlaylistForm();
    });

    // Product form submit
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveProduct();
    });

    // Playlist form - add playlist
    document.getElementById('addPlaylistBtn')?.addEventListener('click', () => {
        addPlaylist();
    });

    // Close form buttons
    document.querySelectorAll('.close-form-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            productFormContainer.classList.add('hidden');
            playlistFormContainer.classList.add('hidden');
        });
    });
}

// Render products based on search and playlist filter
function renderProducts(searchText = '', playlistFilter = '') {
    const container = document.getElementById('productsContainer');
    if (!container) return;

    container.innerHTML = '';

    let filteredProducts = currentProducts;

    if (playlistFilter) {
        filteredProducts = filteredProducts.filter(p => p.playlist === playlistFilter);
    }

    if (searchText) {
        filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(searchText)
        );
    }

    if (filteredProducts.length === 0) {
        container.textContent = 'No products found.';
        return;
    }

    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('product-card');

        // Image element - use URL or base64
        const img = document.createElement('img');
        img.src = product.image || '';
        img.alt = product.name;
        card.appendChild(img);

        // Name
        const name = document.createElement('h4');
        name.textContent = product.name;
        card.appendChild(name);

        // Link
        const link = document.createElement('a');
        link.href = product.link;
        link.target = '_blank';
        link.textContent = 'View Product';
        card.appendChild(link);

        // Admin controls (Edit/Delete)
        if (isAdmin) {
            const controls = document.createElement('div');
            controls.classList.add('admin-product-controls');

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.classList.add('edit-btn');
            editBtn.addEventListener('click', () => {
                showProductForm(product);
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener('click', async () => {
                if (confirm('Are you sure you want to delete this product?')) {
                    await deleteProduct(product.id);
                }
            });

            controls.appendChild(editBtn);
            controls.appendChild(deleteBtn);
            card.appendChild(controls);
        }

        container.appendChild(card);
    });
}

// Show product form for add or edit
function showProductForm(product = null) {
    productFormContainer.classList.remove('hidden');
    productForm.reset();

    // Populate playlist select
    const playlistSelect = productForm.querySelector('#productPlaylist');
    playlistSelect.innerHTML = '';
    playlists.forEach(pl => {
        const option = document.createElement('option');
        option.value = pl;
        option.textContent = pl;
        playlistSelect.appendChild(option);
    });

    if (product) {
        productForm.querySelector('#productId').value = product.id || '';
        productForm.querySelector('#productName').value = product.name || '';
        productForm.querySelector('#productLink').value = product.link || '';
        playlistSelect.value = product.playlist || playlists[0];
        // Image preview is skipped, user must upload new image if they want to change
    } else {
        productForm.querySelector('#productId').value = '';
    }
}

// Save product (add or update)
async function saveProduct() {
    const id = productForm.querySelector('#productId').value || generateId();
    const name = productForm.querySelector('#productName').value.trim();
    const link = productForm.querySelector('#productLink').value.trim();
    const playlist = productForm.querySelector('#productPlaylist').value;

    if (!name || !link || !playlist) {
        alert('Please fill all required fields');
        return;
    }

    // Handle image upload and convert to base64
    const fileInput = productForm.querySelector('#productImage');
    let base64Image = '';
    if (fileInput.files && fileInput.files[0]) {
        base64Image = await fileToBase64(fileInput.files[0]);
    } else {
        // If editing and no new image uploaded, keep existing image
        const existingProduct = currentProducts.find(p => p.id === id);
        base64Image = existingProduct ? existingProduct.image : '';
    }

    const product = { id, name, link, playlist, image: base64Image };

    // Determine if adding or updating
    const existingIndex = currentProducts.findIndex(p => p.id === id);
    try {
        if (existingIndex === -1) {
            await sendProductToServer(product, 'add');
            currentProducts.push(product);
        } else {
            await sendProductToServer(product, 'update');
            currentProducts[existingIndex] = product;
        }
        alert('Product saved successfully');
        productFormContainer.classList.add('hidden');
        renderProducts();
    } catch (error) {
        // Error handled inside sendProductToServer
    }
}

// Delete product
async function deleteProduct(productId) {
    try {
        await sendProductToServer({ id: productId }, 'delete');
        currentProducts = currentProducts.filter(p => p.id !== productId);
        renderProducts();
    } catch (error) {
        // Error handled in sendProductToServer
    }
}

// Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Generate random ID for products
function generateId() {
    return 'id-' + Math.random().toString(36).substr(2, 9);
}

// Show playlist management form
function showPlaylistForm() {
    playlistFormContainer.classList.remove('hidden');
    renderPlaylistList();
}

// Render playlist list in the playlist form
function renderPlaylistList() {
    const playlistList = document.getElementById('playlistList');
    playlistList.innerHTML = '';

    playlists.forEach((pl, index) => {
        const li = document.createElement('li');
        li.textContent = pl;

        if (isAdmin) {
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Delete';
            delBtn.classList.add('delete-playlist-btn');
            delBtn.addEventListener('click', () => {
                if (confirm(`Delete playlist "${pl}"? Products in this playlist will keep their playlist.`)) {
                    playlists.splice(index, 1);
                    renderPlaylistList();
                    renderPlaylistButtons();
                }
            });
            li.appendChild(delBtn);
        }

        playlistList.appendChild(li);
    });
}

// Add new playlist
function addPlaylist() {
    const input = document.getElementById('newPlaylistName');
    const name = input.value.trim();
    if (!name) {
        alert('Enter playlist name');
        return;
    }
    if (playlists.includes(name)) {
        alert('Playlist already exists');
        return;
    }
    playlists.push(name);
    input.value = '';
    renderPlaylistList();
    renderPlaylistButtons();
}

// Initial setup
function init() {
    initAdminUI();
    fetchProducts();
}

init();
