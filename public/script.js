
        const apiUrls = {
            students: "https://library-management-wyx6.onrender.com/library/students/",
            books: "https://library-management-wyx6.onrender.com/library/books/",
            borrowlist: "https://library-management-wyx6.onrender.com/library/borrowlist/",
            borrowrequest: "https://library-management-wyx6.onrender.com/library/borrowrequest/",
            register: "https://library-management-wyx6.onrender.com/auth/users/",
            login: "https://library-management-wyx6.onrender.com/auth/jwt/create/",
            userProfile: "https://library-management-wyx6.onrender.com/auth/users/me/",
            updateUserProfile: "https://library-management-wyx6.onrender.com/auth/users/me/",
            updateStudentProfile:"https://library-management-wyx6.onrender.com/library/students/me/",
        };
    
        let authToken = localStorage.getItem('authToken') || null;
        let isAuthenticated = !!authToken;
        let user = {};

// Check for existing user credentials and stored page in localStorage on page load
window.onload = function() {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
        authToken = storedToken;
        isAuthenticated = true; 
        loadUserProfile(); 
        updateUI(); 
    }

    // Retrieve the stored current page from localStorage or default to 'home'
    const storedPage = localStorage.getItem('currentPage') || 'home';
    showPage(storedPage);
};

    
function showPage(pageId) {
    const pages = ['home', 'login', 'register', 'profile', 'borrowList', 'bookList', 'studentList', 'borrowRequests'];
    
    // Hide all pages
    pages.forEach(page => {
        const pageElement = document.getElementById(page + 'Page');
        if (pageElement) {
            pageElement.classList.add('hidden');
        }
    });

    // Show the selected page
    const selectedPage = document.getElementById(pageId + 'Page');
    if (selectedPage) {
        selectedPage.classList.remove('hidden');
    }

    // Store the current page in localStorage
    localStorage.setItem('currentPage', pageId);

    // Load relevant data when showing specific pages
    if (pageId === 'bookList') loadBooks();
    if (pageId === 'studentList') loadStudents();
    if (pageId === 'borrowRequests') loadBorrowRequests();
    if (pageId === 'profile') loadUserProfile();
    if (pageId === 'borrowList') loadBorrowedBooks2();

    // Remove active class from all links
    const links = document.querySelectorAll('nav a');
    links.forEach(link => link.classList.remove('active'));

    // Add active class to the clicked link
    const activeLink = document.querySelector(`nav a[onclick="showPage('${pageId}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}


    
        function updateUI() {
            document.getElementById('loginLink').classList.toggle('hidden', isAuthenticated);
            document.getElementById('registerLink').classList.toggle('hidden', isAuthenticated);
            document.getElementById('profileLink').classList.toggle('hidden', !isAuthenticated);
            document.getElementById('borrowListLink').classList.toggle('hidden', !isAuthenticated);
            document.getElementById('studentListLink').classList.toggle('hidden', !isAuthenticated);
            document.getElementById('borrowRequestsLink').classList.toggle('hidden', !isAuthenticated);
            document.getElementById('logoutLink').classList.toggle('hidden', !isAuthenticated);
        }
    
        async function login(event) {
            event.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;

            const loginData = { username, password };

            try {
                const response = await fetch(apiUrls.login, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(loginData)
                });

                if (!response.ok) throw new Error('Login failed. Please check your credentials.');

                const data = await response.json();
                authToken = data.access; 
                localStorage.setItem('authToken', authToken);
                isAuthenticated = true; 
                loadUserProfile(); 
                updateUI(); 
                showPage('profile');
            } catch (error) {
                alert(error.message);
            }
        }
    
        async function register(event) {
            event.preventDefault();
            const username = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const firstName = document.getElementById('registerFirstName').value;
            const lastName = document.getElementById('registerLastName').value;
            const password = document.getElementById('registerPassword').value;

            const registerData = {
                username,
                email,
                first_name: firstName,
                last_name: lastName,
                password
            };

            try {
                const response = await fetch(apiUrls.register, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(registerData)
                });

                if (!response.ok) throw new Error('Registration failed.');

                alert('Registration successful! Please log in.');
                showPage('login');
            } catch (error) {
                alert(error.message);
            }
        }
    

    
        async function updateProfile(event) {
    event.preventDefault();
    const updatedData = {
        email: document.getElementById('userEmail').value, // Corrected ID
        first_name: document.getElementById('userFirstName').value, // Corrected ID
        last_name: document.getElementById('userLastName').value, // Corrected ID
        phone: document.getElementById('userPhone').value, // Corrected ID
        session: document.getElementById('userSession').value // Corrected ID
    };

    try {
        const userResponse = await fetch(apiUrls.updateStudentProfile, {
            method: 'PATCH',
            headers: {
                'Authorization': `JWT ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData) // Send the updated data
        });

        if (!userResponse.ok) throw new Error('Failed to update profile.');

        alert('Profile updated successfully!');

        // Reload the updated user profile
        await loadUserProfile();

        // Hide the update form and show the profile view
        hideUpdateForm();
    } catch (error) {
        alert(error.message);
    }
}



    function showUpdateForm() {
        document.getElementById('userInfo').classList.add('hidden');
        document.getElementById('updateForm').classList.remove('hidden');

        // Populate the update form with current user data
        document.getElementById('userEmail').value = user.student.email;
        document.getElementById('userFirstName').value = user.student.first_name;
        document.getElementById('userLastName').value = user.student.last_name;
        document.getElementById('userPhone').value = user.student.phone || '';
        document.getElementById('userSession').value = user.student.session || '';
    }

    function hideUpdateForm() {
        document.getElementById('userInfo').classList.remove('hidden');
        document.getElementById('updateForm').classList.add('hidden');
    }

    async function loadUserProfile() {
        try {
            const response = await fetch(apiUrls.updateStudentProfile, {
                method: 'GET',
                headers: {
                    'Authorization': `JWT ${authToken}`
                }
            });

            if (!response.ok) throw new Error('Failed to load user profile.');

            user = await response.json();
            console.log(user);
            document.getElementById('userUsername').innerText = user.student.roll;
            document.getElementById('userEmailDisplay').innerText = user.student.email;
            document.getElementById('userFirstNameDisplay').innerText = user.student.first_name;
            document.getElementById('userLastNameDisplay').innerText = user.student.last_name;
            document.getElementById('userPhoneDisplay').innerText = user.student.phone || '';
            document.getElementById('userSessionDisplay').innerText = user.student.session || '';

            localStorage.setItem('studentPhone', user.student.phone);
            localStorage.setItem('studentId', user.student.roll);
            localStorage.setItem('studentSession', user.student.session);
            loadBorrowedBooks();
        } catch (error) {
            alert(error.message);
        }
    }


