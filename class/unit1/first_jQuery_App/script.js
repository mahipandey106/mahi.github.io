(function($){
  const STORAGE_KEY = 'jquery_todo_tasks_v1';
  let tasks = [], filter = 'all';

  function uid(){ return 't'+Date.now()+Math.floor(Math.random()*1000); }
  function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
  function load(){ try{ tasks = JSON.parse(localStorage.getItem(STORAGE_KEY))||[]; } catch(e){ tasks = []; } }
  function render(){
    const $list = $('#taskList').empty();
    const filtered = tasks.filter(t=>{
      if(filter==='all') return true;
      if(filter==='active') return !t.completed;
      if(filter==='completed') return t.completed;
    });
    if(filtered.length===0){ $list.append('<li style="opacity:.7;padding:16px;border-radius:8px;border:1px dashed #eef2ff;text-align:center">No tasks — add one!</li>'); }
    else{
      filtered.forEach(task=>{
        const $li = $('<li></li>').attr('data-id', task.id).toggleClass('completed', task.completed);
        const $checkbox = $('<input type="checkbox" class="chk">').prop('checked', !!task.completed);
        const $text = $('<div class="task-text"></div>').text(task.text);
        const $actions = $('<div class="task-actions"></div>');
        const $editBtn = $('<button class="edit">✏️</button>');
        const $delBtn = $('<button class="del">🗑️</button>');
        $actions.append($editBtn, $delBtn);
        $li.append($checkbox, $text, $actions);
        $list.append($li);
      });
    }
    $('#remainingCount').text(tasks.filter(t=>!t.completed).length);
  }
  function addTask(text){ text = (text||'').trim(); if(!text) return; tasks.unshift({id:uid(), text, completed:false}); save(); render(); }
  function removeTask(id){ tasks = tasks.filter(t=>t.id!==id); save(); render(); }
  function toggleTask(id, checked){ const t = tasks.find(x=>x.id===id); if(t){ t.completed = !!checked; save(); render(); }}
  function updateTaskText(id, newText){ newText = (newText||'').trim(); if(!newText) return; const t = tasks.find(x=>x.id===id); if(t){ t.text=newText; save(); render(); }}
  function clearCompleted(){ tasks = tasks.filter(t=>!t.completed); save(); render(); }
  load(); render();
  $('#addBtn').on('click', ()=>{ addTask($('#newTask').val()); $('#newTask').val('').focus(); });
  $('#newTask').on('keypress', function(e){ if(e.which===13){ addTask($(this).val()); $(this).val(''); } });
  $('#taskList').on('change', '.chk', function(){ const id=$(this).closest('li').data('id'); toggleTask(id,this.checked); });
  $('#taskList').on('click', '.del', function(){ const id=$(this).closest('li').data('id'); removeTask(id); });
  $('#taskList').on('dblclick', '.task-text', function(){ startEdit($(this).closest('li').data('id'), $(this)); });
  $('#taskList').on('click', '.edit', function(){ startEdit($(this).closest('li').data('id'), $(this).siblings('.task-text')); });
  function startEdit(id, $textEl){ const orig=$textEl.text(); const $input=$('<input type="text" class="edit-input" maxlength="200">').val(orig); $textEl.replaceWith($input); $input.focus().select(); function commit(){ const val=$input.val().trim(); if(val){ updateTaskText(id,val);} else { render(); } } function cancel(){ render(); } $input.on('keydown', e=>{ if(e.key==='Enter'){commit();} else if(e.key==='Escape'){cancel();}}); $input.on('blur', commit); }
  $('.filters').on('click', 'button', function(){ $('.filters button').removeClass('active'); $(this).addClass('active'); filter=$(this).data('filter'); render(); });
  $('#clearCompleted').on('click', ()=>{ clearCompleted(); });
  $(document).on('keydown', function(e){ if(e.key==='n' && $(':focus').length===0){ $('#newTask').focus(); } });
})(jQuery);