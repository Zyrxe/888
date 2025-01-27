const KueDB = {
    dbName: "xxxxxx",
    storeName: "yyyyy",
    db: null,
    defaultData: [], 

    openDB: function() {
        const request = indexedDB.open(this.dbName, 1);
        request.onerror = function(event) {
            console.error("Database error: " + event.target.error);
        };
        request.onupgradeneeded = (event) => {
            this.db = event.target.result;
            if (!this.db.objectStoreNames.contains(this.storeName)) {
                const store = this.db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
                store.createIndex("by_category", "category", { unique: false });
            }
        };
        request.onsuccess = (event) => {
            this.db = event.target.result;
            this.loadDataFromJSON(); // Panggil fungsi untuk memuat data dari JSON
        };
    },

    loadDataFromJSON: function() {
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                this.defaultData = data.KueDB.defaultData; // Isi defaultData dengan data dari JSON
                this.loadDataFromDB(); // Muat data dari IndexedDB setelah mengisi defaultData
            })
            .catch(error => console.error('Error loading JSON:', error));
    },

    saveItemToDB: function(categoryIndex, itemIndex) {
        const item = this.defaultData[categoryIndex].items[itemIndex];
        const transaction = this.db.transaction([this.storeName], "readwrite");
        const store = transaction.objectStore(this.storeName);
        store.put(item);

        transaction.oncomplete = function() {
            console.log("Item saved to IndexedDB.");
        };

        transaction.onerror = function(event) {
            console.error("Error saving to IndexedDB:", event.target.error);
        };
    },

    saveAllToDB: function() {
        const transaction = this.db.transaction([this.storeName], "readwrite");
        const store = transaction.objectStore(this.storeName);
        this.defaultData.forEach(category => {
            category.items.forEach(item => {
                store.put(item);
            });
        });

        transaction.oncomplete = function() {
            console.log("All items saved to IndexedDB.");
            KueDB.loadTableFromHtml(); // Memanggil loadTableFromHtml dari KueDB
        };

        transaction.onerror = function(event) {
            console.error("Error saving all items to IndexedDB:", event.target.error);
        };
    },

    loadDataFromDB: function() {
        const transaction = this.db.transaction([this.storeName], "readonly");
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();

        request.onsuccess = (event) => {
            const items = event.target.result;
            items.forEach(item => {
                const category = this.defaultData.find(c => c.category === item.category);
                if (category) {
                    category.items.push(item);
                } else {
                    this.defaultData.push({ category: item.category, items: [item] });
                }
            });
            this.loadTableFromHtml();
        };

        request.onerror = function(event) {
            console.error("Error loading data from IndexedDB:", event.target.error);
        };
    },

    deleteItem: function(categoryIndex, itemIndex) {
    // Hapus item dari defaultData
    this.defaultData[categoryIndex].items.splice(itemIndex, 1);
    
    // Hapus item dari database
    this.deleteItemFromDB(categoryIndex, itemIndex);
    
    // Muat ulang tabel untuk memperbarui tampilan
    this.loadTableFromHtml();
},

