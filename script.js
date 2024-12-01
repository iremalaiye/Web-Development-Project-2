// Global variables
let lectures = [];
let students = [];

// Load data from localStorage
function loadData() {
  const lecturesJson = localStorage.getItem('lectures');
  const studentsJson = localStorage.getItem('students');

  if (lecturesJson) {
    lectures = JSON.parse(lecturesJson);
  }

  if (studentsJson) {
    students = JSON.parse(studentsJson);
  }

  updateLectureDropdown();
  updateFilterLectureDropdown();
  updateStudentTable(students);
  updateLectureList(); 
  updateGpaTable();
  
}

// Save data to localStorage
function saveData() {
  localStorage.setItem('lectures', JSON.stringify(lectures));
  localStorage.setItem('students', JSON.stringify(students));
}

//1-ADD LECTURE BUTTON
document.getElementById("lecture-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const lectureName = document.getElementById("lecture-name").value.trim();
  const scoreType = document.getElementById("score-type").value;
  
  // Lecture name required
  if (!lectureName) return alert("Lecture name is required!");
  
  // Lecture name validation
  const lectureNameRegex = /^[a-zA-Z][a-zA-Z0-9\s]*$/;
  if (!lectureNameRegex.test(lectureName)) {
    return alert("Lecture name cannot be only numbers!");
  }
  
  //lecture name must be unique
  if (lectures.some(lecture => lecture.name === lectureName)) {
    return alert("Lecture already exists!");
  }

  lectures.push({ name: lectureName, scoreType, students: [] });
  saveData();
  updateLectureList();
  updateLectureDropdown();
  updateFilterLectureDropdown();
  
  alert(`${lectureName} added successfully!`);
  document.getElementById("lecture-name").value = "";
  document.getElementById("score-type").value = "7";
  
  
});

//1-ADD LECTURE BUTTON FINISHED



