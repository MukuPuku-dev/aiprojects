const grid = document.getElementById("project-grid");
const search = document.getElementById("project-search");
const emptyState = document.getElementById("empty-state");
const projectCount = document.getElementById("project-count");

function renderProjects(query = "") {
  const term = query.trim().toLowerCase();
  const matches = PROJECTS.filter(project =>
    [project.name, project.type, project.description].some(value => value.toLowerCase().includes(term))
  );

  grid.replaceChildren(...matches.map(project => {
    const card = document.createElement("article");
    card.className = `project-card ${project.accent}`;

    const top = document.createElement("div");
    top.className = "card-top";
    const mark = document.createElement("span");
    mark.className = "project-mark";
    mark.textContent = project.mark;
    mark.setAttribute("aria-hidden", "true");
    const type = document.createElement("span");
    type.className = "project-type";
    type.textContent = project.type;
    top.append(mark, type);

    const title = document.createElement("h3");
    title.textContent = project.name;
    const description = document.createElement("p");
    description.className = "project-description";
    description.textContent = project.description;
    const open = document.createElement("a");
    open.className = "open-project";
    open.href = project.href;
    open.textContent = "Open workspace";
    open.setAttribute("aria-label", `Open ${project.name} workspace`);
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";
    open.append(arrow);

    card.append(top, title, description, open);
    return card;
  }));

  emptyState.hidden = matches.length > 0;
  projectCount.textContent = `${PROJECTS.length} ${PROJECTS.length === 1 ? "project" : "projects"} · ready to continue`;
}

search.addEventListener("input", () => renderProjects(search.value));
renderProjects();
