
    // --- Simple localStorage-backed store ---
    const STORAGE_KEY = 'dm_records_v1';
    const form = document.getElementById('record-form');
    const tbody = document.getElementById('recordsTbody');
    const saveBtn = document.getElementById('saveBtn');
    const resetBtn = document.getElementById('resetBtn');

    let editingId = null;

    function loadRecords() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      } catch {
        return [];
      }
    }

    function saveRecords(records) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }

    function uid() {
      return 'id_' + Math.random().toString(36).slice(2, 9);
    }

    function clearForm() {
      form.reset();
      editingId = null;
      saveBtn.textContent = 'Add record';
    }

    function fillForm(record) {
      form.firstName.value = record.firstName || '';
      form.middleName.value = record.middleName || '';
      form.lastName.value = record.lastName || '';
      form.age.value = record.age || '';
      form.phone.value = record.phone || '';
      form.email.value = record.email || '';
    }

    function render() {
      const records = loadRecords();
      tbody.innerHTML = '';
      for (const r of records) {
        const tr = document.createElement('tr');

        // Cells (text or input if inline editing of this row)
        const isInlineEditing = editingId === r.id && r._inline;
        const cell = (key) => {
          const td = document.createElement('td');
          if (isInlineEditing) {
            const input = document.createElement('input');
            input.className = 'cell-input';
            input.value = r[key] || '';
            input.addEventListener('input', (e) => {
              r[key] = e.target.value;
              saveRecords(records);
            });
            td.appendChild(input);
          } else {
            td.textContent = r[key] || '';
          }
          return td;
        };

        tr.appendChild(cell('firstName'));
        tr.appendChild(cell('middleName'));
        tr.appendChild(cell('lastName'));
        tr.appendChild(cell('age'));
        tr.appendChild(cell('phone'));
        tr.appendChild(cell('email'));

        // Actions
        const actionsTd = document.createElement('td');
        const editBtn = document.createElement('button');
        editBtn.className = 'btn';
        editBtn.textContent = isInlineEditing ? 'Stop inline edit' : 'Inline edit';
        editBtn.title = 'Edit directly in row (hover to see)';
        editBtn.addEventListener('click', () => {
          const recs = loadRecords();
          for (const x of recs) x._inline = false;
          const target = recs.find(x => x.id === r.id);
          if (target) target._inline = !isInlineEditing;
          editingId = target && target._inline ? r.id : null;
          saveRecords(recs);
          render();
        });

        const updateBtn = document.createElement('button');
        updateBtn.className = 'btn primary';
        updateBtn.textContent = 'Load to form';
        updateBtn.title = 'Load this record into the form to update';
        updateBtn.addEventListener('click', () => {
          fillForm(r);
          editingId = r.id;
          saveBtn.textContent = 'Update record';
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn danger';
        deleteBtn.textContent = 'Delete';
        deleteBtn.title = 'Remove this record';
        deleteBtn.addEventListener('click', () => {
          const recs = loadRecords().filter(x => x.id !== r.id);
          saveRecords(recs);
          if (editingId === r.id) clearForm();
          render();
        });

        actionsTd.appendChild(editBtn);
        actionsTd.appendChild(updateBtn);
        actionsTd.appendChild(deleteBtn);
        tr.appendChild(actionsTd);

        tbody.appendChild(tr);
      }
    }

    // --- Form submit ---
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const record = {
        firstName: form.firstName.value.trim(),
        middleName: form.middleName.value.trim(),
        lastName: form.lastName.value.trim(),
        age: form.age.value.trim(),
        phone: form.phone.value.trim(),
        email: form.email.value.trim(),
      };

      const recs = loadRecords();

      if (editingId) {
        // Update existing
        const idx = recs.findIndex(x => x.id === editingId);
        if (idx > -1) {
          recs[idx] = { ...recs[idx], ...record };
          saveRecords(recs);
          clearForm();
          render();
          return;
        }
      }

      // Create new
      recs.push({ id: uid(), _inline: false, ...record });
      saveRecords(recs);
      clearForm();
      render();
    });

    // --- Reset form ---
    resetBtn.addEventListener('click', clearForm);

    

    // --- Initial render ---
    render();
  
    function logout() {
    // Redirect back to login page
    window.location.href = "../login.html"; 
  }

