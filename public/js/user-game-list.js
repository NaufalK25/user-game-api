const createUserGameModalButton = document.querySelector('button#createUserGameModalButton');

createUserGameModalButton.addEventListener('click', () => {
    const emailInput = document.querySelector('input#email');
    const usernameInput = document.querySelector('input#username');
    const firstnameInput = document.querySelector('input#firstname');
    const lastnameInput = document.querySelector('input#lastname');
    const passwordInput = document.querySelector('input#password');
    const confirmPasswordInput = document.querySelector('input#confirmPassword');
    const ageInput = document.querySelector('input#age');
    const countryInput = document.querySelector('input#country');


    setTimeout(() => {
        emailInput.focus();
    }, 500);

    const createUserGameModalClearButton = document.querySelector('a#createUserGameModalClearButton');
    createUserGameModalClearButton.addEventListener('click', () => {
        emailInput.value = '';
        usernameInput.value = '';
        firstnameInput.value = '';
        lastnameInput.value = '';
        passwordInput.value = '';
        confirmPasswordInput.value = '';
        ageInput.value = '';
        countryInput.value = '';

        setTimeout(() => {
            emailInput.focus();
        }, 500);
    });
});

const updateUserGameModalButtons = document.querySelectorAll('button.updateUserGameModalButton');

updateUserGameModalButtons.forEach(updateUserGameModalButton => {
    updateUserGameModalButton.addEventListener('click', () => {
        const userGameId = updateUserGameModalButton.dataset.usergameid;
        const usernameInput = document.querySelector(`input#username-update-${userGameId}`);

        setTimeout(() => {
            usernameInput.focus();
        }, 500);

        const updateUserGameModalResetButton = document.querySelector(`a#updateUserGameModalResetButton${userGameId}`);
        updateUserGameModalResetButton.addEventListener('click', () => {
            usernameInput.value = usernameInput.dataset.oldvalue;

            setTimeout(() => {
                usernameInput.focus();
            }, 500);
        });
    });
});