// Function to calculate the remaining days until the book must be returned
function calculateRemainingDays(returnDate) {
    const currentDate = new Date();
    const dueDate = new Date(returnDate);
    
    // Calculate the difference in time
    const differenceInTime = dueDate.getTime() - currentDate.getTime();
    
    // Convert time difference to days (1000 ms/s * 60 s/min * 60 min/hr * 24 hr/day)
    const differenceInDays = Math.floor(differenceInTime / (1000 * 60 * 60 * 24));
    
    return differenceInDays > 0 ? differenceInDays : "Expired";
}


async function loadBorrowedBooks() {
     try {
        const response = await fetch(apiUrls.borrowlist, {
            method: 'GET',
            headers: {
                'Authorization': `JWT ${authToken}`
            }
        });

        if (!response.ok) throw new Error('Failed to load borrowed books.');

        const borrowedBooks = await response.json();
        const borrowedBooksList = document.getElementById('borrowedBooksList'); // Updated to match your table ID
        borrowedBooksList.innerHTML = '';

        // Filter the borrowed books to only show books of the logged-in user
        const userBorrowedBooks = borrowedBooks.filter(book => book.student.roll === user.student.roll);
        
        // Display the user's borrowed books
        userBorrowedBooks.forEach(book => {
            const issueDate = new Date(book.issue_date).toLocaleString();
            const returnDate = new Date(book.return_date).toLocaleString();
            const daysLeft = calculateDaysLeft(book.return_date); // Ensure this function exists

            borrowedBooksList.innerHTML += `
                <tr>
                    <td>${book.student.roll}</td>
                    <td>${book.book.book_name}</td>
                    <td>${book.book.author}</td>
                    <td>${issueDate}</td>
                    <td>${returnDate}</td>
                    <td>${daysLeft} days left</td>
                </tr>
            `;
        });
    } catch (error) {
        alert(error.message);
    }
}
// Define loadBorrowedBooks2 function
async function loadBorrowedBooks2() {
    try {
        const response = await fetch(apiUrls.borrowlist, {
            method: 'GET',
            headers: {
                'Authorization': `JWT ${authToken}`
            }
        });

        if (!response.ok) throw new Error('Failed to load borrowed books.');

        const borrowedBooks = await response.json();
        const borrowedBooksList = document.getElementById('borrowedBooksList2');
        borrowedBooksList.innerHTML = ''; // Clear the list before adding new items

        borrowedBooks.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.student.roll}</td>
                <td>${book.book.book_name}</td>
                <td>${book.book.author}</td>
                <td>${new Date(book.issue_date).toLocaleDateString()}</td>
                <td>${new Date(book.return_date).toLocaleDateString()}</td>
                <td>${calculateDaysLeft(book.return_date)}</td>
            `;
            borrowedBooksList.appendChild(row);
        });
    } catch (error) {
        alert(error.message);
    }
}

// Function to calculate days left until the return date
function calculateDaysLeft(returnDate) {
    const returnDateTime = new Date(returnDate).getTime();
    const todayTime = new Date().getTime();
    const daysLeft = Math.ceil((returnDateTime - todayTime) / (1000 * 3600 * 24));
    return daysLeft >= 0 ? daysLeft : 'Overdue'; // Return 'Overdue' if the return date has passed
}



let bookData = [];

    async function loadBooks() {
        try {
            const response = await fetch(apiUrls.books, {
                method: 'GET'
            });

            if (!response.ok) throw new Error('Failed to load books.');

            bookData = await response.json();
            renderBooks(bookData);
        } catch (error) {
            alert(error.message);
        }
    }

    function renderBooks(books) {
        const bookList = document.getElementById('bookList').getElementsByTagName('tbody')[0];
        bookList.innerHTML = '';

        books.forEach(book => {
            bookList.innerHTML += `
                <tr>
                    <td>${book.book_name}</td>
                    <td>${book.author}</td>
                    <td>${book.quantity}</td>
                    <td><button class="button" onclick="borrowBook(${book.id})">Borrow</button></td>
                </tr>
            `;
        });
    }

    function searchBooks() {
        const searchTerm = document.getElementById('bookSearch').value.toLowerCase();
        const filteredBooks = bookData.filter(book =>
            book.book_name.toLowerCase().includes(searchTerm) || 
            book.author.toLowerCase().includes(searchTerm)
        );
        renderBooks(filteredBooks);
    }

    function orderBooks() {
        const orderBy = document.getElementById('bookOrder').value;
        const orderDirection = document.getElementById('bookOrderDirection').value;
        let orderedBooks = [...bookData];

        if (orderBy) {
            orderedBooks.sort((a, b) => {
                let comparison = 0;

                if (orderBy === 'quantity') {
                    comparison = a[orderBy] - b[orderBy]; // Numeric comparison for quantity
                } else {
                    // String comparison for book_name and author
                    const aValue = a[orderBy]?.toLowerCase() || ''; // Safeguard for undefined values
                    const bValue = b[orderBy]?.toLowerCase() || '';
                    comparison = aValue.localeCompare(bValue);
                }

                // Return sorted results based on order direction
                return orderDirection === 'desc' ? -comparison : comparison;
            });
        }

        renderBooks(orderedBooks);
    }

    function filterBooks() {
        const filterBy = document.getElementById('bookFilter').value;
        let filteredBooks = [...bookData];

        if (filterBy === 'available') {
            filteredBooks = filteredBooks.filter(book => book.quantity > 0);
        } else if (filterBy === 'unavailable') {
            filteredBooks = filteredBooks.filter(book => book.quantity === 0);
        }

        renderBooks(filteredBooks);
    }
    // 


    let studentData = [];

// Load students from the backend
async function loadStudents() {
    try {
        const response = await fetch(apiUrls.students, {
            method: 'GET',
            headers: {
                'Authorization': `JWT ${authToken}`
            }
        });

        if (!response.ok) throw new Error('Failed to load students.');

        studentData = await response.json();

        console.log('Loaded student data:', studentData);

        renderStudents(studentData);
    } catch (error) {
        alert(error.message);
    }
}

// Render students in the table
function renderStudents(students) {
    const studentList = document.getElementById('studentList').getElementsByTagName('tbody')[0];
    studentList.innerHTML = '';

    students.forEach(student => {
        studentList.innerHTML += `
            <tr>
                <td>${student.first_name}</td>
                <td>${student.last_name}</td>
                <td>${student.roll}</td>
                <td>${student.session}</td> <!-- Show Session -->
            </tr>
        `;
    });
}

// Updated search function to handle first name, last name, username, session, and roll
function searchStudents() {
    const searchTerm = document.getElementById('studentSearch').value.toLowerCase();

    const filteredStudents = studentData.filter(student => {
        const firstName = student.first_name ? student.first_name.toLowerCase() : '';
        const lastName = student.last_name ? student.last_name.toLowerCase() : '';
        const username = student.username ? student.username.toLowerCase() : ''; // Assuming the 'username' field exists
        const session = student.session ? student.session.toLowerCase() : '';
        const roll = student.roll ? student.roll.toString().toLowerCase() : ''; // Ensure roll is treated as a string

        return (
            firstName.includes(searchTerm) || 
            lastName.includes(searchTerm) ||
            username.includes(searchTerm) ||
            session.includes(searchTerm) ||
            roll.includes(searchTerm) // Handle roll search
        );
    });

    console.log('Filtered students:', filteredStudents);

    renderStudents(filteredStudents);
}

// Updated ordering function to handle first name, last name, roll, and session
function orderStudents() {
    const orderBy = document.getElementById('studentOrder').value;
    const orderDirection = document.getElementById('studentOrderDirection').value;
    let orderedStudents = [...studentData];

    if (orderBy) {
        orderedStudents.sort((a, b) => {
            let comparison = 0;

            if (orderBy === 'roll') {
                // Compare numbers for roll
                comparison = a[orderBy] - b[orderBy];
            } else {
                // Compare strings for first_name, last_name, and session
                const aValue = a[orderBy] ? a[orderBy].toLowerCase() : '';
                const bValue = b[orderBy] ? b[orderBy].toLowerCase() : '';

                // Use localeCompare for string comparison
                comparison = aValue.localeCompare(bValue);
            }

            // Apply ascending or descending order
            return orderDirection === 'desc' ? -comparison : comparison;
        });
    }

    renderStudents(orderedStudents);
}


    
let borrowRequestsData = [];

async function loadBorrowRequests() {
    try {
        const response = await fetch(apiUrls.borrowrequest, {
            method: 'GET',
            headers: {
                'Authorization': `JWT ${authToken}`
            }
        });

        if (!response.ok) throw new Error('Failed to load borrow requests.');

        borrowRequestsData = await response.json();
        renderBorrowRequests(borrowRequestsData); // Call to render the data
    } catch (error) {
        alert(error.message);
    }
}
function renderBorrowRequests(requests) {
    const borrowRequestsList = document.getElementById('borrowRequestsList').getElementsByTagName('tbody')[0];
    borrowRequestsList.innerHTML = ''; // Clear the list

    requests.forEach(request => {
        const requestDate = new Date(request.request_date).toLocaleString();
        borrowRequestsList.innerHTML += `
            <tr>
                <td>${request.student.roll}</td>
                <td>${request.book.book_name}</td>
                <td>${request.book.author}</td>
                <td>${requestDate}</td>
                <td>${request.status}</td>
            </tr>
        `;
    });
}
function searchBorrowRequests() {
    const searchTerm = document.getElementById('borrowRequestSearch').value.toLowerCase();

    const filteredRequests = borrowRequestsData.filter(request => {
        const roll = request.student.roll.toLowerCase();
        const bookName = request.book.book_name.toLowerCase();
        const author = request.book.author.toLowerCase();
        
        return roll.includes(searchTerm) || bookName.includes(searchTerm) || author.includes(searchTerm);
    });

    renderBorrowRequests(filteredRequests);
}
function orderBorrowRequests() {
    const orderBy = document.getElementById('borrowRequestOrder').value;
    const orderDirection = document.getElementById('borrowRequestOrderDirection').value;
    let orderedRequests = [...borrowRequestsData];

    if (orderBy) {
        orderedRequests.sort((a, b) => {
            let comparison = 0;

            // Numeric comparison for roll (if needed)
            if (orderBy === 'student.roll') {
                comparison = a.student.roll - b.student.roll;
            } else if (orderBy === 'request_date') {
                comparison = new Date(a.request_date) - new Date(b.request_date);
            }else if (orderBy === 'status') {
                comparison = a.status.localeCompare(b.status);
             } else {
                // String comparison for book_name and author
                const aValue = orderBy === 'book.book_name' ? a.book.book_name.toLowerCase() : a.book.author.toLowerCase();
                const bValue = orderBy === 'book.book_name' ? b.book.book_name.toLowerCase() : b.book.author.toLowerCase();
                comparison = aValue.localeCompare(bValue);
            }

            return orderDirection === 'desc' ? -comparison : comparison;
        });
    }

    renderBorrowRequests(orderedRequests);
}





        async function borrowBook(bookId) {
    console.log(`Requesting to borrow book with ID: ${bookId}`);
    // Check if the user is authenticated
    if (!isAuthenticated) {
        alert("Please log in to request a book.");
        return; // Exit the function if the user is not authenticated
    }

    // Retrieve student session and phone from local storage or other source
    const studentSession = localStorage.getItem('studentSession'); // Assuming it's stored locally
    const studentPhone = localStorage.getItem('studentPhone'); // Assuming it's stored locally

    if (!studentSession || !studentPhone) {
        console.error("Student session or phone not found in localStorage.");
        alert("Error: Missing student session or phone.");
        return;
    }

    // Log the payload
    const payload = {
        book_id: bookId,
        student: {
            session: studentSession,
            phone: studentPhone
        }
    };
    console.log("Payload being sent: ", payload);

    try {
        const response = await fetch(apiUrls.borrowrequest, {
            method: 'POST',
            headers: {
                'Authorization': `JWT ${authToken}`,  // Use the correct JWT token for authentication
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload) // Convert the payload to JSON string
        });

        if (!response.ok) {
            const errorData = await response.json(); // Get response details if available
            console.error('Error details: ', errorData);
            throw new Error('Failed to borrow book.');
        }

        alert('Book borrowed successfully!');
    } catch (error) {
        console.error("Error response: ", error);
        alert(error.message);
    }
}





        function logout() {
            authToken = null;
            localStorage.removeItem('authToken');
            isAuthenticated = false;
            updateUI();
            showPage('home');
        }
   