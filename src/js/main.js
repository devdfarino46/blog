
const servicesSlider = new Swiper('.services__slider', {
    direction: 'horizontal',
    loop: false,
    spaceBetween: 15,
    sliderPerView: 1,

    // Navigation arrows
    navigation: {
        nextEl: '.services__slider-btn._next',
        prevEl: '.services__slider-btn._prev',
    },
});