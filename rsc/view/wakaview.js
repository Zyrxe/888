const KueDB = {
    dbName: "yyyy",
    storeName: "zzzz",
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
            this.loadDataFromJSON(); // Load data from JSON
        };
    },

    loadDataFromJSON: function() {
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                this.defaultData = data.KueDB.defaultData; // Fill defaultData with data from JSON
                this.loadDataFromDB(); // Load data from IndexedDB after filling defaultData
            })
            .catch(error => console.error('Error loading JSON:', error));
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

    formatHarga: function(harga) {
        if (harga === '' || harga === undefined) {
            return '—';
        }
        return 'Rp ' + parseFloat(harga).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    formatTanggal: function(tanggal) {
        if (tanggal === '' || tanggal === undefined) {
            return '—';
        }
        const date = new Date(tanggal);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
        const year = date.getFullYear();
        return `${day} / ${month} / ${year}`;
    },

    loadTableFromHtml: function() {
        const tbody = document.querySelector("#dataTableKue tbody");
        tbody.innerHTML = '';

        this.defaultData.forEach((category, categoryIndex) => {
            const subTitleRow = document.createElement("tr");
            subTitleRow.classList.add("sub-title");
            subTitleRow.innerHTML = `<td colspan="20">${category.category}</td>`;
            tbody.appendChild(subTitleRow);

            category.items.forEach((item, itemIndex) => {
                const row = document.createElement("tr");
                row.classList.add("data-row");
                row.dataset.category = categoryIndex;
                row.dataset.item = itemIndex;
                row.innerHTML = `
                    <td>${item.NO}</td>
                    <td>${item.BARANG}</td>
                    <td>${item.KODE_TOKO}</td>
                    <td>${item.KODE_GUDANG}</td>
                    <td>${this.formatHarga(item.HARGA["DUS/BALL"])}</td>
                    <td>${this.formatHarga(item.HARGA["1 PACK"])}</td>
                    <td>${this.formatHarga(item.HARGA["1 PCS"])}</td>
                    <td>${this.formatHarga(item.HARGA["1000 GRAM"])}</td>
                    <td>${this.formatHarga(item.HARGA["500 GRAM"])}</td>
                    <td>${this.formatHarga(item.HARGA["250 GRAM"])}</td>
                    <td>${this.formatHarga(item.HARGA["100 GRAM"])}</td>
                    <td>${this.formatHarga(item.HARGA["50 GRAM"])}</td>
                    <td>${item.STOK.GUDANG}</td>
                    <td>${item.STOK.TOKO}</td>
                    <td>${this.formatTanggal(item.TANGGAL.EXPAYER)}</td>
                    <td>${this.formatTanggal(item.TANGGAL.MASUK)}</td>
                    <td>${this.formatTanggal(item.TANGGAL.KELUAR)}</td>
                `;
                tbody.appendChild(row);
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
    dbName: "777",
    storeName: "777",
    db: null,
    defaultData: [], // Empty defaultData

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
            this.loadDataFromJSON(); // Load data from JSON
        };
    },

    loadDataFromJSON: function() {
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                this.defaultData = data.PlastikDB.defaultData; // Fill defaultData with data from JSON
                this.loadDataFromDB(); // Load data from IndexedDB after filling defaultData
            })
            .catch(error => console.error('Error loading JSON:', error));
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

    formatHarga: function(harga) {
        if (harga === '' || harga === undefined) {
            return '—';
        }
        return 'Rp ' + parseFloat(harga).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    formatTanggal: function(tanggal) {
        if (tanggal === '' || tanggal === undefined) {
            return '*—*';
        }
        const date = new Date(tanggal);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
        const year = date.getFullYear();
        return `${day} / ${month} / ${year}`;
    },

    loadTableFromHtml: function() {
        const tbody = document.querySelector("#dataTablePlastik tbody");
        tbody.innerHTML = '';

        this.defaultData.forEach((category, categoryIndex) => {
            const subTitleRow = document.createElement("tr");
            subTitleRow.classList.add("sub-title");
            subTitleRow.innerHTML = `<td colspan="18">${category.category}</td>`;
            tbody.appendChild(subTitleRow);

            category.items.forEach((item, itemIndex) => {
                const row = document.createElement("tr");
                row.classList.add("data-row");
                row.dataset.category = categoryIndex;
                row.dataset.item = itemIndex;
                row.innerHTML = `
                    <td>${item.NO}</td>
                    <td>${item.BARANG}</td>
                    <td>${item.KODE_TOKO}</td>
                    <td>${item.KODE_GUDANG}</td>
                    <td>${this.formatHarga(item.HARGA["DUS/BALL"])}</td>
                    <td>${this.formatHarga(item.HARGA["1 PACK"])}</td>
                    <td>${this.formatHarga(item.HARGA["1 PCS"])}</td>
                    <td>${this.formatHarga(item.HARGA["1000 GRAM"])}</td>
                    <td>${this.formatHarga(item.HARGA["500 GRAM"])}</td>
                    <td>${this.formatHarga(item.HARGA["250 GRAM"])}</td>
                    <td>${this.formatHarga(item.HARGA["100 GRAM"])}</td>
                    <td>${this.formatHarga(item.HARGA["50 GRAM"])}</td>
                    <td>${item.STOK.GUDANG}</td>
                    <td>${item.STOK.TOKO}</td>
                    <td>${this.formatTanggal(item.TANGGAL.MASUK)}</td>
                    <td>${this.formatTanggal(item.TANGGAL.KELUAR)}</td>
                `;
                tbody.appendChild(row);
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

// Inisialisasi database
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
            PlastikDB.defaultData = data.PlastikDB.defaultData;
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
