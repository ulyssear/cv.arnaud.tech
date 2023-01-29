export default class extends HTMLElement {
    constructor() {
        super();

        const content = flatten(JSON.parse(atob(this.dataset.content)));

        fetch_template_app_cv().then((template) => {
            const shadow = this.attachShadow({mode: 'open'});
            shadow.appendChild(template.content.cloneNode(true));

            const keys = Object.keys(content);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                addToSlot(this, key, content[key]);
            }

            return shadow;
        }).then((shadow) => {
            CSS_IN_JS_IN_HTML.init(shadow);
        }).catch((error) => {
            console.error(error);
        });
    }
}

function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
}

function flatten(obj, prefix = '') {
    return Object.keys(obj).reduce((acc, k) => {
        const pre = prefix.length ? prefix + '.' : '';
        if ('object' === typeof obj[k] && !isArray(obj[k])) {
            return Object.assign(acc, flatten(obj[k], pre + k));
        }
        return Object.assign(acc, {
            [pre + k]: obj[k]
        });
    }, {});
}

async function fetch_template_app_cv() {
    return fetch('app-cv.html').then((response) => {
        return response.text();
    }).then((html) => {
        const _template = document.createElement('template');
        _template.innerHTML = html;
        document.body.appendChild(_template.content.firstElementChild);
    }).then(() => {
        return document.getElementById('app-cv');
    }).catch((error) => {
        console.error(error);
    });
}

function addToSlot(element, slot, content) {
    const slotElement = element.shadowRoot.querySelector(`[data-slot="${slot}"]`);
    const outerHTML = generateOuterHTML(slot, content);
    // console.log({slot, content, slotElement, outerHTML});
    if (!outerHTML) return;
    if (!slotElement) return;
    slotElement.innerHTML = outerHTML;
    slotElement.removeAttribute('data-slot');
}

