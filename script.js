// JavaScript to handle form submission and store notes in localStorage

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const list = document.getElementById('notes-list');
    if (!form || !list) return;

    // Render saved notes to the list
    function renderNotes() {
        const notes = JSON.parse(localStorage.getItem('vocabNotes') || '[]');
        list.innerHTML = '';
        notes.forEach((note, index) => {
            const item = document.createElement('li');
            item.innerHTML =
                `<strong>${note.englishWord}</strong> - ${note.vietnameseMeaning}` +
                (note.usageExample ? `<br><em>${note.usageExample}</em>` : '') +
                (note.savedAt ? `<br><small class="note-time">${note.savedAt}</small>` : '') +
                ` <button class="delete-note" data-index="${index}">Xóa</button>`;
            list.appendChild(item);
        });
    }

    renderNotes();

    list.addEventListener('click', function (e) {
        const target = e.target;
        if (target.classList.contains('delete-note')) {
            const index = parseInt(target.getAttribute('data-index'), 10);
            const notes = JSON.parse(localStorage.getItem('vocabNotes') || '[]');
            notes.splice(index, 1);
            localStorage.setItem('vocabNotes', JSON.stringify(notes));
            renderNotes();
        }
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const englishWord = document.getElementById('english-word').value.trim();
        const vietnameseMeaning = document
            .getElementById('vietnamese-meaning')
            .value.trim();
        const usageExample = document
            .getElementById('usage-example')
            .value.trim();

        // Retrieve existing notes from localStorage or create an empty array
        const notes = JSON.parse(localStorage.getItem('vocabNotes') || '[]');
        // Add the new note
        notes.push({
            englishWord,
            vietnameseMeaning,
            usageExample,
            savedAt: new Date().toLocaleString('vi-VN'),
        });
        // Save back to localStorage
        localStorage.setItem('vocabNotes', JSON.stringify(notes));

        alert('Đã lưu ghi chú!');

        // Optional: clear the form
        form.reset();

        // Update the displayed notes
        renderNotes();
    });
});
