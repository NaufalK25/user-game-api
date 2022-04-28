const createUserGameModalButton = document.querySelector('button#createUserGameModalButton');

createUserGameModalButton.addEventListener('click', () => {
    const usernameInput = document.querySelector('input#username');
    const passwordInput = document.querySelector('input#password');

    setTimeout(() => {
        usernameInput.focus();
    }, 500);

    const createUserGameModalClearButton = document.querySelector('a#createUserGameModalClearButton');
    createUserGameModalClearButton.addEventListener('click', () => {
        usernameInput.value = '';
        passwordInput.value = '';

        setTimeout(() => {
            usernameInput.focus();
        }, 500);
    });
});

const updateUserGameModalButtons = document.querySelectorAll('button.updateUserGameModalButton');

updateUserGameModalButtons.forEach(updateUserGameModalButton => {
    updateUserGameModalButton.addEventListener('click', () => {
        const userGameId = updateUserGameModalButton.dataset.usergameid;
        const usernameInput = document.querySelector(`input#username-update-${userGameId}`);
        const passwordInput = document.querySelector(`input#password-update-${userGameId}`);

        setTimeout(() => {
            usernameInput.focus();
        }, 500);

        const updateUserGameModalResetButton = document.querySelector(`a#updateUserGameModalResetButton${userGameId}`);
        updateUserGameModalResetButton.addEventListener('click', () => {
            usernameInput.value = usernameInput.dataset.oldvalue;
            passwordInput.value = passwordInput.dataset.oldvalue;

            setTimeout(() => {
                usernameInput.focus();
            }, 500);
        });
    });
});
