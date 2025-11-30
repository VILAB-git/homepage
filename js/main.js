// News management - now using JSON data
let currentNewsCount = 5; // Initially show 5 news items
let allNewsData = []; // Will be populated from JSON

// DOM elements
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const newsList = document.getElementById('news-list');

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
  initializeNavigation();

  const isHomePage = document.body.classList.contains('home-page-main');
  
  // Only load news on homepage
  if (isHomePage && newsList) {
    loadNews();
  }

  setupSmoothScrolling();
  initializeFilters();
});

// Navigation functionality
function initializeNavigation() {
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('active');

      // Animate hamburger menu
      const bars = navToggle.querySelectorAll('.bar');
      bars.forEach((bar, index) => {
        if (navMenu.classList.contains('active')) {
          if (index === 0) bar.style.transform = 'rotate(-45deg) translate(-5px, 6px)';
          if (index === 1) bar.style.opacity = '0';
          if (index === 2) bar.style.transform = 'rotate(45deg) translate(-5px, -6px)';
        } else {
          bar.style.transform = 'none';
          bar.style.opacity = '1';
        }
      });
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const bars = navToggle.querySelectorAll('.bar');
        bars.forEach(bar => {
          bar.style.transform = 'none';
          bar.style.opacity = '1';
        });
      });
    });
  }
}

// // Load news items from JSON (homepage only)
// async function loadNews() {
//   if (!newsList) return;

//   try {
//     // Load news data from JSON
//     if (allNewsData.length === 0) {
//       allNewsData = await window.dataManager.getNews();
//     }

//     newsList.innerHTML = '';

//     for (let i = 0; i < Math.min(currentNewsCount, allNewsData.length); i++) {
//       const newsItem = createNewsItem(allNewsData[i]);
//       newsList.appendChild(newsItem);
//     }

//     // Hide "Load More" button if all news are displayed
//     const loadMoreBtn = document.querySelector('.news-actions button');
//     if (loadMoreBtn) {
//       if (currentNewsCount >= allNewsData.length) {
//         loadMoreBtn.style.display = 'none';
//       } else {
//         loadMoreBtn.style.display = 'inline-block';
//       }
//     }
//   } catch (error) {
//     console.error('Error loading news:', error);
//     // Show error message to user
//     newsList.innerHTML = '<div class="news-item"><div class="news-content">Error loading news. Please try again later.</div></div>';
//   }
// }

// // Load news items from JSON
async function loadNews() {
  if (!newsList) return;

  try {
    // 최신 3개만
    if (allNewsData.length === 0) {
      allNewsData = await window.dataManager.getNews({ limit: 5 });
    }

    newsList.innerHTML = '';

    allNewsData.forEach(item => {
      const newsItem = createNewsItem(item);
      newsList.appendChild(newsItem);
    });

    // 메인에서는 "Load More" 버튼 숨겨도 됨
    const loadMoreBtn = document.querySelector('.news-actions button');
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
  } catch (error) {
    console.error('Error loading news:', error);
    newsList.innerHTML =
      '<div class="news-item"><div class="news-content">Error loading news. Please try again later.</div></div>';
  }
}

// Create a news item element
function createNewsItem(news) {
  const newsItem = document.createElement('div');
  newsItem.className = 'news-item';

  if (news.category) newsItem.classList.add(`news-${news.category}`);
  if (news.featured) newsItem.classList.add('news-featured');

  const formattedDate = window.dataManager.formatDate(news.date, 'short');
  const summary = news.summary || news.content || '';

  // 상세 페이지 링크
  const detailUrl = `pages/news-detail.html?id=${encodeURIComponent(
    news.slug || news.id
  )}`;

  newsItem.style.opacity = '0';
  newsItem.style.transform = 'translateY(20px)';

  newsItem.innerHTML = `
    <a href="${detailUrl}" class="news-link-card">
      <div class="news-date">[${formattedDate}]</div>
      <div class="news-title">${news.title}</div>
      <div class="news-summary">${summary}</div>
    </a>
  `;

  setTimeout(() => {
    newsItem.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    newsItem.style.opacity = '1';
    newsItem.style.transform = 'translateY(0)';
  }, 100);

  return newsItem;
}

// Load more news
function loadMoreNews() {
  currentNewsCount += 5;
  loadNews();
}

// Initialize filter functionality for publications and gallery
function initializeFilters() {
  // Publications filter
  const publicationFilters = document.querySelectorAll('.publication-filters .filter-btn');
  const yearSections = document.querySelectorAll('.year-section');

  publicationFilters.forEach(btn => {
    btn.addEventListener('click', function () {
      const year = this.getAttribute('data-year');

      // Update active state
      publicationFilters.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      // Show/hide year sections
      yearSections.forEach(section => {
        if (year === 'all' || section.getAttribute('data-year') === year) {
          section.style.display = 'block';
        } else {
          section.style.display = 'none';
        }
      });
    });
  });

  // Gallery filter
  const galleryFilters = document.querySelectorAll('.gallery-filters .filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  galleryFilters.forEach(btn => {
    btn.addEventListener('click', function () {
      const category = this.getAttribute('data-category');

      // Update active state
      galleryFilters.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      // Show/hide gallery items
      galleryItems.forEach(item => {
        if (category === 'all' || item.getAttribute('data-category') === category) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

// Gallery load more functionality
function loadMoreGallery() {
  // This can be implemented to load more gallery items
}

// Smooth scrolling for navigation links
function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const headerOffset = 60;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Add scroll effect to navigation
window.addEventListener('scroll', function () {
  const header = document.querySelector('.header');
  if (header) {
    if (window.scrollY > 50) {
      header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
      header.style.boxShadow = 'none';
    }
  }
});

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function (entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function () {
  const animatedElements = document.querySelectorAll('.news-item, .person-card, .publication-item, .project-card, .gallery-item');
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
});

// Utility function to add new news (for future use)
function addNews(date, content) {
  newsData.unshift({ date, content });
  currentNewsCount = 5; // Reset to show first 5 items
  loadNews();
}

// Handle placeholder images with error fallback
document.addEventListener('DOMContentLoaded', function () {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.addEventListener('error', function () {
      // Create a placeholder if image fails to load
      this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPkltYWdlPC90ZXh0Pgo8L3N2Zz4K';
    });
  });
});

// Export functions for external use
window.loadMoreNews = loadMoreNews;
window.loadMoreGallery = loadMoreGallery;
window.addNews = addNews;
