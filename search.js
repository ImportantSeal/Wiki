document.getElementById('search-input').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        searchWiki();
    }
});

function searchWiki() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const resultsContainer = document.getElementById('results') || document.createElement('div');
    resultsContainer.id = 'results';
    document.body.appendChild(resultsContainer);
    resultsContainer.innerHTML = ''; // Tyhjennä aikaisemmat hakutulokset

    // Lista wiki-sivujen URL-osoitteista
    const wikiPages = [
        'valtiot/jaakka/amaaria.html',
        'valtiot/jaakka/toinen.html',
        // Lisää kaikki muut wiki-sivut tähän
    ];

    wikiPages.forEach(page => {
        fetch(page)
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');
                const title = doc.querySelector('title').innerText.toLowerCase();

                if (title.includes(query)) {
                    const resultItem = document.createElement('div');
                    const link = document.createElement('a');
                    link.href = page;
                    link.textContent = title;
                    resultItem.appendChild(link);
                    resultsContainer.appendChild(resultItem);
                }
            })
            .catch(error => console.error('Error fetching the page:', error));
    });
}