deleteItemFromDB: function(categoryIndex, itemIndex) {
    const itemId = this.defaultData[categoryIndex].items[itemIndex].id;
    const transaction = this.db.transaction([this.storeName], "readwrite");
    const store = transaction.objectStore(this.storeName);
    store.delete(itemId);

    transaction.oncomplete = () => {
        console.log("Item deleted from IndexedDB.");
        // Tidak perlu memanggil loadDataFromDB di sini, karena kita sudah menghapus dari defaultData
    };

    transaction.onerror = function(event) {
        console.error("Error deleting from IndexedDB:", event.target.error);
    };
},

    saveItem: function(categoryIndex, itemIndex) {
        const item = this.defaultData[categoryIndex].items[itemIndex];
        const updatedCells = document.querySelectorAll(`[data-category="${categoryIndex}"][data-item="${itemIndex}"]`);

        updatedCells.forEach(cell => {
            const columnName = cell.cellIndex;
            switch (columnName) {
                case 0: item.NO = cell.textContent; break;
                case 1: item.BARANG = cell.textContent; break;
                case 2: item.KODE_TOKO = cell.textContent; break;
                case 3: item.KODE_GUDANG = cell.textContent; break;
                case 4: item.HARGA["DUS/BALL"] = cell.textContent; break;
                case 5: item.HARGA["1 PACK"] = cell.textContent; break;
                case 6: item.HARGA["1 PCS"] = cell.textContent; break;
                case 7: item.HARGA["1000 GRAM"] = cell.textContent; break;
                case 8: item.HARGA["500 GRAM"] = cell.textContent; break;
                case 9: item.HARGA["250 GRAM"] = cell.textContent; break;
                case 10: item.HARGA["100 GRAM"] = cell.textContent; break;
                case 11: item.HARGA["50 GRAM"] = cell.textContent; break;
                case 12: item.STOK.GUDANG = cell.textContent; break;
                case 13: item.STOK.TOKO = cell.textContent; break;
            }
        });
        this.saveItemToDB(categoryIndex, itemIndex);

        // Sembunyikan tombol save setelah menyimpan
        const saveButton = document.querySelector(`[data-category="${categoryIndex}"][data-item="${itemIndex}"] .save-button`);
        if (saveButton) {
            saveButton.style.display = 'none';
        }
    },

    deleteItem: function(categoryIndex, itemIndex) {
        this.deleteItemFromDB(categoryIndex, itemIndex);
        this.defaultData[categoryIndex].items.splice(itemIndex, 1);
        this.loadTableFromHtml();
    },

    updateDate: function(categoryIndex, itemIndex, dateType, value) {
        const item = this.defaultData[categoryIndex].items[itemIndex];
        item.TANGGAL[dateType] = value;

        // Tampilkan tombol save saat tanggal diubah
        const saveButton = document.querySelector(`[data-category="${categoryIndex}"][data-item="${itemIndex}"] .save-button`);
        if (saveButton) {
            saveButton.style.display = 'inline'; // Tampilkan tombol save
        }
    },

    loadTableFromHtml: function() {
    const tbody = document.querySelector("#dataTableKue tbody");
    tbody.innerHTML = '';

    this.defaultData.forEach((category, categoryIndex) => {
        const subTitleRow = document.createElement("tr");
        subTitleRow.classList.add("sub-title");
        subTitleRow.innerHTML = `<td colspan="20">
                                    ${category.category}
                                    <button onclick="KueDB.addItem(${categoryIndex})">+</button>
                                  </td>`;
        tbody.appendChild(subTitleRow);

        category.items.forEach((item, itemIndex) => {
            const row = document.createElement("tr");
            row.classList.add("data-row");
            row.dataset.category = categoryIndex;
            row.dataset.item = itemIndex;
            const today = new Date().toISOString().split('T')[0]; // Mendapatkan tanggal saat ini dalam format YYYY-MM-DD
            row.innerHTML = `
                <td contenteditable="true" data-category="${categoryIndex}" data-item="${itemIndex}">${item.NO}</td>
                <td contenteditable="true" data-category="${categoryIndex}" data-item="${itemIndex}">${item.BARANG}</td>
                <td contenteditable="true" data-category="${categoryIndex}" data-item="${itemIndex}">${item.KODE_TOKO}</td>
                <td contenteditable="true" data-category="${categoryIndex}" data-item="${itemIndex}">${item.KODE_GUDANG}</td>
                <td contenteditable="true" data-category="${categoryIndex}" data-item="${itemIndex}">${item.HARGA["DUS/BALL"]}</td>
                <td contenteditable="true" data-category="${categoryIndex}" data-item="${itemIndex}">${item.HARGA["1 PACK"]}</td>
                <td contenteditable="true" data-category="${categoryIndex}" data-item="${itemIndex}">${item.HARGA["1 PCS"]}</td>
                <td contenteditable="true" data-category="${categoryIndex}" data-item="${itemIndex}">${item.HARGA["1000 GRAM"]}</td>
                <td contenteditable="true" data-category="${categoryIndex}" data-item="${itemIndex}">${item.HARGA["500 GRAM"]}</td>
                <td contenteditable="true" data-category="${categoryIndex}" data-item="${itemIndex}">${item.HARGA["250 GRAM"]}</td>
                <td contenteditable="true" data-category="${categoryIndex}" data-item="${itemIndex}">${item.HARGA["100 GRAM"]}</td>
                <td contenteditable="true" data-category="${categoryIndex}" data-item="${itemIndex}">${item.HARGA["50 GRAM"]}</td>
                <td contenteditable="true" data-category="${categoryIndex}" data-item="${itemIndex}">${item.STOK.GUDANG}</td>
                <td contenteditable="true" data-category="${categoryIndex}" data-item="${itemIndex}">${item.STOK.TOKO}</td>
                <td>
                    <input type="date" class="date-input" value="${item.TANGGAL.EXPAYER || today}" 
                        oninput="KueDB.updateDate(${categoryIndex}, ${itemIndex}, 'EXPAYER', this.value)">
                </td>
                <td>
                    <input type="date" class="date-input" value="${item.TANGGAL.MASUK || today}" 
                        oninput="KueDB.updateDate(${categoryIndex}, ${itemIndex}, 'MASUK', this.value)">
                </td>
                <td>
                    <input type="date" class="date-input" value="${item.TANGGAL.KELUAR || today}" 
                        oninput="KueDB.updateDate(${categoryIndex}, ${itemIndex}, 'KELUAR', this.value)">
                </td>
                <td>
                    <button class="save-button" onclick="KueDB.saveItem(${categoryIndex}, ${itemIndex})" style="display:none;">&#9729;</button>
                </td>
                <td><button class="delete-button" onclick="KueDB.deleteItem(${categoryIndex}, ${itemIndex})">&#128465;</button></td>
            `;
            tbody.appendChild(row);

            // Menambahkan event listener untuk menampilkan tombol save
            const editableCells = row.querySelectorAll('[contenteditable="true"]');
            editableCells.forEach(cell => {
                cell.addEventListener('input', () => {
                    const saveButton = row.querySelector('.save-button');
                    saveButton.style.display = 'inline'; // Tampilkan tombol save
                });
            });
        });
    });
},
    addItem: function(categoryIndex) {
        const category = this.defaultData[categoryIndex];
        const newItem = {
            NO: category.items.length + 1,
            BARANG: '',
            KODE_TOKO: '',
            KODE_GUDANG: '',
            HARGA: { "DUS/BALL": '', "1 PACK": '', "1 PCS": '', "1000 GRAM": '', "500 GRAM": '', "250 GRAM": '', "100 GRAM": '', "50 GRAM": '' },
            STOK: { GUDANG: '', TOKO: '' },
            TANGGAL: { EXPAYER: '', MASUK: '', KELUAR: '' },
            category: category.category
        };
        category.items.push(newItem);
        this.loadTableFromHtml();
    }
};

