const APP = {
    apiKey: "43106130-599342261db5315de28e9876f",
    searchInput: document.getElementById("search-input"),
    imageList: document.getElementById("image-list"),

    init: () => {
        let searchForm = document.getElementById("searchForm");
        searchForm.addEventListener("submit", APP.validateSearch);

        let clearBtn = document.getElementById('clear-btn');
        clearBtn.addEventListener('click', () => {
            // reset the message to the default message
            APP.displayMessage();

            // clear both the input inside the searchbar (userName) and the ul
            APP.searchInput.value = "";
            APP.imageList.innerHTML = "";
        })
    },

    validateSearch: (ev) => {
        ev.preventDefault();

        // reset the inner html for every new search
        APP.imageList.innerHTML = "";

        let query = APP.searchInput.value.trim();

        // if there is no input, display relevant message and do not continue
        if (query === "") {
            APP.displayMessage("No Match for Empty Value", "#bd1f36");
            return;
        } else {
            APP.displayMessage(`Searching for ${query}...`, "#bdb21f");
            APP.fetchData(query);
        }
    },

    fetchData: async (query) => {
        const BASE_URL = `https://pixabay.com/api/?key=${APP.apiKey}&q=${query}&image_type=photo`;

        try {
            const response = await fetch(BASE_URL);
            console.log(response);
            if (!response.ok) throw new Error(response.statusText);

            const data = await response.json();
            console.log(data);

            // if no images are found, display the relevant message
            if (data.total === 0) {
                console.log("No images found");
                APP.displayMessage(`No Images found for ${query}`, "#bd1f36");

            // else images are found, so continue towards fetching the image urls
            } else {
                console.log("Images found");
                
                let promises = APP.fetchImages(data.hits);
                console.log(promises);
                
                // display message once all of the list-items are received from fetch
                const promisesList = await Promise.all(promises);
                APP.displayMessage(`Images found for ${query}`, "#258415");

                let df = new DocumentFragment();
                promisesList.forEach((promise) => {
                    df.append(promise);
                })

                APP.imageList.append(df);
                console.log(APP.imageList);
            }

        } catch (err) {
            console.log(err);
            APP.displayMessage(`No Images found for ${query}`, "#bd1f36");
        }
    },

    fetchImages: (images) => {
        console.log("in fetch images");
        
        let blobURLs = images.map(async (image) => {
            try {
                const response = await fetch(image.largeImageURL);
                console.log(response);
                if (!response.ok) throw new Error(response.statusText);
                
                const blob = await response.blob();
                // console.log(blob);
                
                const blobURL = URL.createObjectURL(blob);
                // console.log(blobURL);
                
                const tags = image.tags;
                return APP.displayImage(blobURL, tags);
            } catch (err) {
                console.log(err);
            }
        });
        
        // console.log(blobURLs);
        return blobURLs;
    },

    displayImage: (blobURL, tags) => {
            let li = document.createElement("li");
            li.classList.add("image-list__item");
            li.innerHTML = 
            `
            <img src="${blobURL}" alt="An image described by: ${tags}">
            `
            return li;
    },

    displayMessage: (newMessage="Search for Images", newColor="#000") => {
        let message = document.getElementById('message');
        message.innerText = newMessage;
        message.style.color = newColor;
    }
}

window.addEventListener("DOMContentLoaded", APP.init);
