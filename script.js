const UI = {
  reloadBtn: document.getElementById("reloadBtn"),
  UserCount: document.querySelector(".UserCount"),
  searchInput: document.querySelector("[name='searchInput']"),
  studentList: document.getElementById("studentsList"),

  studentForm: {
    form: document.getElementById("studentForm"),
    fullName: document.getElementById("fullName"),
    email: document.getElementById("email"),
    major: document.getElementById("major"),
    gpa: document.getElementById("gpa"),
    fullNameError: document.getElementById("fullNameError"),
    emailError: document.getElementById("emailError"),
    gpaError: document.getElementById("gpaError"),
  },
  clearBtn: document.getElementById("clearBtn"),
  createBtn: document.getElementById("createBtn"),

  editModal: document.getElementById("editModal"),
  editStudentForm: {
    form: document.getElementById("editStudentForm"),
    fullName: document.getElementById("editFullName"),
    email: document.getElementById("editEmail"),
    major: document.getElementById("editMajor"),
    gpa: document.getElementById("editGpa"),
    fullNameError: document.getElementById("editFullNameError"),
    emailError: document.getElementById("editEmailError"),
    gpaError: document.getElementById("editGpaError"),
  },
  cancelEditBtn: document.getElementById("cancelEditBtn"),
  updateBtn: document.getElementById("updateBtn"),

  spinnerContainer: document.querySelector(".spinner-container"),
  StudentCount: document.querySelector(".UserCount"),
  studentList: document.getElementById("studentsList"),
};

// ✅ Base URL for JSONPlaceholder demo API
const API_BASE = "https://jsonplaceholder.typicode.com";

// ✅ We'll GET /users and treat them as "students"
const LIST_URL = `${API_BASE}/users`;
let Students = [];

document.addEventListener("DOMContentLoaded", async () => {
  await reload();
});

UI.reloadBtn.addEventListener("click", async () => {
  await reload();
});

UI.createBtn.addEventListener("click", () => {
  addStudent();
});

UI.clearBtn.addEventListener("click", () => {
  UI.studentForm.form.reset();
  _hideFormError(UI.studentForm.fullNameError);
  _hideFormError(UI.studentForm.emailError);
  _hideFormError(UI.studentForm.gpaError);
});

UI.searchInput.addEventListener("input", debounce(handleSearchInput, 300));

function handleSearchInput(event) {
  if (!event.target.value.trim()) {
    renderStudentList();
    return;
  }
  UI.studentList.innerHTML = "";
  UI.spinnerContainer.classList.remove("disabled");
  const searchTerm = event.target.value.toLowerCase();
  const filteredStudents = Students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm),
  );
  setTimeout(() => {
    UI.spinnerContainer.classList.add("disabled");
    if (filteredStudents.length === 0) {
      UI.studentList.innerHTML = "<p>No students found.</p>";
      return;
    }
    renderStudentList(filteredStudents);
  }, 500);
}

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
UI.studentList.addEventListener("click", (event) => {
  handelOperation(event);
});
// ================
// Edit Modal
// ================
UI.cancelEditBtn.addEventListener("click", () => {
  UI.editModal.classList.add("disabled");
  UI.editStudentForm.form.reset();
});

UI.updateBtn.addEventListener("click", () => {
  if (!validateStudentForm(UI.editStudentForm)) {
    return;
  }

  const studentId = parseInt(UI.editStudentForm.form.dataset.studentId, 10);
  const studentIndex = Students.findIndex((s) => s.id === studentId);

  if (studentIndex !== -1) {
    Students[studentIndex].name = UI.editStudentForm.fullName.value;
    Students[studentIndex].email = UI.editStudentForm.email.value;
    Students[studentIndex].major = UI.editStudentForm.major.value;
    Students[studentIndex].gpa = UI.editStudentForm.gpa.value;
    renderStudentList();
  }

  UI.editModal.classList.add("disabled");
  UI.editStudentForm.form.reset();
  UI.editStudentForm.form.removeAttribute("data-student-id");
  UI.editStudentId.textContent = "";
});

function handelOperation(event) {
  // put an ID to the edit form to know which student is being edited
  UI.editStudentForm.form.dataset.studentId = event.target.dataset.id;
  const editStudentIdSpan = document.getElementById("editStudentId");
  editStudentIdSpan.textContent = event.target.dataset.id;

  const btnDelete = event.target.closest(".delete-btn");
  if (btnDelete) {
    handelDelete(btnDelete.dataset.id);
  }

  const btnEdit = event.target.closest(".edit-btn");
  if (btnEdit) {
    showEditModal(btnEdit.dataset.id);
  }
}

