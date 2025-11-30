// assets/js/news-list.js
document.addEventListener('DOMContentLoaded', async function () {
  const listEl = document.getElementById('news-list');
  const filterContainer = document.querySelector('.news-filters');
  const searchInput = document.querySelector('.news-search input');

  if (!listEl) return;

  let allNews = [];
  let currentSearch = '';

  await initializeNews();

  // ------------------------
  // 초기화
  // ------------------------
  async function initializeNews() {
    try {
      allNews = await window.dataManager.getNews();

      if (!allNews.length) {
        listEl.innerHTML = '<div class="no-results">No news yet.</div>';
        return;
      }

      // 최신순 정렬
      allNews.sort((a, b) => new Date(b.date) - new Date(a.date));

      // 필터 버튼 생성 (type 기반)
      createFilterButtons();

      // 첫 렌더
      displayNews(allNews);

      // 이벤트 등록
      setupEventListeners();
    } catch (error) {
      console.error('Error initializing news:', error);
      showErrorMessage();
    }
  }

  // ------------------------
  // 필터 버튼 생성
  // ------------------------
  function createFilterButtons() {
    if (!filterContainer) return;

    const typeLabelMap = {
      publication: 'Publication',
      admission: 'Admission',
      graduation: 'Graduation',
      career: 'Career',
      award: 'Award',
      service: 'Service',
      media: 'Media'
    };

    // 원하는 순서 정의
    const preferredOrder = [
      'publication',
      'admission',
      'graduation',
      'career',
      'award',
      'service',
      'media'
    ];

    // 실제 존재하는 타입만 추출
    let types = Array.from(
      new Set(
        allNews
          .map(n => n.type)
          .filter(Boolean)
      )
    );

    // 원하는 순서대로 정렬 (없는 타입은 무시)
    types = types.sort(
      (a, b) => preferredOrder.indexOf(a) - preferredOrder.indexOf(b)
    );

    filterContainer.innerHTML = `
      <div class="filter-group">
        <label>Filter by Type:</label>
        <button class="filter-btn active" data-filter="type" data-value="all">All Types</button>
        ${types
          .map(
            t =>
              `<button class="filter-btn" data-filter="type" data-value="${t}">
                ${typeLabelMap[t] || t}
              </button>`
          )
          .join('')}
      </div>
    `;
  }

  // ------------------------
  // 리스트 렌더
  // ------------------------
  function displayNews(items) {
    if (!items.length) {
      listEl.innerHTML = '<div class="no-results">No news found.</div>';
      return;
    }

    listEl.innerHTML = items.map(createListItemHTML).join('');
  }

  function createListItemHTML(item) {
    const dateText = window.dataManager.formatDate(item.date, 'long');
    const summary = item.summary || item.content || '';
    const badge = item.type
      ? `<span class="news-type-badge news-type-${item.type}">
           ${item.type}
         </span>`
      : '';
    const url = `news-detail.html?id=${encodeURIComponent(
      item.slug || item.id
    )}`;

    return `
      <article class="news-list-item">
        <a href="${url}" class="news-list-link">
          <div class="news-list-meta">
            <span class="news-list-date">${dateText}</span>
            ${badge}
          </div>
          <h3 class="news-list-title">${item.title}</h3>
          ${
            summary
              ? `<p class="news-list-summary">${summary}</p>`
              : ''
          }
        </a>
      </article>
    `;
  }

  // ------------------------
  // 이벤트 설정
  // ------------------------
  function setupEventListeners() {
    if (filterContainer) {
      filterContainer.addEventListener('click', handleFilterClick);
    }

    if (searchInput) {
      searchInput.addEventListener('input', handleSearch);
    }
  }

  function handleFilterClick(e) {
    const btn = e.target;
    if (!btn.classList.contains('filter-btn')) return;

    const filterType = btn.dataset.filter;
    const filterValue = btn.dataset.value;

    if (filterType === 'type') {
      // 같은 그룹 내 active 업데이트
      const group = btn.closest('.filter-group');
      if (group) {
        group.querySelectorAll('.filter-btn').forEach(b =>
          b.classList.remove('active')
        );
      }
      btn.classList.add('active');
    }

    applyFilters();
  }

  function handleSearch(e) {
    currentSearch = (e.target.value || '').toLowerCase();
    applyFilters();
  }

  // ------------------------
  // 필터 적용
  // ------------------------
  function applyFilters() {
    let filtered = [...allNews];

    // type 필터
    const activeType = getActiveFilterValue('type');
    if (activeType !== 'all') {
      filtered = filtered.filter(item => item.type === activeType);
    }

    // 검색 (title / summary / content)
    if (currentSearch) {
      filtered = filtered.filter(item => {
        const title = (item.title || '').toLowerCase();
        const summary = (item.summary || '').toLowerCase();
        const content = (item.content || '').toLowerCase();
        return (
          title.includes(currentSearch) ||
          summary.includes(currentSearch) ||
          content.includes(currentSearch)
        );
      });
    }

    displayNews(filtered);
  }

  function getActiveFilterValue(filterType) {
    if (!filterContainer) return 'all';
    const activeBtn = filterContainer.querySelector(
      `[data-filter="${filterType}"].active`
    );
    return activeBtn ? activeBtn.dataset.value : 'all';
  }

  function showErrorMessage() {
    listEl.innerHTML = `
      <div class="error-message">
        Error loading news. Please try again later.
      </div>`;
  }
});
