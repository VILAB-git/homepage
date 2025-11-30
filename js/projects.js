// Projects Page JavaScript - JSON-based management
document.addEventListener('DOMContentLoaded', async function () {
  const projectsContainer = document.querySelector('.projects-grid');

  let allProjects = [];

  // Initialize projects page
  await initializeProjects();

  // Load projects from JSON
  async function initializeProjects() {
    try {
      // Load projects data
      allProjects = await window.dataManager.getProjects();

      // Display projects
      displayProjects(allProjects);

    } catch (error) {
      console.error('Error initializing projects:', error);
      showErrorMessage();
    }
  }

  // Display projects in a grid layout
  function displayProjects(projects) {
    if (!projectsContainer) return;

    if (projects.length === 0) {
      projectsContainer.innerHTML = '<div class="no-results">No projects found matching your criteria.</div>';
      return;
    }

    const html = projects.map(project => createProjectHTML(project)).join('');
    projectsContainer.innerHTML = html;
  }

  // Create HTML for a single project
  function createProjectHTML(project) {
    const statusClass = project.status === 'ongoing' ? 'ongoing' :
      project.status === 'completed' ? 'completed' : 'planned';

    // Set base directory for project images
    const imageUrl = project.image
      ? (project.image.startsWith('http') || project.image.startsWith('../')
        ? project.image
        : `../../assets/images/projects/${project.image}`)
      : '';

    const linksHTML = project.links && Object.keys(project.links).length > 0 ? `
      <div class="project-links">
        ${project.links.github ? `<a href="${project.links.github}" class="project-link">GitHub</a>` : ''}
        ${project.links.project_page ? `<a href="${project.links.project_page}" class="project-link">Project Page</a>` : ''}
      </div>
    ` : '';

    return `
      <div class="project-card" data-category="${project.category}" data-status="${project.status}">
        ${project.image ? `<div class="project-image" style="width: 300px; height: 200px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
          <img src="${imageUrl}" alt="${project.title}" class="project-img" style="width: 100%; height: 100%; object-fit: cover;">
        </div>` : ''}

        <div class="project-header">
          <h3 class="project-title">
            ${project.role ? `(${project.role}) ` : ""}${project.title}
          </h3>
        </div>

        <div class="project-content">
          <div class="project-details">
            <div class="detail-item">
              <strong>Duration:</strong> ${project.duration || 'TBD'}
            </div>
            <div class="detail-item">
              <strong>Funding:</strong> ${project.funding || 'TBD'}
            </div>
            ${project.organization ? `<div class="detail-item"><strong>Organization:</strong> ${project.organization}</div>` : ''}
            <div class="detail-item">
              <strong>Status:</strong> <span class="${statusClass}" style="display: inline;">${project.status.charAt(0).toUpperCase() + project.status.slice(1)}</span>
            </div>
          </div>

          ${linksHTML}
        </div>
      </div>
    `;
  }

  // Show error message
  function showErrorMessage() {
    if (projectsContainer) {
      projectsContainer.innerHTML = `
        <div class="error-message">
          <h3>Error Loading Projects</h3>
          <p>Unable to load projects data. Please try refreshing the page.</p>
        </div>
      `;
    }
  }
});