const PlastikDB = {
    dbName: "888888",
    storeName: "88888",
    db: null,
    defaultData: [], // Kosongkan defaultData

    openDB: function() {
        const request = indexedDB.open(this.dbName, 1);
        request.onerror = function(event) {
            console.error("Database error: " + event.target.error);
        };
        request.onupgradeneeded = (event) => {
            this.db = event.target.result;
            if (!this.db.objectStoreNames.contains(this.storeName)) {
                const store = this.db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
                store.createIndex("by_category", "category", { unique: false });
            }
        };
        request.onsuccess = (event) => {
            this.db = event.target.result;
            this.loadDataFromJSON(); // Panggil fungsi untuk memuat data dari JSON
        };
    },

    loadDataFromJSON: function() {
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                this.defaultData = data.PlastikDB.defaultData; // Isi defaultData dengan data dari JSON
                this.loadDataFromDB(); // Muat data dari IndexedDB setelah mengisi defaultData
            })
            .catch(error => console.error('Error loading JSON:', error));
    },

    saveItemToDB: function(categoryIndex, itemIndex) {
        const item = this.defaultData[categoryIndex].items[itemIndex];
        const transaction = this.db.transaction([this.storeName], "readwrite");
        const store = transaction.objectStore(this.storeName);
        store.put(item);

        transaction.oncomplete = function() {
            console.log("Item saved to IndexedDB.");
        };

        transaction.onerror = function(event) {
            console.error("Error saving to IndexedDB:", event.target.error);
        };
    },

    saveAllToDB: function() {
        const transaction = this.db.transaction([this.storeName], "readwrite");
        const store = transaction.objectStore(this.storeName);
        this.defaultData.forEach(category => {
            category.items.forEach(item => {
                store.put(item);
            });
        });

        transaction.oncomplete = function() {
            console.log("All items saved to IndexedDB.");
            PlastikDB.loadTableFromHtml();
        };

        transaction.onerror = function(event) {
            console.error("Error saving all items to IndexedDB:", event.target.error);
        };
    },

    loadDataFromDB: function() {
        const transaction = this.db.transaction([this.storeName], "readonly");
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();

        request.onsuccess = (event) => {
            const items = event.target.result;
            items.forEach(item => {
                const category = this.defaultData.find(c => c.category === item.category);
                if (category) {
                    category.items.push(item);
                } else {
                    this.defaultData.push({ category: item.category, items: [item] });
                }
            });
            this.loadTableFromHtml();
        };

        request.onerror = function(event) {
            console.error("Error loading data from IndexedDB:", event.target.error);
        };
    },

    deleteItem: function(categoryIndex, itemIndex) {
    // Hapus item dari defaultData
    this.defaultData[categoryIndex].items.splice(itemIndex, 1);
    
    // Hapus item dari database
    this.deleteItemFromDB(categoryIndex, itemIndex);
    
    // Muat ulang tabel untuk memperbarui tampilan
    this.loadTableFromHtml();
},