function CalcAvgGPA(student) {
  if (!student) return 0;
  student.gpa = (Math.random() * 4 + Math.random()).toFixed(1);
  return student.gpa;
}
function handelDelete(studentId) {
  Students = Students.filter(
    (student) => student.id !== parseInt(studentId, 10),
  );
  const isConfirmed = confirm(
    "Are you sure you want to delete this student? \nThis action cannot be undone.",
  );
  if (isConfirmed) {
    renderStudentList();
    UI.StudentCount.textContent = Students.length;
  }
}
// ================
// Edit Modal
// ================
function showEditModal(studentId) {
  const student = Students.find((s) => s.id === parseInt(studentId, 10));
  if (student) {
    UI.editStudentForm.fullName.value = student.name;
    UI.editStudentForm.email.value = student.email;
    UI.editStudentForm.major.value = student.major;
    UI.editStudentForm.gpa.value = student.gpa;
    UI.editModal.classList.remove("disabled");
  }
}

function AddMajor(student) {
  const majors = [
    "Computer Science",
    "Software Engineering",
    "Information Systems",
    "Data Science",
    "Cybersecurity",
  ];
  if (!student) return "";
  student.major = majors[Math.floor(Math.random() * majors.length)];
  return student.major;
}

async function reload() {
  UI.studentList.innerHTML = "";
  UI.spinnerContainer.classList.remove("disabled");
  setTimeout(async () => {
    try {
      const response = await fetch(LIST_URL);
      Students = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      Students = [];
    }
    console.log("Students loaded:", Students);
    UI.spinnerContainer.classList.add("disabled");
    renderStudentList();
  }, 1000);
}

function _showFormError(errorElement, message) {
  errorElement.textContent = message;
  errorElement.style.display = "block";
}

function _hideFormError(errorElement) {
  errorElement.style.display = "none";
}

function _renderStudent(student) {
  const card = document.createElement("article");
  card.classList.add("student-card");
  card.innerHTML = `
    <div class="student-info">
      <h3 class="student-name"></h3>
      <p class="student-email"></p>
      <div class="student-details">
        <span class="badge badge-id"></span>
        <span class="badge badge-major"></span>
        <span class="badge badge-gpa"></span>
      </div>
    </div>
    <div class="student-actions">
      <button type="button" data-id="${student.id}" class="btn btn-secondary edit-btn">Edit</button>
      <button type="button" data-id="${student.id}" class="btn btn-danger delete-btn">Delete</button>
    </div>
  `;

  // Safely insert dynamic values using textContent
  card.querySelector(".student-name").textContent = student.name;
  card.querySelector(".student-email").textContent = student.email;
  card.querySelector(".badge-id").textContent = `id: ${student.id}`;
  card.querySelector(".badge-major").textContent =
    `Major: ${AddMajor(student)}`;
  card.querySelector(".badge-gpa").textContent = `GPA: ${CalcAvgGPA(student)}`;

  return card;
}

function renderStudentList(filteredStudents = null) {
  // Clear the existing list
  UI.studentList.innerHTML = "";

  if (filteredStudents !== null) {
    for (const student of filteredStudents) {
      const card = _renderStudent(student);
      UI.studentList.appendChild(card);
    }
    return;
  }

  // Add student to the list HTML
  for (const student of Students) {
    const card = _renderStudent(student);
    UI.studentList.appendChild(card);
  }
  UI.StudentCount.textContent = Students.length;
}

function validateStudentForm(form) {
  let isValid = true;

  // Validate Full Name
  if (form.fullName.value.trim().length < 3) {
    _showFormError(
      form.fullNameError,
      "Please enter a valid name (at least 3 characters).",
    );
    isValid = false;
  } else {
    _hideFormError(form.fullNameError);
  }

  // Validate Email
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(form.email.value.trim())) {
    _showFormError(form.emailError, "Please enter a valid email address.");
    isValid = false;
  } else {
    _hideFormError(form.emailError);
  }

  // Validate GPA
  const gpaValue = parseFloat(form.gpa.value);
  if (isNaN(gpaValue) || gpaValue < 0.0 || gpaValue > 4.0) {
    _showFormError(form.gpaError, "Please enter a valid GPA (0.0 – 4.0).");
    isValid = false;
  } else {
    _hideFormError(form.gpaError);
  }

  return isValid;
}

function addStudent() {
  if (!validateStudentForm(UI.studentForm)) {
    return;
  }

  if (!UI.studentForm.form.checkValidity()) {
    UI.studentForm.form.reportValidity();
    return;
  }

  const newStudent = {
    id: Students.length + 1,
    name: UI.studentForm.fullName.value,
    email: UI.studentForm.email.value,
    major: UI.studentForm.major.value,
    gpa: parseFloat(UI.studentForm.gpa.value).toFixed(1),
  };
  Students.push(newStudent);
  const card = _renderStudent(newStudent);
  UI.studentList.prepend(card);
  UI.StudentCount.textContent = Students.length;
  UI.studentForm.form.reset();
}
