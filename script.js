// Admin Code - Change this to your preferred code
const ADMIN_CODE = "786786";

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
let currentProducts = JSON.parse(localStorage.getItem('products')) || [];
let playlists = JSON.parse(localStorage.getItem('playlists')) || ['Cosmetics', 'Electronics', 'Kitchen'];

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
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveProduct();
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

// Show product form
function showProductForm(product = null) {
    const playlistSelect = document.getElementById('productPlaylist');
    playlistSelect.innerHTML = playlists.map(playlist => 
        `<option value="${playlist}">${playlist}</option>`
    ).join('');

    if (product) {
        document.getElementById('productName').value = product.name;
        document.getElementById('productLink').value = product.link;
        document.getElementById('productPlaylist').value = product.playlist;
        document.getElementById('productId').value = product.id;
    } else {
        productForm.reset();
        document.getElementById('productId').value = '';
    }

    productFormContainer.classList.remove('hidden');
}

// Save product
function saveProduct() {
    const productId = document.getElementById('productId').value;
    const productName = document.getElementById('productName').value;
    const productLink = document.getElementById('productLink').value;
    const productPlaylist = document.getElementById('productPlaylist').value;
    const productImage = document.getElementById('productImage').files[0];

    if (!productName || !productLink || !productPlaylist) {
        alert('Please fill all required fields');
        return;
    }

    const product = {
        id: productId || Date.now().toString(),
        name: productName,
        link: productLink,
        playlist: productPlaylist,
        image: productId && !productImage ? 
            currentProducts.find(p => p.id === productId)?.image : null
    };

    // Handle image
    if (productImage) {
        const reader = new FileReader();
        reader.onload = function(e) {
            product.image = e.target.result;
            saveProductToStorage(product);
        };
        reader.readAsDataURL(productImage);
    } else {
        saveProductToStorage(product);
    }
}

// Save product to localStorage
function saveProductToStorage(product) {
    if (product.id) {
        // Update existing product
        const index = currentProducts.findIndex(p => p.id === product.id);
        if (index !== -1) {
            currentProducts[index] = product;
        } else {
            currentProducts.push(product);
        }
    } else {
        // Add new product
        product.id = Date.now().toString();
        currentProducts.push(product);
    }

    localStorage.setItem('products', JSON.stringify(currentProducts));
    renderProducts();
    renderPlaylistButtons();
    productFormContainer.classList.add('hidden');
    alert('Product saved successfully!');
}

// Show playlist form
function showPlaylistForm() {
    const playlistList = document.getElementById('playlistList');
    playlistList.innerHTML = playlists.map(playlist => `
        <li>
            <span>${playlist}</span>
            <div>
                <button class="edit-playlist-btn" data-playlist="${playlist}">Edit</button>
                <button class="delete-playlist-btn" data-playlist="${playlist}">Delete</button>
            </div>
        </li>
    `).join('');

    // Add event listeners for edit/delete buttons
    document.querySelectorAll('.edit-playlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const oldName = e.target.dataset.playlist;
            const newName = prompt('Enter new playlist name:', oldName);
            if (newName && newName !== oldName) {
                editPlaylist(oldName, newName);
            }
        });
    });

    document.querySelectorAll('.delete-playlist-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (confirm(`Are you sure you want to delete playlist "${e.target.dataset.playlist}"?`)) {
                deletePlaylist(e.target.dataset.playlist);
            }
        });
    });

    playlistFormContainer.classList.remove('hidden');
}

// Add playlist
function addPlaylist() {
    const newPlaylistName = document.getElementById('newPlaylistName').value.trim();
    if (!newPlaylistName) {
        alert('Please enter a playlist name');
        return;
    }

    if (playlists.includes(newPlaylistName)) {
        alert('Playlist already exists');
        return;
    }

    playlists.push(newPlaylistName);
    localStorage.setItem('playlists', JSON.stringify(playlists));
    document.getElementById('newPlaylistName').value = '';
    showPlaylistForm();
    renderPlaylistButtons();
}

// Edit playlist
function editPlaylist(oldName, newName) {
    // Update playlists array
    const index = playlists.indexOf(oldName);
    if (index !== -1) {
        playlists[index] = newName;
    }

    // Update products with this playlist
    currentProducts = currentProducts.map(product => {
        if (product.playlist === oldName) {
            return { ...product, playlist: newName };
        }
        return product;
    });

    localStorage.setItem('playlists', JSON.stringify(playlists));
    localStorage.setItem('products', JSON.stringify(currentProducts));
    showPlaylistForm();
    renderPlaylistButtons();
    renderProducts();
}

// Delete playlist
function deletePlaylist(name) {
    // Remove from playlists array
    playlists = playlists.filter(playlist => playlist !== name);

    // Remove products with this playlist
    currentProducts = currentProducts.filter(product => product.playlist !== name);

    localStorage.setItem('playlists', JSON.stringify(playlists));
    localStorage.setItem('products', JSON.stringify(currentProducts));
    showPlaylistForm();
    renderPlaylistButtons();
    renderProducts();
}

// Render products
function renderProducts(searchTerm = '', playlistFilter = '') {
    const productList = document.getElementById('productList');
    if (!productList) return;

    productList.innerHTML = '';

    let filteredProducts = currentProducts;

    // Apply search filter if search term exists
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.playlist.toLowerCase().includes(searchTerm)
        );
    }

    // Apply playlist filter if specified
    if (playlistFilter) {
        filteredProducts = filteredProducts.filter(product => 
            product.playlist === playlistFilter
        );
    }

    if (filteredProducts.length === 0) {
        const noResults = document.createElement('div');
        noResults.classList.add('no-results');
        noResults.textContent = searchTerm || playlistFilter 
            ? 'No products found matching your criteria.'
            : 'No products available.';
        productList.appendChild(noResults);
        return;
    }

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        
        // Highlight search term in product name
        const highlightedName = searchTerm 
            ? product.name.replace(new RegExp(searchTerm, 'gi'), 
              match => `<span class="search-highlight">${match}</span>`)
            : product.name;
            
        // Highlight search term in playlist
        const highlightedPlaylist = searchTerm 
            ? product.playlist.replace(new RegExp(searchTerm, 'gi'), 
              match => `<span class="search-highlight">${match}</span>`)
            : product.playlist;

        productCard.innerHTML = `
            <div class="product-image-container">
                ${product.image ? `<img src="${product.image}" alt="${product.name}">` : '<div class="no-image">No Image</div>'}
            </div>
            <div class="product-info">
                <h3>${highlightedName}</h3>
                <p>Playlist: ${highlightedPlaylist}</p>
                <a href="${product.link}" target="_blank" class="product-link">View Product</a>
                ${isAdmin ? `
                <div class="product-actions">
                    <button class="edit-product-btn" data-id="${product.id}">Edit</button>
                    <button class="delete-product-btn" data-id="${product.id}">Delete</button>
                </div>
                ` : ''}
            </div>
        `;

        if (isAdmin) {
            productCard.querySelector('.edit-product-btn').addEventListener('click', () => {
                const productToEdit = currentProducts.find(p => p.id === product.id);
                showProductForm(productToEdit);
            });

            productCard.querySelector('.delete-product-btn').addEventListener('click', () => {
                if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
                    deleteProduct(product.id);
                }
            });
        }

        productList.appendChild(productCard);
    });
}

// Delete product
function deleteProduct(id) {
    currentProducts = currentProducts.filter(product => product.id !== id);
    localStorage.setItem('products', JSON.stringify(currentProducts));
    renderProducts();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initAdminUI();
    renderPlaylistButtons();
    renderProducts();
});