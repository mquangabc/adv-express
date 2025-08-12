$(document).ready(function () {
  const currentPath = window.location.pathname;

  $('.nav-link[data-page]').each(function () {
    $(this).removeClass('active');
    const page = $(this).data('page');
    if (
      currentPath === '/' + page ||
      currentPath.startsWith('/' + page + '/')
    ) {
      $(this).addClass('active');
    }
  });
});

$('#loginForm').submit(async function (e) {
  e.preventDefault();
  const email = $('#loginEmail').val();
  const password = $('#loginPassword').val();

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      alert('Login successful!');
      location.reload();
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (error) {
    alert('An error occurred during login');
  }
});

// Register form handler
$('#registerForm').submit(async function (e) {
  e.preventDefault();
  const username = $('#registerUsername').val();
  const email = $('#registerEmail').val();
  const password = $('#registerPassword').val();
  const firstName = $('#registerFirstName').val();
  const lastName = $('#registerLastName').val();

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      }),
    });

    const data = await response.json();

    if (data.success) {
      alert('Registration successful!');
      location.reload();
    } else {
      alert(data.message || 'Registration failed');
    }
  } catch (error) {
    alert('An error occurred during registration');
  }
});

// Logout function
async function logout() {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
    });

    const data = await response.json();

    if (data.success) {
      alert('Logout successful!');
      location.reload();
    } else {
      alert(data.message || 'Logout failed');
    }
  } catch (error) {
    alert('An error occurred during logout');
  }
}

function showSection(sectionName) {
  // Hide all sections
  $('.content-section').addClass('d-none');

  // Show selected section
  $('#' + sectionName + '-section').removeClass('d-none');

  // Update nav active state
  $('.nav-link').removeClass('active');
  $(`[data-section="${sectionName}"]`).addClass('active');
}

// User management variables
let currentDeleteUserId = null;

// Set user for deletion
function setDeleteUser(row) {
  const $row = $(row);
  const cells = $row.children();
  const id = cells.eq(0).text();
  const username = cells.eq(2).text();

  currentDeleteUserId = id;
  $('#deleteUserName').text(username);
}

// Edit user form handler
$('#editUserForm').submit(async function (e) {
  e.preventDefault();

  const userId = $('#editUserId').val();
  const formData = new FormData();
  formData.append('username', $('#editUsername').val());
  formData.append('firstName', $('#editFirstName').val());
  formData.append('lastName', $('#editLastName').val());
  formData.append('email', $('#editEmail').val());

  const password = $('#editPassword').val();
  if (password) {
    formData.append('password', password);
  }

  const imageFile = $('#editImage')[0].files[0];
  if (imageFile) {
    formData.append('avatar', imageFile);
  }

  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      alert('User updated successfully!');
      $('#editUserModal').modal('hide');
      location.reload();
    } else {
      alert(data.message || 'User update failed');
    }
  } catch (error) {
    alert('An error occurred during user update');
  }
});

// Delete user confirmation handler
$('#confirmDeleteBtn').click(function () {
  if (currentDeleteUserId) {
    console.log('Deleting user with ID:', currentDeleteUserId);
    $('#deleteUserModal').modal('hide');
    currentDeleteUserId = null;
    // TODO: Implement API call
  }
});

$(document).ready(function () {
  $('#addImage').on('change', function (event) {
    const file = event.target.files[0];
    const preview = $('#previewImage');
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        preview.attr('src', e.target.result);
        preview.show();
      };
      reader.readAsDataURL(file);
    } else {
      preview.hide();
    }
  });

  $('#editImage').on('change', function (event) {
    const file = event.target.files[0];
    const preview = $('#previewImageEdit');
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        preview.attr('src', e.target.result);
        preview.show();
      };
      reader.readAsDataURL(file);
    } else {
      preview.hide();
    }
  });

  // Add user form handler
  $('#addUserForm').submit(async function (e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', $('#addUsername').val());
    formData.append('firstName', $('#addFirstName').val());
    formData.append('lastName', $('#addLastName').val());
    formData.append('email', $('#addEmail').val());
    formData.append('password', $('#addPassword').val());
    const imageFile = $('#addImage')[0].files[0];
    if (imageFile) {
      formData.append('avatar', imageFile);
    }

    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        alert('User created successfully!');
        $('#addUserModal').modal('hide');
        location.reload();
      } else {
        alert(data.message || 'User creation failed');
      }
    } catch (error) {
      alert('An error occurred during user creation');
    }
  });

  $('.editUserModal').click(async function () {
    const userId = $(this).data('id');
    $('#editUserId').val('');
    $('#editUsername').val('');
    $('#editFirstName').val('');
    $('#editLastName').val('');
    $('#editEmail').val('');
    $('#editPassword').val('');
    $('#previewImageEdit').hide();
    try {
      const response = await fetch('/api/users/' + userId, {
        method: 'GET',
      });

      const data = await response.json();

      if (data.success) {
        const user = data.data.user;
        console.log(user.avatar);
        $('#editUserId').val(user.id);
        $('#editUsername').val(user.username);
        $('#editFirstName').val(user.firstName);
        $('#editLastName').val(user.lastName);
        $('#editEmail').val(user.email);
        $('#editPassword').val(user.password);
        if (user.avatar) {
          $('#previewImageEdit').attr('src', user.avatar);
          $('#previewImageEdit').show();
        }
      } else {
        console.log(data.message || 'User creation failed');
      }
    } catch (error) {
      console.log(error);
    }
  });

  $('#editUserModal').submit(async function (e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', $('#editUsername').val());
    formData.append('first_name', $('#editFirstName').val());
    formData.append('last_name', $('#editLastName').val());
    formData.append('email', $('#editEmail').val());
    const imageFile = $('#editImage')[0].files[0];
    if (imageFile) {
      formData.append('avatar', imageFile);
    }

    try {
      const response = await fetch(
        '/api/users/update/' + $('#editUserId').val(),
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('User updated successfully!');
        $('#editUserModal').modal('hide');
        location.reload();
      } else {
        alert(data.message || 'User update failed');
      }
    } catch (error) {
      alert('An error occurred during user update', error);
    }
  });

  $('#confirmDeleteUserBtn').click(async function () {
    if (!currentDeleteUserId) return;
    try {
      const response = await fetch('/api/users/' + currentDeleteUserId, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        alert('User deleted successfully!');
        $('#deleteUserModal').modal('hide');
        location.reload();
      } else {
        alert(data.message || 'User delete failed');
      }
    } catch (error) {
      alert('An error occurred during user delete');
    }
  });
});

$(document).on('click', '.deleteUserModal', function () {
  currentDeleteUserId = $(this).data('id');
  const username = $(this).data('username');
  $('#deleteUserName').text(username);
});
