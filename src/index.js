import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('form');
const submitBtn = document.querySelector('button[type=submit]');
const gallery = document.querySelector('.gallery');
const loadBtn = document.querySelector('button.load-more');
const lightbox = new SimpleLightbox('.gallery__item', { sourceAttr: 'href' });

let page = 1;
let perPage = 40;
let limit = '';
let numberOfPosts = 40;
let total = '';
let searchValue = '';

function fetchPics() {
  const searchParams = new URLSearchParams({
    key: '38272300-1f1fe77aa9d2a1c8673ac9f3e',
    q: form.searchQuery.value,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    page: page,
    per_page: perPage,
  });
  return axios
    .get(`https://pixabay.com/api/?${searchParams}`)
    .then(response => {
      limit = response.data.totalHits;
      total = response.data.total;
      const imageList = response.data.hits;
      if (imageList.length == 0) {
        return Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
      return imageList;
    })
    .catch(error => console.error(error));
}

function renderPics(array) {
  const markup = array
    .map(
      ({ webformatURL, largeImageURL, likes, views, comments, downloads }) => {
        return `<div class="photo-card">
        <a href="${largeImageURL}" class="gallery__item"><img src="${webformatURL}" alt="image" loading="lazy"/></a>
        <div class="info">
          <p class="info-item">
            <b>Likes: </b>${likes}
          </p>
          <p class="info-item">
            <b> Views: </b>${views}
          </p>
          <p class="info-item">
            <b> Comments: </b>${comments}
          </p>
          <p class="info-item">
            <b> Downloads: </b>${downloads}
          </p>
        </div>
      </div>`;
      }
    )
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);
}

function handleClickSubmit(e) {
  e.preventDefault();
  if (form.searchQuery.value == '') {
    return Notiflix.Notify.info(
      'Type something to get awesome pictures! Pups are always cute!'
    );
  }
  if (searchValue == form.searchQuery.value && searchValue != '') {
    return Notiflix.Notify.info(
      `For more pictures of a ${searchValue}, scroll down and click "Load more" button`
    );
  }
  gallery.innerHTML = '';
  loadBtn.classList.add('hidden');
  page = 1;
  fetchPics().then(imageList => {
    renderPics(imageList);
    loadBtn.classList.remove('hidden');
    Notiflix.Notify.success(`Hooray! We found ${limit} images.`);
    lightbox.refresh();
    const { height: cardHeight } =
      gallery.firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 0.4,
      behavior: 'smooth',
    });
  });
  searchValue = form.searchQuery.value;
}

function handleClickLoad(e) {
  form.searchQuery.value = searchValue;

  numberOfPosts += perPage;
  loadBtn.classList.add('hidden');
  page += 1;

  if (numberOfPosts >= limit) {
    perPage = numberOfPosts - limit;
    fetchPics().then(imageList => {
      renderPics(imageList);
      loadBtn.classList.remove('hidden');
      lightbox.refresh();
      const { height: cardHeight } =
        gallery.firstElementChild.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * 2.55,
        behavior: 'smooth',
      });
    });
    loadBtn.removeEventListener('click', handleClickLoad);
    loadBtn.addEventListener('click', () => {
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
      loadBtn.classList.add('hidden');
    });
    return;
  }

  fetchPics().then(imageList => {
    renderPics(imageList);
    loadBtn.classList.remove('hidden');
    lightbox.refresh();
    const { height: cardHeight } =
      gallery.firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2.4,
      behavior: 'smooth',
    });
  });
}

submitBtn.addEventListener('click', handleClickSubmit);
loadBtn.addEventListener('click', handleClickLoad);
