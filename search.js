document.getElementById('search-input').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        console.log("Enter key pressed"); 
        searchWiki();
    }
}); q

function searchWiki() {
    const query = document.getElementById('search-input').value.toLowerCase();
    window.location.href = `/search.html?query=${encodeURIComponent(query)}`; 
}