// 2-LECTURES BUTTON
function updateLectureList() {
  const lectureList = document.getElementById("lecture-list-items");
  lectureList.innerHTML = ""; // Mevcut listeyi temizle
  lectures.forEach(lecture => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${lecture.name} - ${lecture.scoreType} Point Scale
      <button onclick="deleteLecture('${lecture.name}')">Delete</button>
    `;
    lectureList.appendChild(li);
  });
}


	// Delete lecture
	function deleteLecture(lectureName) {
	  const index = lectures.findIndex(lecture => lecture.name === lectureName);
	  if (index !== -1) {
		lectures.splice(index, 1); // delete lecture
		saveData();
		updateLectureList(); // updatelist
		alert(`${lectureName} has been deleted!`);
		
	  }
	}

// 2-LECTURES BUTTON FINISHED



// 3-ADD OR UPDATE STUDENT BUTTON

let currentStudentId = null;

document.getElementById("student-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const studentId = document.getElementById("student-id").value.trim();
  const studentName = document.getElementById("student-name").value.trim();
  const studentSurname = document.getElementById("student-surname").value.trim();
  const midterm = Number(document.getElementById("student-midterm").value);
  const final = Number(document.getElementById("student-final").value);
  const lectureName = document.getElementById("lecture-select").value;

  if (!lectureName) return alert("Please select a lecture!");
  
	//name and surname must be string type.
	const nameRegex = /^[a-zA-ZığüşöçİĞÜŞÖÇ\s]+$/; 
	  if (!nameRegex.test(studentName)) {
		return alert("Student name must contain only letters!");
	  }
	  if (!nameRegex.test(studentSurname)) {
		return alert("Student surname must contain only letters!");
	  }
	  
  
	 // Check if studentId is an integer
	  if (!Number.isInteger(Number(studentId)) || studentId <= 0) {
		return alert("Student ID must be a positive integer!");
	  }
	  
	  
	// one ID for one person
	  const existingStudent = students.find(stu => stu.id === studentId);
	  if (existingStudent) {
		if (existingStudent.name !== studentName || existingStudent.surname !== studentSurname) {
		  return alert("A student with this ID already exists");
		}
	  }


	//course grade must be between 0-100
	 if (isNaN(midterm) || midterm < 0 || midterm > 100) {
		return alert("Midterm score must be between 0 and 100!");
	  }

	  if (isNaN(final) || final < 0 || final > 100) {
		return alert("Final score must be between 0 and 100!");
	  }
	
	
  
   // If this is a new student (not an update), check if the student is already enrolled in the same lecture
  if (!currentStudentId) {
    const existingEnrollment = students.find(stu => stu.id === studentId && stu.lecture === lectureName);
    if (existingEnrollment) {
      return alert("This student has already enrolled in this lecture.");
    }
  }


  const lecture = lectures.find(lec => lec.name === lectureName);
  const { totalScore, grade7Point, grade10Point } = calculateGrade(midterm, final, lecture.scoreType);

  const student = {
    id: studentId,
    name: studentName,
    surname: studentSurname,
    lecture: lectureName,
    midterm,
    final,
    grade: totalScore.toFixed(2),
    grade7Point,
    grade10Point,
  };


  if (currentStudentId) {
    const index = students.findIndex(stu => stu.id === currentStudentId);
	//UPDATE
    if (index !== -1) {
      students[index] = student;
      const lectureIndex = lectures.findIndex(lec => lec.name === lectureName);
      lectures[lectureIndex].students = lectures[lectureIndex].students.map(stu => stu.id === studentId ? student : stu);
      alert("Student updated successfully!");
    }
	//ADD
  } else {
    students.push(student);
    lecture.students.push(student);
    alert("Student added successfully!");
  }


  saveData();
  updateStudentTable(students);
  updateGpaTable();
  resetStudentForm();
  currentStudentId = null; 
});


	// Reset student form
	function resetStudentForm() {
	  document.getElementById("student-id").value = "";
	  document.getElementById("student-name").value = "";
	  document.getElementById("student-surname").value = "";
	  document.getElementById("student-midterm").value = "";
	  document.getElementById("student-final").value = "";
	  document.getElementById("lecture-select").value = "";
	  document.getElementById("add-button").style.display = "inline-block";
	  document.getElementById("update-button").style.display = "none";
	  
	}


	// Updates the lecture selection dropdown to be used in adding or updating students.
	function updateLectureDropdown() {
	  const lectureSelect = document.getElementById("lecture-select");
	  lectureSelect.innerHTML = "<option value='' disabled selected>Select Lecture</option>";
	  lectures.forEach(lecture => {
		const option = document.createElement("option");
		option.value = lecture.name;
		option.textContent = `${lecture.name}`;
		lectureSelect.appendChild(option);
	  });
	}


// 3-ADD OR UPDATE STUDENT BUTTON FINISHED



//4-FILTER-STUDENT LIST BUTTON
		
	
// Updates the lecture selection dropdown that will be used for the filtering process.
function updateFilterLectureDropdown() {
  const filterLectureSelect = document.getElementById("filter-lecture-select");
  filterLectureSelect.innerHTML = "<option value='' disabled selected>Select Lecture</option>";
  lectures.forEach(lecture => {
    const option = document.createElement("option");
    option.value = lecture.name;
    option.textContent = `${lecture.name}`;
    filterLectureSelect.appendChild(option);
  });
}

	// FILTER FOR SELECTING LECTURE
	// VIEW ALL STUDENTS IN THIS LESSON
	document.getElementById("view-all").addEventListener("click", () => {
	  const selectedLecture = document.getElementById("filter-lecture-select").value;
	  if (selectedLecture) {
		const lecture = lectures.find(lec => lec.name === selectedLecture);
		if (lecture) {
		  updateStudentTable(lecture.students);
		}
	  } else {
		updateStudentTable(students);  // Show all students if no lecture is selected
	  }
	});

	// VIEW ALL PASSED STUDENTS IN THIS LESSON
	document.getElementById("view-passed").addEventListener("click", () => {
	  const selectedLecture = document.getElementById("filter-lecture-select").value;
	  if (selectedLecture) {
		const lecture = lectures.find(lec => lec.name === selectedLecture);
		if (lecture) {
		  // Adjusted filtering based on scoreType
		  updateStudentTable(lecture.students.filter(student => {
			// For 7-point scale, grade must be >= 70, for 10-point scale, grade must be >= 60
			return (lecture.scoreType === "7") ? student.grade >= 70 : student.grade >= 60;
		  }));
		}
	  } else {
		updateStudentTable(students.filter(student => { // Show passed students if no lecture is selected
		  // For 7-point scale, grade must be >= 70, for 10-point scale, grade must be >= 60
		  return (lecture.scoreType === "7") ? student.grade >= 70 : student.grade >= 60;
		}));
	  }
	});

	// VIEW ALL FAILED STUDENTS IN THIS LESSON
	document.getElementById("view-failed").addEventListener("click", () => {
	  const selectedLecture = document.getElementById("filter-lecture-select").value;
	  if (selectedLecture) {
		const lecture = lectures.find(lec => lec.name === selectedLecture);
		if (lecture) {
		  // Adjusted filtering based on scoreType
		  updateStudentTable(lecture.students.filter(student => {
			// For 7-point scale, grade must be < 70, for 10-point scale, grade must be < 60
			return (lecture.scoreType === "7") ? student.grade < 70 : student.grade < 60;
		  }));
		}
	  } else { // Show failed students if no lecture is selected
		updateStudentTable(students.filter(student => {
		  // For 7-point scale, grade must be < 70, for 10-point scale, grade must be < 60
		  return (lecture.scoreType === "7") ? student.grade < 70 : student.grade < 60;
		}));
	  }
	});

	// VIEW ALL DETAILS STUDENTS ABOUT THIS LESSON
	document.getElementById("view-details").addEventListener("click", () => {
	  const selectedLecture = document.getElementById("filter-lecture-select").value;
	  const lecture = lectures.find(lec => lec.name === selectedLecture);

	  if (lecture) {
		const passed = lecture.students.filter(stu => {
		  // For 7-point scale, grade must be >= 70, for 10-point scale, grade must be >= 60
		  return (lecture.scoreType === "7") ? stu.grade >= 70 : stu.grade >= 60;
		}).length;

		const failed = lecture.students.filter(stu => {
		  // For 7-point scale, grade must be < 70, for 10-point scale, grade must be < 60
		  return (lecture.scoreType === "7") ? stu.grade < 70 : stu.grade < 60;
		}).length;

		const mean = lecture.students.reduce((sum, stu) => sum + Number(stu.grade), 0) / lecture.students.length || 0;

		document.getElementById("details-passed").textContent = `Passed Students: ${passed}`;
		document.getElementById("details-failed").textContent = `Failed Students: ${failed}`;
		document.getElementById("details-mean").textContent = `Average Grade: ${mean.toFixed(2)}`;
		document.getElementById("lecture-details").style.display = "block";
	  } else {
		// If no lecture is selected, show overall statistics
		const passed = students.filter(stu => stu.grade >= (lecture.scoreType === "7" ? 70 : 60)).length;
		const failed = students.filter(stu => stu.grade < (lecture.scoreType === "7" ? 70 : 60)).length;
		const mean = students.reduce((sum, stu) => sum + Number(stu.grade), 0) / students.length || 0;

		document.getElementById("details-passed").textContent = `Passed Students: ${passed}`;
		document.getElementById("details-failed").textContent = `Failed Students: ${failed}`;
		document.getElementById("details-mean").textContent = `Average Grade: ${mean.toFixed(2)}`;
		document.getElementById("lecture-details").style.display = "block";
	  }
	});

		
	
	// Calculate grade based on the score type (7 or 10 points scale)
		function calculateGrade(midterm, final, scoreType) {
		  const totalScore = (midterm * 0.4) + (final * 0.6);  // Weighted average

		  let grade7Point = '';
		  let grade10Point = '';

		  if (scoreType === "7") {
			if (totalScore >= 93) grade7Point = 'A';
			else if (totalScore >= 85) grade7Point = 'B';
			else if (totalScore >= 77) grade7Point = 'C';
			else if (totalScore >= 70) grade7Point = 'D';
			else grade7Point = 'F';
		  }

		  if (scoreType === "10") {
			if (totalScore >= 90) grade10Point = 'A';
			else if (totalScore >= 80) grade10Point = 'B';
			else if (totalScore >= 70) grade10Point = 'C';
			else if (totalScore >= 60) grade10Point = 'D';
			else grade10Point = 'F';
		  }

		  return { totalScore, grade7Point, grade10Point };
		}



	// Update the student table
	function updateStudentTable(filteredStudents) {
	  const studentTableBody = document.getElementById("student-table").querySelector("tbody");
	  studentTableBody.innerHTML = "";

	  filteredStudents.forEach(student => {
		const row = document.createElement("tr");

		row.innerHTML = `
		  <td>${student.id}</td>
		  <td>${student.name}</td>
		  <td>${student.surname}</td>
		  <td>${student.lecture}</td>
		  <td>${student.midterm}</td>
		  <td>${student.final}</td>
		  <td>${student.grade}</td>
		   <td>${student.grade7Point || '-'}</td> <!-- Display 7 Point Scale or empty if not available -->
		  <td>${student.grade10Point || '-'}</td> <!-- Display 10 Point Scale or empty if not available -->
		
		  <td>
			<button onclick="editStudent('${student.id}')">Edit</button>
			<button onclick="deleteStudent('${student.id}')">Delete</button>
		  </td>
		`;
		studentTableBody.appendChild(row);
	  });
	}


// Search student by name
	document.getElementById("search").addEventListener("input", () => {
	  const searchTerm = document.getElementById("search").value.toLowerCase();
	  const filteredStudents = students.filter(student =>
		student.name.toLowerCase().includes(searchTerm) || student.surname.toLowerCase().includes(searchTerm)
	  );

	  updateStudentTable(filteredStudents);
	});
	
	
	// Edit student
	function editStudent(studentId) {
	  currentStudentId = studentId;
	  const student = students.find(stu => stu.id === studentId);
	  if (student) {
		document.getElementById("student-id").value = student.id;
		document.getElementById("student-name").value = student.name;
		document.getElementById("student-surname").value = student.surname;
		document.getElementById("student-midterm").value = student.midterm;
		document.getElementById("student-final").value = student.final;
		document.getElementById("lecture-select").value = student.lecture;
		document.getElementById("add-button").style.display = "none";
		document.getElementById("update-button").style.display = "inline-block";
		 showSection("add-student");
	  
	  }
	}


	// Delete student
	function deleteStudent(studentId) {
	  const index = students.findIndex(stu => stu.id === studentId);
	  if (index !== -1) {
		const student = students.splice(index, 1)[0];
		const lecture = lectures.find(lec => lec.name === student.lecture);
		lecture.students = lecture.students.filter(stu => stu.id !== studentId);
		saveData();
		updateStudentTable(students);
	  }
	}
	
	
	
	


// 5-GPA BUTTON

	function updateGpaTable() {
	  const gpaTableBody = document.querySelector("#gpa-table tbody");
	  gpaTableBody.innerHTML = "";  

	  const displayedIds = new Set(); 

	  students.forEach((student) => {
		// If the student ID is already displayed, skip this student
		if (displayedIds.has(student.id)) {
		  return;
		}

		const gpaRow = document.createElement("tr");
		const gpa = calculateGpa(student); // Calculate GPA

		gpaRow.innerHTML = `
		  <td>${student.id}</td>
		  <td>${student.name}</td>
		  <td>${student.surname}</td>
		  <td>${gpa.toFixed(2)}</td>  
		`;
		gpaTableBody.appendChild(gpaRow);

		
		displayedIds.add(student.id);
	  });
	}


	// Calculate GPA (average grade) using 4.0 scale
	function calculateGpa(student) {
	  const totalScore = (student.midterm * 0.4) + (student.final * 0.6);  // Weighted average
	  let gpa = 0;

	  if (totalScore >= 90) gpa = 4.0;
	  else if (totalScore >= 85) gpa = 3.7;  // A-
	  else if (totalScore >= 80) gpa = 3.3;  // B+
	  else if (totalScore >= 75) gpa = 3.0;  // B
	  else if (totalScore >= 70) gpa = 2.7;  // B-
	  else if (totalScore >= 65) gpa = 2.3;  // C+
	  else if (totalScore >= 60) gpa = 2.0;  // C
	  else if (totalScore >= 50) gpa = 1.7;  // C-
	  else gpa = 0.0;  // F

	  return gpa;
	}



// 5-GPA BUTTON FINISHED


	function showSection(sectionId) { //activate a specific section element and hides all other section elements.
	  document.querySelectorAll("section").forEach(section => {
		section.classList.remove("active");
	  });
	  document.getElementById(sectionId).classList.add("active");
	}




// Initialize on page load
loadData();
showSection("add-lecture");


