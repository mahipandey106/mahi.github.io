//registration
$("#registerBtn").click(() => {
  $.post('/api/register', {
    username: $("#regUser").val(),
    password: $("#regPass").val()
  }, res => {
    $("#regMsg").text(res.success ? "Registered!" : res.message);
  });
});

//login
$("#loginBtn").click(() => {
  $.post('/api/login', {
    username: $("#logUser").val(),
    password: $("#logPass").val()
  }, res => {
    if (res.success) {
      window.location = "/todo.html";
    } else {
      $("#logMsg").text(res.message);
    }
  });
});

//todo logic
// load todos
if (window.location.pathname === "/todo.html") {
  loadTodos();
}

function loadTodos() {
  $.get('/api/todos', todos => {
    $("#todoList").empty();
    todos.forEach(t => {
      $("#todoList").append(`
        <li>
          <span style="text-decoration:${t.done?'line-through':'none'}">${t.text}</span>
          <button onclick="toggleTodo('${t._id}')">Done</button>
          <button onclick="deleteTodo('${t._id}')">Delete</button>
        </li>
      `);
    });
  });
}

//add todos
$("#addBtn").click(() => {
  $.post('/api/todos', { text: $("#todoInput").val() }, () => {
    $("#todoInput").val('');
    loadTodos();
  });
});

//toggle
function toggleTodo(id) {
  $.post('/api/todos/toggle', { id }, loadTodos);
}

//delete
function deleteTodo(id) {
  $.post('/api/todos/delete', { id }, loadTodos);
}
