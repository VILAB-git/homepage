// Gallery Page JavaScript - JSON-based management
document.addEventListener('DOMContentLoaded', async function () {
  const galleryContainer = document.querySelector('.gallery-grid');
  const filterContainer = document.querySelector('.gallery-filters');
  const searchInput = document.querySelector('.gallery-search input');

  let allGalleryItems = [];
  let currentFilter = 'all';
  let currentSearch = '';

  // 초기화
  await initializeGallery();

  async function initializeGallery() {
    try {
      const items = await window.dataManager.getGalleryItems();
      allGalleryItems = Array.isArray(items) ? items : [];

      if (filterContainer) {
        await createFilterButtons();
      }

      displayGalleryItems(allGalleryItems);
      setupEventListeners();
    } catch (error) {
      console.error('Error initializing gallery:', error);
      showErrorMessage();
    }
  }

  // 필터 버튼 생성
  async function createFilterButtons() {
    const categories = await window.dataManager.getGalleryCategories();

    const filterButtonsHTML = `
      <button class="filter-btn active" data-category="all">All</button>
      ${Object.entries(categories)
        .map(
          ([key, label]) =>
            `<button class="filter-btn" data-category="${key}">${label}</button>`
        )
        .join('')}
    `;
    filterContainer.innerHTML = filterButtonsHTML;
  }

  // 날짜 포맷 (연·월만)
  function formatYearMonthOnly(dateStr, locale = 'ko-KR') {
    try {
      if (/^\d{4}-\d{2}$/.test(dateStr)) {
        const d = new Date(`${dateStr}-01T00:00:00`);
        return d.toLocaleDateString(locale, { year: 'numeric', month: 'long' });
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [y, m] = dateStr.split('-');
        const d = new Date(`${y}-${m}-01T00:00:00`);
        return d.toLocaleDateString(locale, { year: 'numeric', month: 'long' });
      }
      const d = new Date(dateStr);
      if (!isNaN(d)) {
        return d.toLocaleDateString(locale, { year: 'numeric', month: 'long' });
      }
    } catch (_) {}
    return dateStr;
  }

  // 아이템별 이미지 리스트 생성
  // - images 배열이 있으면 그걸 사용
  // - 없으면 image_dir + image_count 기반으로
  //   ../assets/images/gallery/<dir>/<dir>-1.jpg ~ -N.jpg 생성
  // - 그것도 없으면 단일 image 필드 사용
  function getImageUrlsForItem(item) {
    const baseDir = '../assets/images/gallery/';

    if (Array.isArray(item.images) && item.images.length > 0) {
      return item.images.map((name) =>
        name.startsWith('http') || name.startsWith('../')
          ? name
          : baseDir + name
      );
    }

    if (item.image_dir && item.image_count) {
      const dir = item.image_dir.replace(/\/+$/, '');
      const count = Number(item.image_count) || 0;
      const urls = [];
      for (let i = 1; i <= count; i++) {
        const filename = `${dir}-${i}.jpg`;
        urls.push(`${baseDir}${dir}/${filename}`);
      }
      if (urls.length > 0) return urls;
    }

    if (item.image) {
      const url =
        item.image.startsWith('http') || item.image.startsWith('../')
          ? item.image
          : baseDir + item.image;
      return [url];
    }

    return [];
  }

  // 개별 카드 HTML 생성
  function createGalleryItemHTML(item) {
    const featuredClass = item.featured ? 'featured' : '';
    const formattedDate = formatYearMonthOnly(item.date);

    const imageUrls = getImageUrlsForItem(item);
    if (imageUrls.length === 0) return '';

    const mainImageUrl = imageUrls[0];
    const imagesDataAttr = imageUrls.join('|');

    const venueHTML =
      item.venue || item.location
        ? `
      <div class="gallery-venue">
        ${item.venue ? `<span class="venue">${item.venue}</span>` : ''}
        ${item.location ? `<span class="location">${item.location}</span>` : ''}
      </div>
    `
        : '';

    return `
      <div class="gallery-item ${featuredClass}"
           data-category="${item.category}"
           data-images="${imagesDataAttr}">
        <div class="gallery-image">
          <img src="${mainImageUrl}" alt="${item.alt_text || item.title}" class="gallery-img">
          <div class="gallery-overlay">
            <h4 class="gallery-title">${item.title}</h4>
            <p class="gallery-description">${item.description || ''}</p>
            <div class="gallery-meta">
              <span class="gallery-date">${formattedDate}</span>
              ${venueHTML}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 아이템들 표시
  function displayGalleryItems(items) {
    if (!galleryContainer) return;

    if (!Array.isArray(items) || items.length === 0) {
      galleryContainer.innerHTML =
        '<div class="no-results">No gallery items found matching your criteria.</div>';
      return;
    }

    const html = items
      .map((item) => createGalleryItemHTML(item))
      .filter(Boolean)
      .join('');

    galleryContainer.innerHTML = html;
  }

  // 이벤트 리스너 등록
  function setupEventListeners() {
    // 필터 버튼
    if (filterContainer) {
      filterContainer.addEventListener('click', function (e) {
        if (e.target.classList.contains('filter-btn')) {
          handleFilterClick(e.target);
        }
      });
    }

    // 검색
    if (searchInput) {
      searchInput.addEventListener('input', function (e) {
        currentSearch = e.target.value.toLowerCase();
        filterAndDisplayItems();
      });
    }

    // 갤러리 아이템 클릭 → 슬라이드 모달
    if (galleryContainer) {
      galleryContainer.addEventListener('click', function (e) {
        const itemElement = e.target.closest('.gallery-item');
        if (!itemElement) return;

        const imagesData = itemElement.dataset.images;
        if (!imagesData) return;

        const images = imagesData.split('|').filter(Boolean);
        if (!images.length) return;

        openGalleryModal(images, 0);
      });
    }
  }

  // 필터 버튼 클릭 처리
  function handleFilterClick(button) {
    const category = button.dataset.category;

    filterContainer
      .querySelectorAll('.filter-btn')
      .forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');

    currentFilter = category;
    filterAndDisplayItems();
  }

  // 필터 + 검색 적용
  function filterAndDisplayItems() {
    let filteredItems = [...allGalleryItems];

    if (currentFilter !== 'all') {
      filteredItems = filteredItems.filter(
        (item) => item.category === currentFilter
      );
    }

    if (currentSearch) {
      filteredItems = filteredItems.filter((item) => {
        const title = (item.title || '').toLowerCase();
        const description = (item.description || '').toLowerCase();
        const venue = (item.venue || '').toLowerCase();
        const location = (item.location || '').toLowerCase();
        const tags = Array.isArray(item.tags) ? item.tags : [];

        const matchTags = tags.some((tag) =>
          (tag || '').toLowerCase().includes(currentSearch)
        );

        return (
          title.includes(currentSearch) ||
          description.includes(currentSearch) ||
          venue.includes(currentSearch) ||
          location.includes(currentSearch) ||
          matchTags
        );
      });
    }

    displayGalleryItems(filteredItems);
  }

  // 슬라이드 가능한 모달
  function openGalleryModal(images, startIndex = 0) {
    if (!images || !images.length) return;

    let currentIndex = startIndex;

    const modal = document.createElement('div');
    modal.className = 'gallery-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="modal-close">&times;</span>
        <button class="modal-nav modal-prev">&#10094;</button>
        <img src="${images[currentIndex]}" class="modal-img" alt="">
        <button class="modal-nav modal-next">&#10095;</button>
        <div class="modal-counter">
          ${currentIndex + 1} / ${images.length}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const modalImg = modal.querySelector('.modal-img');
    const prevBtn = modal.querySelector('.modal-prev');
    const nextBtn = modal.querySelector('.modal-next');
    const closeBtn = modal.querySelector('.modal-close');
    const counter = modal.querySelector('.modal-counter');

    function updateImage(newIndex) {
      if (newIndex < 0) newIndex = images.length - 1;
      if (newIndex >= images.length) newIndex = 0;
      currentIndex = newIndex;
      modalImg.src = images[currentIndex];
      if (counter) {
        counter.textContent = `${currentIndex + 1} / ${images.length}`;
      }
    }

    function closeModal() {
      if (document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
      document.removeEventListener('keydown', onKeyDown);
    }

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'ArrowLeft') {
        updateImage(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        updateImage(currentIndex + 1);
      }
    }

    prevBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      updateImage(currentIndex - 1);
    });

    nextBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      updateImage(currentIndex + 1);
    });

    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closeModal();
    });

    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', onKeyDown);
  }

  // 에러 메시지
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
