document.addEventListener("DOMContentLoaded", function() {
    
    const ikaElement = document.querySelector('.ika');  // haetaan syntymäaika
    const birthDateString = ikaElement.getAttribute('data-syntymaaika');

    // määritetään custom päivämäärä
    const customDate = new Date('24 December 1384');

    // kutsutaan calculateAge-funktiota antamalla custom päivämäärä ja näytetään ikä
    const age = calculateAge(birthDateString, customDate);
    ikaElement.textContent = age;
});

function calculateAge(birthDateString, customDate) {
    const birthDate = new Date(birthDateString);
    const currentDate = customDate; // käytetään custom päivämäärää

    let ageInMilliseconds = currentDate - birthDate;

    //tarkistus, jos syntymäpäivä on suurempi kuin custom päivämäärä, muutetaan laskettua ikää eli näin vältetään negatiiviset iät, pakko myöntää että en tiiä minkä takia iät on negatiivisia mutta ilman tätä ne sekoilee :D
    if (currentDate < birthDate) {
        ageInMilliseconds = birthDate - currentDate;
    }

    const ageInYears = Math.floor(ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25));

    return ageInYears;
}