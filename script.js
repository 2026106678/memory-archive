
// =====================================
// MEMORY ARCHIVE - JAVASCRIPT
// =====================================

// DATABASE LOCAL STORAGE
let memories = JSON.parse(
    localStorage.getItem("memoryArchive")
) || [];

// ELEMENT
const form = document.getElementById("memory-form");
const dateInput = document.getElementById("memory-date");

// DEFAULT DATE
dateInput.value = new Date().toLocaleDateString("en-CA");

// DISPLAY TODAY
document.getElementById("today").textContent =
    new Date().toLocaleDateString('en-GB', {
        weekday: "long",
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

// =====================================
// PAGE NAVIGATION
// =====================================

function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active-page");
    });

    document.getElementById(pageId).classList.add("active-page");

    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.remove("active");
    });

    const activeLink = document.querySelector(
        `[data-page="${pageId}"]`
    );

    if (activeLink) {
        activeLink.classList.add("active");
    }

    const titles = {
        home: "Dashboard",
        memories: "All Memories",
        add: "Add Memory",
        gallery: "Memory Gallery",
        calendar: "Memory Timeline"
    };

    document.getElementById("page-title").textContent =
        titles[pageId];

    renderAll();
}

// NAVIGATION CLICK
document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", function(event) {
        event.preventDefault();
        showPage(this.dataset.page);
    });
});

// =====================================
// SAVE DATA
// =====================================

function saveData() {
    localStorage.setItem(
        "memoryArchive",
        JSON.stringify(memories)
    );
}

// =====================================
// ESCAPE HTML
// =====================================

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

// =====================================
// ADD NEW MEMORY
// =====================================

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const title = document.getElementById("memory-title").value;
    const date = dateInput.value;
    const category = document.getElementById("memory-category").value;
    const description = document.getElementById("memory-description").value;
    const imageFile = document.getElementById("memory-image").files[0];

    if (imageFile && !imageFile.type.startsWith("image/")) {
        alert("File harus berupa gambar!");
        return;
    }

    if (imageFile && imageFile.size > 2 * 1024 * 1024) {
        alert("Ukuran foto maksimal 2 MB!");
        return;
    }

    const saveMemory = (imageData = "") => {
        const newMemory = {
            id: Date.now(),
            title,
            date,
            category,
            description,
            image: imageData
        };

        memories.push(newMemory);

        try {
            saveData();
        } catch (error) {
            memories.pop();
            alert("Penyimpanan penuh. Coba gunakan foto yang lebih kecil.");
            return;
        }

        form.reset();
        dateInput.value = new Date().toLocaleDateString("en-CA");

        renderAll();
        showPage("memories");

        alert("Memory berhasil disimpan!");
    };

    if (imageFile) {
        const reader = new FileReader();

        reader.onload = function() {
            saveMemory(reader.result);
        };

        reader.onerror = function() {
            alert("Foto gagal dibaca!");
        };

        reader.readAsDataURL(imageFile);
    } else {
        saveMemory();
    }
});

// =====================================
// MEMORY CARD
// =====================================

function createMemoryCard(memory) {
    return `
        <div class="memory-card">

            ${memory.image ? `
                <img src="${memory.image}" alt="Memory photo">
            ` : ""}

            <div class="memory-content">

                <small>${escapeHTML(memory.category)}</small>

                <h3>${escapeHTML(memory.title)}</h3>

                <small>${escapeHTML(memory.date)}</small>

                <p>${escapeHTML(memory.description)}</p>

                <button
                    class="delete-btn"
                    data-delete="${memory.id}">
                    DELETE MEMORY
                </button>

            </div>
        </div>
    `;
}

// =====================================
// DISPLAY ALL MEMORIES
// =====================================

function renderMemories() {
    const memoryList = document.getElementById("memory-list");

    const sorted = [...memories].sort(
        (a, b) => b.date.localeCompare(a.date)
    );

    if (sorted.length === 0) {
        memoryList.innerHTML =
            "<p>Belum ada kenangan. Yuk, simpan momen pertamamu!</p>";
        return;
    }

    memoryList.innerHTML = sorted
        .map(createMemoryCard)
        .join("");
}

// =====================================
// RECENT MEMORIES
// =====================================

function renderRecent() {
    const recentList = document.getElementById("recent-list");

    const recent = [...memories]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 3);

    if (recent.length === 0) {
        recentList.innerHTML =
            "<p>Belum ada kenangan terbaru.</p>";
        return;
    }

    recentList.innerHTML = recent
        .map(createMemoryCard)
        .join("");
}

// =====================================
// GALLERY
// =====================================

function renderGallery() {
    const gallery = document.getElementById("gallery-list");

    const photos = memories.filter(memory => memory.image);

    if (photos.length === 0) {
        gallery.innerHTML =
            "<p>Belum ada foto yang tersimpan.</p>";
        return;
    }

    gallery.innerHTML = photos.map(memory => `
        <img
            src="${memory.image}"
            alt="${escapeHTML(memory.title)}"
            title="${escapeHTML(memory.title)}">
    `).join("");
}

// =====================================
// TIMELINE
// =====================================

function renderCalendar() {
    const calendar = document.getElementById("calendar-list");

    const sorted = [...memories].sort(
        (a, b) => b.date.localeCompare(a.date)
    );

    if (sorted.length === 0) {
        calendar.innerHTML =
            "<p>Timeline masih kosong.</p>";
        return;
    }

    calendar.innerHTML = sorted.map(memory => `
        <div class="timeline-item">
            <small>${escapeHTML(memory.date)}</small>
            <h3>${escapeHTML(memory.title)}</h3>
            <p>${escapeHTML(memory.description)}</p>
        </div>
    `).join("");
}

// =====================================
// DASHBOARD STATISTICS
// =====================================

function renderStats() {
    const totalPhotos = memories.filter(
        memory => memory.image
    ).length;

    document.getElementById("total-memory").textContent =
        memories.length;

    document.getElementById("total-photo").textContent =
        totalPhotos;

    const latest = [...memories].sort(
        (a, b) => b.date.localeCompare(a.date)
    )[0];

    document.getElementById("last-update").textContent =
        latest ? latest.date : "---";
}

// =====================================
// DELETE MEMORY
// =====================================

document.addEventListener("click", function(event) {
    const button = event.target.closest("[data-delete]");

    if (!button) return;

    const id = Number(button.dataset.delete);

    const confirmation = confirm(
        "Apakah kamu yakin ingin menghapus kenangan ini?"
    );

    if (!confirmation) return;

    memories = memories.filter(memory => memory.id !== id);

    saveData();
    renderAll();
});

// =====================================
// REFRESH ALL DATA
// =====================================

function renderAll() {
    renderStats();
    renderRecent();
    renderMemories();
    renderGallery();
    renderCalendar();
}

// INITIALIZE
renderAll();


// RADIAL SIDEBAR TOGGLE

const radialToggle = document.getElementById("radialToggle");
const radialMenu = document.querySelector(".radial-menu");

radialToggle.addEventListener("click", function() {
    radialMenu.classList.toggle("open");
});

// Tutup menu setelah memilih halaman

document.querySelectorAll(".radial-item").forEach(item => {
    item.addEventListener("click", function() {
        radialMenu.classList.remove("open");
    });
});
