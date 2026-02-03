// E-book functionality JavaScript

// Variables
let currentPage = 0;
const pages = document.querySelectorAll('.page');
const totalPages = pages.length;

// Navigation functions
function showPage(pageIndex) {
    if (pageIndex < 0 || pageIndex >= totalPages) return;
    pages.forEach((page, index) => {
        page.style.display = index === pageIndex ? 'block' : 'none';
    });
    currentPage = pageIndex;
    updateNavigation();
}

function nextPage() {
    if (currentPage < totalPages - 1) {
        showPage(currentPage + 1);
    }
}

function prevPage() {
    if (currentPage > 0) {
        showPage(currentPage - 1);
    }
}

function goToPage(pageNumber) {
    const pageIndex = pageNumber - 1; // Assuming page numbers start from 1
    if (pageIndex >= 0 && pageIndex < totalPages) {
        showPage(pageIndex);
    }
}

// Update navigation buttons
function updateNavigation() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageInfo = document.getElementById('page-info');

    if (prevBtn) prevBtn.disabled = currentPage === 0;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages - 1;
    if (pageInfo) pageInfo.textContent = `Page ${currentPage + 1} of ${totalPages}`;
}

// Table of contents
function createTOC() {
    const toc = document.getElementById('toc');
    if (!toc) return;

    pages.forEach((page, index) => {
        const title = page.querySelector('h1, h2, h3')?.textContent || `Page ${index + 1}`;
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = title;
        a.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(index);
        });
        li.appendChild(a);
        toc.appendChild(li);
    });
}

// Search functionality
function searchBook(query) {
    const results = [];
    pages.forEach((page, index) => {
        const text = page.textContent.toLowerCase();
        if (text.includes(query.toLowerCase())) {
            results.push({ page: index + 1, content: page.textContent.substring(0, 100) + '...' });
        }
    });
    return results;
}

// Font size adjustment
function changeFontSize(size) {
    document.body.style.fontSize = size + 'px';
}

// Full screen toggle
function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

// Sidebar toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

// Image interaction functionality
function initializeImageInteractions() {
    const images = document.querySelectorAll('.page img');
    images.forEach(img => {
        // Add click to zoom functionality
        img.addEventListener('click', function() {
            const isZoomed = this.classList.contains('zoomed');
            const overlay = document.querySelector('.image-overlay') || createOverlay();

            if (isZoomed) {
                this.classList.remove('zoomed');
                overlay.classList.remove('active');
            } else {
                // Close any other zoomed images first
                document.querySelectorAll('.page img.zoomed').forEach(img => {
                    img.classList.remove('zoomed');
                });
                this.classList.add('zoomed');
                overlay.classList.add('active');
            }
        });

        // Add touch/pan functionality for mobile
        let isDragging = false;
        let startX, startY, scrollLeft, scrollTop;

        img.addEventListener('mousedown', startDrag);
        img.addEventListener('touchstart', startDrag);

        img.addEventListener('mousemove', drag);
        img.addEventListener('touchmove', drag);

        img.addEventListener('mouseup', endDrag);
        img.addEventListener('touchend', endDrag);
        img.addEventListener('mouseleave', endDrag);

        function startDrag(e) {
            if (img.classList.contains('zoomed')) {
                isDragging = true;
                img.style.cursor = 'grabbing';
                startX = e.pageX - img.offsetLeft;
                startY = e.pageY - img.offsetTop;
                scrollLeft = img.scrollLeft;
                scrollTop = img.scrollTop;
            }
        }

        function drag(e) {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - img.offsetLeft;
            const y = e.pageY - img.offsetTop;
            const walkX = (x - startX) * 2;
            const walkY = (y - startY) * 2;
            img.scrollLeft = scrollLeft - walkX;
            img.scrollTop = scrollTop - walkY;
        }

        function endDrag() {
            isDragging = false;
            img.style.cursor = 'grab';
        }
    });
}

function createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'image-overlay';
    overlay.addEventListener('click', function() {
        document.querySelectorAll('.page img.zoomed').forEach(img => {
            img.classList.remove('zoomed');
        });
        this.classList.remove('active');
    });
    document.body.appendChild(overlay);
    return overlay;
}

// Bookmark functionality
function addBookmark() {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    if (!bookmarks.includes(currentPage)) {
        bookmarks.push(currentPage);
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        updateBookmarks();
    }
}

function updateBookmarks() {
    const bookmarkList = document.getElementById('bookmarks');
    if (!bookmarkList) return;

    bookmarkList.innerHTML = '';
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    bookmarks.forEach(pageIndex => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = `Page ${pageIndex + 1}`;
        a.addEventListener('click', () => showPage(pageIndex));
        li.appendChild(a);
        bookmarkList.appendChild(li);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (pages.length > 0) {
        showPage(0);
        createTOC();
        updateBookmarks();
        initializeImageInteractions();
    }

    // Event listeners
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') nextPage();
        if (e.key === 'ArrowLeft') prevPage();
    });

    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value;
            const results = searchBook(query);
            displaySearchResults(results);
        });
    }

    const fontSizeSelect = document.getElementById('font-size');
    if (fontSizeSelect) {
        fontSizeSelect.addEventListener('change', (e) => {
            changeFontSize(e.target.value);
        });
    }

    const prevBtn = document.getElementById('prev-btn');
    if (prevBtn) {
        prevBtn.addEventListener('click', prevPage);
    }

    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
        nextBtn.addEventListener('click', nextPage);
    }

    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullScreen);
    }

    const bookmarkBtn = document.getElementById('bookmark-btn');
    if (bookmarkBtn) {
        bookmarkBtn.addEventListener('click', addBookmark);
    }

    const menuBtn = document.getElementById('menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', toggleSidebar);
    }
});

function displaySearchResults(results) {
    const resultsDiv = document.getElementById('search-results');
    if (!resultsDiv) return;

    resultsDiv.innerHTML = '';
    if (results.length === 0) {
        resultsDiv.textContent = 'No results found.';
        return;
    }

    results.forEach(result => {
        const div = document.createElement('div');
        div.innerHTML = `<strong>Page ${result.page}:</strong> ${result.content}`;
        div.addEventListener('click', () => showPage(result.page - 1));
        resultsDiv.appendChild(div);
    });
}