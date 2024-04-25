document.addEventListener('DOMContentLoaded', function() {
    const map = document.getElementById('map');
    const container = document.getElementById('map-container');
    let isDragging = false;
    let startX = 0, startY = 0;
    let translateX = 0, translateY = 0;
    let scale = 1;
    const ZOOM_SPEED = 0.1;

    map.addEventListener('mousedown', function(e) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        map.style.cursor = 'grabbing';
        e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            let dx = e.clientX - startX;
            let dy = e.clientY - startY;

            // Tarkista ja päivitä translate-arvot ottaen huomioon zoomaustaso
            let newTranslateX = translateX + dx;
            let newTranslateY = translateY + dy;

            let maxTranslateX = 0;
            let maxTranslateY = 0;
            let minTranslateX = Math.min(0, container.offsetWidth - map.offsetWidth * scale);
            let minTranslateY = Math.min(0, container.offsetHeight - map.offsetHeight * scale);

            // Asetetaan rajoitukset translate-arvoille
            translateX = Math.max(minTranslateX, Math.min(maxTranslateX, newTranslateX));
            translateY = Math.max(minTranslateY, Math.min(maxTranslateY, newTranslateY));

            startX = e.clientX;
            startY = e.clientY;
            updateTransform();
        }
    });

    document.addEventListener('mouseup', function() {
        isDragging = false;
        map.style.cursor = 'grab';
    });

    map.addEventListener('wheel', function(e) {
        e.preventDefault();

        const rect = map.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        let zoomFactor = e.deltaY < 0 ? 1 + ZOOM_SPEED : 1 / (1 + ZOOM_SPEED);
        let newScale = scale * zoomFactor;

        translateX -= (x * map.offsetWidth * (zoomFactor - 1));
        translateY -= (y * map.offsetHeight * (zoomFactor - 1));
        scale = newScale;

        updateTransform();
    });

    function updateTransform() {
        map.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        map.style.transformOrigin = '0 0';
    }
});
