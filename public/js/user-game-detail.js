const createUserGameBiodataModalButton = document.querySelector('button#createUserGameBiodataModalButton');

createUserGameBiodataModalButton?.addEventListener('click', () => {
    const emailInput = document.querySelector('input#email');
    const firstnameInput = document.querySelector('input#firstname');
    const lastnameInput = document.querySelector('input#lastname');
    const ageInput = document.querySelector('input#age');
    const countryInput = document.querySelector('input#country');

    setTimeout(() => {
        emailInput.focus();
    }, 500);

    const createUserGameBiodataModalClearButton = document.querySelector('a#createUserGameBiodataModalClearButton');
    createUserGameBiodataModalClearButton?.addEventListener('click', () => {
        emailInput.value = '';
        firstnameInput.value = '';
        lastnameInput.value = '';
        ageInput.value = '';
        countryInput.value = '';

        setTimeout(() => {
            emailInput.focus();
        }, 500);
    });
});

const updateUserGameBiodataModalButton = document.querySelector('button#updateUserGameBiodataModalButton');

updateUserGameBiodataModalButton?.addEventListener('click', () => {
    const emailInput = document.querySelector('input#email');
    const firstnameInput = document.querySelector('input#firstname');
    const lastnameInput = document.querySelector('input#lastname');
    const ageInput = document.querySelector('input#age');
    const countryInput = document.querySelector('input#country');

    setTimeout(() => {
        emailInput.focus();
    }, 500);

    const updateUserGameBiodataModalResetButton = document.querySelector('a#updateUserGameBiodataModalResetButton');
    updateUserGameBiodataModalResetButton?.addEventListener('click', () => {
        emailInput.value = emailInput.dataset.oldvalue;
        firstnameInput.value = firstnameInput.dataset.oldvalue;
        lastnameInput.value = lastnameInput.dataset.oldvalue;
        ageInput.value = ageInput.dataset.oldvalue;
        countryInput.value = countryInput.dataset.oldvalue;

        setTimeout(() => {
            emailInput.focus();
        }, 500);
    });
});

const createUserGameHistoryModalButton = document.querySelector('button#createUserGameHistoryModalButton');

createUserGameHistoryModalButton.addEventListener('click', () => {
    const titleInput = document.querySelector('input#title');
    const publisherInput = document.querySelector('input#publisher');
    const scoreInput = document.querySelector('input#score');

    setTimeout(() => {
        titleInput.focus();
    }, 500);

    const createUserGameHistoryModalClearButton = document.querySelector('a#createUserGameHistoryModalClearButton');
    createUserGameHistoryModalClearButton.addEventListener('click', () => {
        titleInput.value = '';
        publisherInput.value = '';
        scoreInput.value = '';

        setTimeout(() => {
            titleInput.focus();
        }, 500);
    });
});

const updateUserGameHistoryModalButtons = document.querySelectorAll('button.updateUserGameHistoryModalButton');

updateUserGameHistoryModalButtons.forEach(updateUserGameHistoryModalButton => {
    updateUserGameHistoryModalButton.addEventListener('click', () => {
        const historyId = updateUserGameHistoryModalButton.dataset.usergamehistoryid;
        const titleInput = document.querySelector(`input#title-update-${historyId}`);
        const publisherInput = document.querySelector(`input#publisher-update-${historyId}`);
        const scoreInput = document.querySelector(`input#score-update-${historyId}`);

        setTimeout(() => {
            titleInput.focus();
        }, 500);

        const updateUserGameHistoryModalResetButton = document.querySelector(`a#updateUserGameHistoryModalResetButton${historyId}`);
        updateUserGameHistoryModalResetButton.addEventListener('click', () => {
            titleInput.value = titleInput.dataset.oldvalue;
            publisherInput.value = publisherInput.dataset.oldvalue;
            scoreInput.value = scoreInput.dataset.oldvalue;

            setTimeout(() => {
                titleInput.focus();
            }, 500);
        });

    });
});


const userGameHistoryScores = document.querySelectorAll('h6.userGameHistoryScore');
Array.from(userGameHistoryScores).map(score => {
    const scoreValue = +score.innerText;

    if (scoreValue >= 80) return score.classList.add('text-success');
    if (scoreValue >= 50) return score.classList.add('text-warning');
    return score.classList.add('text-danger');
});
