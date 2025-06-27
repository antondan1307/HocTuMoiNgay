// JavaScript to handle form submission and store notes in localStorage

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const list = document.getElementById('notes-list');
    const searchInput = document.getElementById('search');
    const notification = document.getElementById('notification');
    if (!form || !list) return;

    let notificationTimeout;

    function showNotification(msg, type = 'success') {
        if (!notification) return;
        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
            notificationTimeout = null;
        }
        notification.textContent = msg;
        notification.className = `notification ${type} show`;
        notificationTimeout = setTimeout(() => {
            notification.classList.remove('show');
            // Wait for the slide-up animation to finish then clear text and classes
            setTimeout(() => {
                notification.className = 'notification';
                notification.textContent = '';
            }, 400);
            notificationTimeout = null;
        }, 3000);
    }

    function showConfirm(msg, callback) {
        if (!notification) return;
        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
            notificationTimeout = null;
        }
        notification.innerHTML = `<span class="confirm-text">${msg}</span><div class="confirm-buttons"><button id="confirm-yes">Có</button><button id="confirm-no">Không</button></div>`;
        notification.className = 'notification confirm show';

        function cleanup() {
            notification.classList.remove('show', 'confirm', 'success', 'error');
            notification.innerHTML = '';
        }

        const yesBtn = document.getElementById('confirm-yes');
        const noBtn = document.getElementById('confirm-no');
        if (yesBtn) {
            yesBtn.addEventListener(
                'click',
                () => {
                    cleanup();
                    callback(true);
                },
                { once: true }
            );
        }
        if (noBtn) {
            noBtn.addEventListener(
                'click',
                () => {
                    cleanup();
                    callback(false);
                },
                { once: true }
            );
        }
    }


    // Render saved notes to the list
    function renderNotes(filter = '') {
        const notes = JSON.parse(localStorage.getItem('vocabNotes') || '[]');

        // Remove duplicate words and keep the first occurrence
        const uniqueMap = new Map();
        notes.forEach((n) => {
            const key = n.englishWord.toLowerCase();
            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, n);
            }
        });
        let uniqueNotes = Array.from(uniqueMap.values());
        if (uniqueNotes.length !== notes.length) {
            localStorage.setItem('vocabNotes', JSON.stringify(uniqueNotes));
        }

        // Sort notes alphabetically by the English word
        uniqueNotes = uniqueNotes.sort((a, b) =>
            a.englishWord.localeCompare(b.englishWord, 'en', { sensitivity: 'base' })
        );

        list.innerHTML = '';
        uniqueNotes
            .filter((n) =>
                n.englishWord.toLowerCase().includes(filter.toLowerCase())
            )
            .forEach((note) => {
                const item = document.createElement('li');
                item.innerHTML =
                    `<strong>${note.englishWord}</strong> - ${note.vietnameseMeaning}` +
                    (note.usageExample ? `<br><em>${note.usageExample}</em>` : '') +
                    (note.savedAt ? `<br><small class="note-time">${note.savedAt}</small>` : '') +
                    ` <button class="delete-note" data-word="${note.englishWord}">Xóa</button>`;
                list.appendChild(item);
            });
    }

    renderNotes();

    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            renderNotes(e.target.value.trim());
        });
    }

    list.addEventListener('click', function (e) {
        const target = e.target;
        if (target.classList.contains('delete-note')) {
            const word = target.getAttribute('data-word');
            const li = target.closest('li');
            if (li) li.classList.add('highlight-delete');
            showConfirm(`Bạn có chắc muốn xóa từ "${word}" không?`, (ok) => {
                if (li) li.classList.remove('highlight-delete');
                if (!ok || !li) return;

                li.classList.add('fade-out');
                li.addEventListener(
                    'transitionend',
                    () => {
                        let notes = JSON.parse(
                            localStorage.getItem('vocabNotes') || '[]'
                        );
                        notes = notes.filter(
                            (n) => n.englishWord.toLowerCase() !== word.toLowerCase()
                        );
                        localStorage.setItem('vocabNotes', JSON.stringify(notes));
                        renderNotes(searchInput ? searchInput.value.trim() : '');
                        showNotification('Đã xóa ghi chú!', 'success');
                    },
                    { once: true }
                );
            });
        }
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const englishInput = document.getElementById('english-word');
        const vietnameseInput = document.getElementById('vietnamese-meaning');
        const englishWord = englishInput.value.trim();
        const vietnameseMeaning = vietnameseInput.value.trim();
        const usageExample = document
            .getElementById('usage-example')
            .value.trim();

        if (!englishWord || !vietnameseMeaning) {
            if (!englishWord && !vietnameseMeaning) {
                showNotification(
                    'Bạn chưa nhập từ tiếng Anh và nghĩa tiếng Việt!',
                    'error'
                );
                englishInput.focus();
            } else if (!englishWord) {
                showNotification('Bạn chưa nhập từ tiếng Anh!', 'error');
                englishInput.focus();
            } else {
                showNotification('Bạn chưa nhập nghĩa tiếng Việt!', 'error');
                vietnameseInput.focus();
            }
            return;
        }

        // Retrieve existing notes from localStorage or create an empty array
        const notes = JSON.parse(localStorage.getItem('vocabNotes') || '[]');

        // Check for duplicates by English word
        const exists = notes.some(
            (n) => n.englishWord.toLowerCase() === englishWord.toLowerCase()
        );
        if (exists) {
            showNotification(`Từ "${englishWord}" đã được lưu rồi!`, 'error');
            return;
        }

        // Add the new note
        notes.push({
            englishWord,
            vietnameseMeaning,
            usageExample,
            savedAt: new Date().toLocaleDateString('vi-VN'),
        });

        // Save back to localStorage
        localStorage.setItem('vocabNotes', JSON.stringify(notes));

        showNotification('Đã lưu ghi chú!', 'success');

        // Optional: clear the form
        form.reset();

        // Update the displayed notes
        renderNotes();
    });
});
