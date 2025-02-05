document.addEventListener("DOMContentLoaded", function() {
    const container = document.querySelector('.container');

    // Luo minimap-elementit
    const minimap = document.createElement('div');
    minimap.id = 'minimap';

    const minimapContent = document.createElement('div');
    minimapContent.id = 'minimap-content';

    // Kopioi tekstilaatikon sisältö minimapiin
    const containerContent = container.cloneNode(true);
    minimapContent.appendChild(containerContent);
    minimap.appendChild(minimapContent);

    // Sijoitetaan minimap tekstilaatikon viereen
    container.parentElement.appendChild(minimap);

    // Konsolitulostus varmistamaan, että minimap on lisätty
    console.log('Minimap lisätty DOMiin:', minimap);
    
    // Asetetaan minimapin korkeus
    minimap.style.height = container.offsetHeight + 'px';

    // Synkronoi minimap tekstin skrollauksen kanssa
    container.addEventListener('scroll', function() {
        const scrollPercent = container.scrollTop / (container.scrollHeight - container.clientHeight);
        minimapContent.style.transform = `scale(0.05) translateY(${scrollPercent * 2000}px)`; // Parannettu skaala
    });

    // Päivitetään minimapin korkeus, jos selainikkunan kokoa muutetaan
    window.addEventListener('resize', function() {
        minimap.style.height = container.offsetHeight + 'px';
    });
});
