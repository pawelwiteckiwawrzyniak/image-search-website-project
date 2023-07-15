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
            <b>${likes}</b>
          </p>
          <p class="info-item">
            <b>${views}</b>
          </p>
          <p class="info-item">
            <b>${comments}</b>
          </p>
          <p class="info-item">
            <b>${downloads}</b>
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
  if (searchValue == form.searchQuery.value) {
    Notiflix.Notify.info(
      'For more pictures, scroll down and click "Load more" button'
    );
    return;
  }
  gallery.innerHTML = '';
  loadBtn.classList.add('hidden');
  page = 1;
  fetchPics().then(imageList => {
    renderPics(imageList);
    loadBtn.classList.remove('hidden');
    Notiflix.Notify.success(`Hooray! We found ${limit} images.`);
    lightbox.refresh();
    const rect = gallery.firstElementChild.getBoundingClientRect();
    window.scrollBy({
      top: rect * 2,
      behavior: 'smooth',
    });
  });
  searchValue = form.searchQuery.value;
}

function handleClickLoad(e) {
  numberOfPosts += perPage;
  loadBtn.classList.add('hidden');
  page += 1;
  if (numberOfPosts >= limit) {
    perPage = numberOfPosts - limit;
    fetchPics().then(imageList => {
      renderPics(imageList);
      loadBtn.classList.remove('hidden');
      lightbox.refresh();
      const rect = gallery.firstElementChild.getBoundingClientRect();
      window.scrollBy({
        top: rect * 2,
        behavior: 'smooth',
      });
    });
    loadBtn.removeEventListener('click', handleClickLoad);
    loadBtn.addEventListener('click', () => {
      return Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    });
    return;
  }
  fetchPics().then(imageList => {
    renderPics(imageList);
    loadBtn.classList.remove('hidden');
    lightbox.refresh();
    const rect = gallery.firstElementChild.getBoundingClientRect();
    window.scrollBy({
      top: rect * 2,
      behavior: 'smooth',
    });
  });
}

submitBtn.addEventListener('click', handleClickSubmit);
loadBtn.addEventListener('click', handleClickLoad);
