const headings=document.querySelectorAll('h1,h2,h3,h4,h5,h6'); //etsi kaikki otsikot
const tableOfContents=document.getElementById('table-of-contents');

headings.forEach((heading, index)=>{
    //luo ankkurilinkin jokaiselle otsikolle
    const anchor =document.createElement('a');
    anchor.setAttribute('href', `#${heading.id}`);
    anchor.textContent=heading.textContent;

    //luo listaelementti ja lisää siihen ankkurilinkki
    const listItem=document.createElement('li');
    listItem.appendChild(anchor);

    tableOfContents.append(listItem); //lisätään listaelementti sisällysluetteloon
    //lisätään scrollaus
    anchor.addEventListener('click', (e)=>{
        e.preventDefault();
        heading.scrollIntoView({behavior:'smooth'});
    });
});