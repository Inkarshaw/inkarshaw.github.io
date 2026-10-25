const subjects = [
  { name: "Indian Polity", questions: 100, description: "Constitution, rights, Parliament, judiciary and governance." },
  { name: "Indian History", questions: 100, description: "Ancient, medieval, modern India and national movement." },
  { name: "Indian Geography", questions: 100, description: "Physical, Indian and human geography." },
  { name: "Indian Economy", questions: 100, description: "Basics, planning, banking, budget and development." },
  { name: "General Science", questions: 100, description: "Physics, chemistry, biology and everyday science." }
];

const group2Btn = document.getElementById("group2Btn");
const subjectsSection = document.getElementById("subjects");
const subjectGrid = document.getElementById("subjectGrid");

function renderSubjects() {
  subjectGrid.innerHTML = subjects.map(subject => `
    <article class="subject-card" data-subject="${subject.name}">
      <h3>${subject.name}</h3>
      <p>${subject.description}</p>
      <span class="count">${subject.questions} question target →</span>
    </article>
  `).join("");

  document.querySelectorAll(".subject-card").forEach(card => {
    card.addEventListener("click", () => {
      alert(`${card.dataset.subject} selected. Topic selection will be built in Step 3.`);
    });
  });
}

group2Btn.addEventListener("click", () => {
  subjectsSection.classList.remove("hidden");
  renderSubjects();
  subjectsSection.scrollIntoView({ behavior: "smooth" });
});