function generateOuterHTML(slot, content) {
    return ({
        'age': function(date) {
            return Math.floor(((Date.now()) - (new Date(date))) / (1000 * 60 * 60 * 24 * 365)) + ' ans';
        },
        'avatar': function(url) {
            const img = document.createElement('img');
            img.setAttribute('src', url);
            img.setAttribute('alt', 'avatar');
            return img.outerHTML;
        },
        'contact.email': function(email) {
            return `<a href="mailto:${email}">${email}</a>`;
        },
        'contact.telephone': function(telephone) {
            return telephone;
        },
        'adresse': function(adresse) {
            return adresse;
        },
        'langues': function(langues) {
            const ul = document.createElement('ul');
            for (let i = 0; i < langues.length; i++) {
                const {nom, niveau} = langues[i];
                const li = document.createElement('li');
                const langue = document.createElement('span');
                langue.innerHTML = `${nom} : `;
                li.appendChild(langue);
                li.appendChild(document.createTextNode(niveau));
                ul.appendChild(li);
            }
            return ul.innerHTML;
        },
        'competences': function(competences) {
            const ul = document.createElement('ul');
            for (let i = 0; i < competences.length; i++) {
                const li = document.createElement('li');
                const titre = document.createElement('h3');
                const content = document.createElement('p');
                titre.innerHTML = competences[i].nom;
                content.innerHTML = competences[i].entrees.join(', ');
                li.appendChild(titre);
                li.appendChild(content);
                ul.appendChild(li);
            }
            return ul.innerHTML;
        },
        'experiences': function(experiences) {
            const ul = document.createElement('ul');
            for (let i = 0; i < experiences.length; i++) {
                const {nom,location,job,date,entrees} = experiences[i];

                const element_location = document.createElement('span');
                element_location.innerHTML = `(${location})`;

                const element_entreprise = document.createElement('h3');
                element_entreprise.innerHTML = `${nom}, ${element_location.outerHTML}`;

                const element_date = document.createElement('span');
                element_date.innerHTML = `(${date})`;

                const element_job = document.createElement('h4');
                element_job.innerHTML = `${job}, ${element_date.outerHTML}`;
                
                const jobs = document.createElement('ul');
                for (let j = 0; j < entrees.length; j++) {
                    const entree = document.createElement('li');
                    const {nom: poste, entrees: descriptions} = entrees[j];
                    const element_poste = document.createElement('h5');
                    element_poste.classList.add('chevroned');
                    element_poste.innerHTML = poste;
                    const element_descriptions = document.createElement('ul');
                    for (let k = 0; k < descriptions.length; k++) {
                        const description = document.createElement('li');
                        description.classList.add('chevroned');
                        description.innerHTML = descriptions[k];
                        element_descriptions.appendChild(description);
                    }
                    entree.appendChild(element_poste);
                    entree.appendChild(element_descriptions);
                    jobs.appendChild(entree);
                }

                const li = document.createElement('li');
                li.appendChild(element_entreprise);
                li.appendChild(element_job);
                li.appendChild(jobs);
                ul.appendChild(li);
            }
                
            return ul.innerHTML;
        },
        'formations': function(formations) {
            const ul = document.createElement('ul');
            for (let i = 0; i < formations.length; i++) {
                const {nom,location,entrees} = formations[i];

                const element_entree = document.createElement('li');

                const element_location = document.createElement('span');
                element_location.innerHTML = `(${location})`;

                const element_ecole = document.createElement('h3');
                element_ecole.innerHTML = `${nom}, ${element_location.outerHTML}`;

                const ul_formations = document.createElement('ul');

                for (let j = 0; j < entrees.length; j++) {
                    const {nom,date,cours} = {
                        cours: undefined,
                        ...entrees[j],
                    };
                    const li = document.createElement('li');
                    const element_date = document.createElement('p');
                    element_date.classList.add('chevroned');
                    element_date.innerHTML = date;

                    const element_nom = document.createElement('h4');
                    element_nom.classList.add('chevroned');
                    element_nom.innerHTML = nom;

                    const element_cours = document.createElement('p');
                    if (cours) element_cours.innerHTML = `(${cours.join(', ')})`;

                    li.appendChild(element_nom);
                    if (cours) li.appendChild(element_cours);
                    li.appendChild(element_date);
                    ul_formations.appendChild(li);
                }

                element_entree.appendChild(element_ecole);
                element_entree.appendChild(ul_formations);

                ul.appendChild(element_entree);
            }
            return ul.innerHTML;
        },
        'hobbies': function(hobbies) {
            const ul = document.createElement('ul');
            for (let i = 0; i < hobbies.length; i++) {
                const {nom, entrees} = hobbies[i];
                const li = document.createElement('li');
                const element_nom = document.createElement('h3');
                element_nom.innerHTML = nom + ' : ';
                const element_content = document.createElement('p');
                element_content.innerHTML = entrees.join(', ');
                li.appendChild(element_nom);
                li.appendChild(element_content);
                ul.appendChild(li);
            }
            return ul.innerHTML;
        },
        'job': function(job) {
            return job;
        },
        'nom': function(nom) {
            return nom;
        },
        'reseaux-sociaux': function(reseaux_sociaux) {
            const ul = document.createElement('ul');
            for (let i = 0; i < reseaux_sociaux.length; i++) {
                const {nom, url} = reseaux_sociaux[i];
                const urlPattern = reseaux_sociaux[i]['url-pattern'] ?? 'https://$1';
                const li = document.createElement('li');
                const element_nom = document.createElement('h3');
                const element_url = document.createElement('a');
                const final_url = urlPattern.replace('$1', url);
                element_nom.innerHTML = `${nom} : <span>${url}</span>`;
                element_url.appendChild(element_nom);
                element_url.href = final_url;
                element_url.target = "_blank";
                li.appendChild(element_url);
                ul.appendChild(li);
            }
            return ul.innerHTML;
        },
    }[slot] ?? function () {})(content);
}