deleteItemFromDB: function(categoryIndex, itemIndex) {
    const itemId = this.defaultData[categoryIndex].items[itemIndex].id;
    const transaction = this.db.transaction([this.storeName], "readwrite");
    const store = transaction.objectStore(this.storeName);
    store.delete(itemId);

    transaction.oncomplete = () => {
        console.log("Item deleted from IndexedDB.");
        // Tidak perlu memanggil loadDataFromDB di sini, karena kita sudah menghapus dari defaultData
    };

    transaction.onerror = function(event) {
        console.error("Error deleting from IndexedDB:", event.target.error);
    };
},

    saveItem: function(categoryIndex, itemIndex) {
        const item = this.defaultData[categoryIndex].items[itemIndex];
        const updatedCells = document.querySelectorAll(`[data-category="${categoryIndex}"][data-item="${itemIndex}"]`);

        updatedCells.forEach(cell => {
            const columnName = cell.cellIndex;
            switch (columnName) {
                case 0: item.NO = cell.textContent; break;
                case 1: item.BARANG = cell.textContent; break;
                case 2: item.KODE_TOKO = cell.textContent; break;
                case 3: item.KODE_GUDANG = cell.textContent; break;
                case 4: item.HARGA["DUS/BALL"] = cell.textContent; break;
                case 5: item.HARGA["1 PACK"] = cell.textContent; break;
                case 6: item.HARGA["1 PCS"] = cell.textContent; break;
                case 7: item.HARGA["1000 GRAM"] = cell.textContent; break;
                case 8: item.HARGA["500 GRAM"] = cell.textContent; break;
                case 9: item.HARGA["250 GRAM"] = cell.textContent; break;
                case 10: item.HARGA["100 GRAM"] = cell.textContent; break;
                case 11: item.HARGA["50 GRAM"] = cell.textContent; break;
                case 12: item.STOK.GUDANG = cell.textContent; break;
                case 13: item.STOK.TOKO = cell.textContent; break;
            }
        });
        this.saveItemToDB(categoryIndex, itemIndex);

        // Sembunyikan tombol save setelah menyimpan
        const saveButton = document.querySelector(`[data-category="${categoryIndex}"][data-item="${itemIndex}"] .save-button`);
        if (saveButton) {
            saveButton.style.display = 'none';
        }
    },

    deleteItem: function(categoryIndex, itemIndex) {
        this.deleteItemFromDB(categoryIndex, itemIndex);
        this.defaultData[categoryIndex].items.splice(itemIndex, 1);
        this.loadTableFromHtml();
    },

    updateDate: function(categoryIndex, itemIndex, dateType, value) {
        const item = this.defaultData[categoryIndex].items[itemIndex];
        item.TANGGAL[dateType] = value;

        // Tampilkan tombol save saat tanggal diubah
        const saveButton = document.querySelector(`[data-category="${categoryIndex}"][data-item="${itemIndex}"] .save-button`);
        if (saveButton) {
            saveButton.style.display = 'inline'; // Tampilkan tombol save
        }
    },

    loadTableFromHtml: function() {
        const tbody = document.querySelector("#dataTablePlastik tbody");
        tbody.innerHTML = '';

        this.defaultData.forEach((category, categoryIndex) => {
            const subTitleRow = document.createElement("tr");
            subTitleRow.classList.add("sub-title");
            subTitleRow.innerHTML = `<td colspan="18">
                                        ${category.category}
                                        <button onclick="PlastikDB.addItem(${categoryIndex})">+</button>
                                      </td>`;
            tbody.appendChild(subTitleRow);

            category.items.forEach((item, itemIndex) => {
                const row = document.createElement("tr");
                row.classList.add("data-row");
                row.dataset.category = categoryIndex;
                row.dataset.item = itemIndex;
                const today = new Date().toISOString().split('T')[0]; // Mendapatkan tanggal saat ini dalam format YYYY-MM-DD
                row.innerHTML = `
                    <td contenteditable="true" data-category="${categoryIndex}" data-item="${itemIndex}">${item.NO}</td>
                    <td contenteditable="true" data-category="${categoryIndex}" data-item="${itemIndex}">${item.BARANG}</td>
                    <td contenteditable="true" data-category="${categoryIndex}" data-item="${itemIndex}">${item.KODE_TOKO}</td>
                    <td contenteditable="true" data-category="${categoryIndex}" data-item="${itemIndex}">${item.KODE_GUDANG}</td>
                    <td contenteditable="true" data-category="${categoryIndex}" data-item="${itemIndex}">${item.HARGA["DUS/BALL"]}</td>
                    <td contenteditable="true" data-category="${categoryIndex}" data-item="${itemIndex}">${item.HARGA["1 PACK"]}</td>
                    <td contenteditable="true" data-category="${categoryIndex}" data-item="${itemIndex}">${item.HARGA["1 PCS"]}</td>
                    <td contenteditable="true" data-category="${categoryIndex}" data-item="${itemIndex}">${item.HARGA["1000 GRAM"]}</td>
                    <td contenteditable="true" data-category="${categoryIndex}" data-item="${itemIndex}">${item.HARGA["500 GRAM"]}</td>
                    <td contenteditable="true" data-category="${categoryIndex}" data-item="${itemIndex}">${item.HARGA["250 GRAM"]}</td>
                    <td contenteditable="true" data-category="${categoryIndex}" data-item="${itemIndex}">${item.HARGA["100 GRAM"]}</td>
                    <td contenteditable="true" data-category="${categoryIndex}" data-item="${itemIndex}">${item.HARGA["50 GRAM"]}</td>
                    <td contenteditable="true" data-category="${categoryIndex}" data-item="${itemIndex}">${item.STOK.GUDANG}</td>
                    <td contenteditable="true" data-category="${categoryIndex}" data-item="${itemIndex}">${item.STOK.TOKO}</td>
                    <td>
                        <input type="date" class="date-input" value="${item.TANGGAL.MASUK || today}" 
                            oninput="PlastikDB.updateDate(${categoryIndex}, ${itemIndex}, 'MASUK', this.value)">
                    </td>
                    <td>
                        <input type="date" class="date-input" value="${item.TANGGAL.KELUAR || today}" 
                            oninput="PlastikDB.updateDate(${categoryIndex}, ${itemIndex}, 'KELUAR', this.value)">
                    </td>
                    <td>
                        <button class="save-button" onclick="PlastikDB.saveItem(${categoryIndex}, ${itemIndex})" style="display:none;">&#9729;</button>
                    </td>
                    <td><button class="delete-button" onclick="PlastikDB.deleteItem(${categoryIndex}, ${itemIndex})">&#128465;</button></td>
                `;
                tbody.appendChild(row);

                // Menambahkan event listener untuk menampilkan tombol save
                const editableCells = row.querySelectorAll('[contenteditable="true"]');
                editableCells.forEach(cell => {
                    cell.addEventListener('input', () => {
                        const saveButton = row.querySelector('.save-button');
                        saveButton.style.display = 'inline'; // Tampilkan tombol save
                    });
                });
            });
        });
    },

    addItem: function(categoryIndex) {
        const category = this.defaultData[categoryIndex];
        const newItem = {
            NO: category.items.length + 1,
            BARANG: '',
            KODE_TOKO: '',
            KODE_GUDANG: '',
            HARGA: { "DUS/BALL": '', "1 PACK": '', "1 PCS": '', "1000 GRAM": '', "500 GRAM": '', "250 GRAM": '', "100 GRAM": '', "50 GRAM": '' },
            STOK: { GUDANG: '', TOKO: '' },
            TANGGAL: { EXPAYER: '', MASUK: '', KELUAR: '' },
            category: category.category
        };
        category.items.push(newItem);
        this.loadTableFromHtml();
    }
};

// Memanggil fungsi untuk membuka database
KueDB.openDB();
PlastikDB.openDB();

function triggerUpdateFile() {
    document.getElementById('fileInput').click();
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = JSON.parse(e.target.result);
            PlastikDB.defaultData = data.PlastikDB.defaultData; // Pastikan untuk mengisi data dengan benar
            PlastikDB.saveAllToDB();
        };
        reader.readAsText(file);
    }
}

function downloadTable() {
    const plastikData = PlastikDB.defaultData;
    const dataStr = JSON.stringify(plastikData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plastik_data.json";
    a.click();
    URL.revokeObjectURL(url);
}

 function showContent(contentId) {
            var plastikContent = document.getElementById('mainContent');
            var kueContent = document.getElementById('mainContentKue');
            if (contentId === 'mainContent') {
                plastikContent.style.display = 'block';
                kueContent.style.display = 'none';
            } else {
                plastikContent.style.display = 'none';
                kueContent.style.display = 'block';
            }
        }
