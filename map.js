const points = [
    { xPercent: 25, yPercent: 30, title: "Paikka 1", url: "http://linkki1.fi" },
    { xPercent: 50, yPercent: 50, title: "Paikka 2", url: "http://linkki2.fi" },
    // Lisää muita pisteitä
];

function placePoints() {
    const container = document.getElementById('map-container');
    const map = document.getElementById('map');
    points.forEach(point => {
        const marker = document.createElement('div');
        marker.classList.add('marker');
        // Lasketaan prosenttien perusteella absoluuttiset pikselikoordinaatit
        marker.style.left = `${point.xPercent}%`;
        marker.style.top = `${point.yPercent}%`;
        marker.title = point.title;
        marker.onclick = () => window.location.href = point.url;
        container.appendChild(marker);
    });
}

// Kun sivu latautuu tai ikkunan koko muuttuu, kutsu placePoints
window.onload = placePoints;
window.onresize = placePoints;
