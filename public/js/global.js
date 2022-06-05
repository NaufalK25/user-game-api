const alertFlash = document.querySelector('div#alertFlash');

setTimeout(() => {
    alertFlash?.remove();
}, 5000);

const createCountryOptions = document.querySelector('datalist#createCountryOptions');
fetch('https://restcountries.com/v2/all?fields=name')
    .then(response => response.json())
    .then(countries => {
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.name;
            createCountryOptions?.appendChild(option);
        });
    });
