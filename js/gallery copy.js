// Gallery Page JavaScript - JSON-based management
document.addEventListener('DOMContentLoaded', async function () {
  const galleryContainer = document.querySelector('.gallery-grid');
  const filterContainer = document.querySelector('.gallery-filters');
  const searchInput = document.querySelector('.gallery-search input');

  let allGalleryItems = [];
  let currentFilter = 'all';
  let currentSearch = '';

  // Initialize gallery page
  await initializeGallery();

  // Load gallery from JSON
  async function initializeGallery() {
    try {
      // Load gallery data
      allGalleryItems = await window.dataManager.getGalleryItems();

      // Create filter buttons if filter container exists
      if (filterContainer) {
        await createFilterButtons();
      }

      // Display gallery items
      displayGalleryItems(allGalleryItems);

      // Setup event listeners
      setupEventListeners();

    } catch (error) {
      console.error('Error initializing gallery:', error);
      showErrorMessage();
    }
  }

  // Create dynamic filter buttons based on available categories
  async function createFilterButtons() {
    const categories = await window.dataManager.getGalleryCategories();

    // Create filter buttons HTML
    const filterButtonsHTML = `
      <button class="filter-btn active" data-category="all">All</button>
      ${Object.entries(categories).map(([key, label]) =>
      `<button class="filter-btn" data-category="${key}">${label}</button>`
    ).join('')}
    `;

    filterContainer.innerHTML = filterButtonsHTML;
  }

  // Display gallery items in a grid layout
  function displayGalleryItems(items) {
    if (!galleryContainer) return;

    if (items.length === 0) {
      galleryContainer.innerHTML = '<div class="no-results">No gallery items found matching your criteria.</div>';
      return;
    }

    const html = items.map(item => createGalleryItemHTML(item)).join('');
    galleryContainer.innerHTML = html;
  }

  function formatYearMonthOnly(dateStr, locale = 'ko-KR') {
    try {
      // YYYY-MM → YYYY-MM-01 로 보정
      if (/^\d{4}-\d{2}$/.test(dateStr)) {
        const d = new Date(`${dateStr}-01T00:00:00`);
        return d.toLocaleDateString(locale, { year: 'numeric', month: 'long' });
      }
      // YYYY-MM-DD → 해당 월의 연·월만
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [y, m] = dateStr.split('-');
        const d = new Date(`${y}-${m}-01T00:00:00`);
        return d.toLocaleDateString(locale, { year: 'numeric', month: 'long' });
      }
      // 기타 문자열도 Date 파싱 후 연·월만
      const d = new Date(dateStr);
      if (!isNaN(d)) {
        return d.toLocaleDateString(locale, { year: 'numeric', month: 'long' });
      }
    } catch (_) {}
    // 파싱 실패 시 원문 반환(안전장치)
    return dateStr;
  }
  

  function createGalleryItemHTML(item) {
    const featuredClass = item.featured ? 'featured' : '';
    const formattedDate = formatYearMonthOnly(item.date); // 예: "2025년 8월"
  
    const imageUrl = item.image.startsWith('http') || item.image.startsWith('../')
      ? item.image
      : `../assets/images/gallery/${item.image}`;
  
    const venueHTML = item.venue || item.location ? `
      <div class="gallery-venue">
        ${item.venue ? `<span class="venue">${item.venue}</span>` : ''}
        ${item.location ? `<span class="location">${item.location}</span>` : ''}
      </div>
    ` : '';
  
    return `
      <div class="gallery-item ${featuredClass}" data-category="${item.category}">
        <div class="gallery-image">
          <img src="${imageUrl}" alt="${item.alt_text}" class="gallery-img">
          <div class="gallery-overlay">
            <h4 class="gallery-title">${item.title}</h4>
            <p class="gallery-description">${item.description}</p>
            <div class="gallery-meta">
              <span class="gallery-date">${formattedDate}</span>
              ${venueHTML}
            </div>
            <!-- 태그 출력 제거 -->
          </div>
        </div>
      </div>
    `;
  }
  

  // Setup event listeners
  function setupEventListeners() {
    // Filter buttons
    if (filterContainer) {
      filterContainer.addEventListener('click', function (e) {
        if (e.target.classList.contains('filter-btn')) {
          handleFilterClick(e.target);
        }
      });
    }

    // Search input
    if (searchInput) {
      searchInput.addEventListener('input', function (e) {
        currentSearch = e.target.value.toLowerCase();
        filterAndDisplayItems();
      });
    }

    // Gallery image clicks for modal/lightbox (optional enhancement)
    if (galleryContainer) {
      galleryContainer.addEventListener('click', function (e) {
        if (e.target.classList.contains('gallery-img')) {
          handleImageClick(e.target);
        }
      });
    }
  }

  // Handle filter button clicks
  function handleFilterClick(button) {
    const category = button.dataset.category;

    // Update active filter button
    filterContainer.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Update current filter
    currentFilter = category;

    filterAndDisplayItems();
  }

  // Filter and display gallery items based on current filters and search
  function filterAndDisplayItems() {
    let filteredItems = [...allGalleryItems];

    // Apply category filter
    if (currentFilter !== 'all') {
      filteredItems = filteredItems.filter(item => item.category === currentFilter);
    }

    // Apply search filter
    if (currentSearch) {
      filteredItems = filteredItems.filter(item =>
        item.title.toLowerCase().includes(currentSearch) ||
        item.description.toLowerCase().includes(currentSearch) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(currentSearch))) ||
        (item.venue && item.venue.toLowerCase().includes(currentSearch)) ||
        (item.location && item.location.toLowerCase().includes(currentSearch))
      );
    }

    displayGalleryItems(filteredItems);
  }

  // Handle gallery image clicks (basic implementation)
  function handleImageClick(img) {
    // Simple implementation - could be enhanced with a proper lightbox
    const modal = document.createElement('div');
    modal.className = 'gallery-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="modal-close">&times;</span>
        <img src="${img.src}" alt="${img.alt}" class="modal-img">
        <div class="modal-caption">
          <h4>${img.alt}</h4>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close modal functionality
    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.classList.contains('modal-close')) {
        document.body.removeChild(modal);
      }
    });

    // Close on escape key
    document.addEventListener('keydown', function onEscapeKey(e) {
      if (e.key === 'Escape') {
        if (document.body.contains(modal)) {
          document.body.removeChild(modal);
        }
        document.removeEventListener('keydown', onEscapeKey);
      }
    });
  }

  // Show error message
  function showErrorMessage() {
    if (galleryContainer) {
      galleryContainer.innerHTML = `
        <div class="error-message">
          <h3>Error Loading Gallery</h3>
          <p>Unable to load gallery data. Please try refreshing the page.</p>
        </div>
      `;
    }
  }
});
