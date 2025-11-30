// assets/js/news-list.js
document.addEventListener('DOMContentLoaded', async function () {
  const listEl = document.getElementById('news-list');
  if (!listEl) return;

  try {
    const newsItems = await window.dataManager.getNews(); // 전체 JSON

    if (!newsItems.length) {
      listEl.innerHTML = '<div class="no-results">No news yet.</div>';
      return;
    }

    // 최신순 정렬 (원하면 제거해도 됨)
    newsItems.sort((a, b) => new Date(b.date) - new Date(a.date));

    listEl.innerHTML = newsItems.map(createListItemHTML).join('');
  } catch (e) {
    console.error(e);
    listEl.innerHTML = `
      <div class="error-message">
        Error loading news. Please try again later.
      </div>`;
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

    // 카드 전체 클릭 가능하도록 <a>로 감싸기
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
});
