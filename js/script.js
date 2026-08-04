document.addEventListener('DOMContentLoaded', function() {

    // --- ДАННЫЕ ПРОЕКТОВ (теперь с картинками вместо видео) ---
    var projects = {
        nevska: {
            title: 'ЖК Невский',
            description: 'Современный жилой комплекс в историческом центре Санкт-Петербурга с развитой инфраструктурой и зелёными зонами для отдыха.',
            image: 'materials/2.jpg', // Заменили video на image
            pricePerSqm: 210000   // Центр города, ~210 000 ₽/м²
        },
        atlantida: {
            title: 'ЖК Атлантида',
            description: 'Уникальный жилой комплекс на Петровском острове с панорамными видами на Финский залив.',
            image: 'materials/3.jpg', // Заменили video на image
            pricePerSqm: 195000   // Петровский остров, ~195 000 ₽/м²
        },
        vasileostrovsky: {
            title: 'ЖК Василеостровский',
            description: 'Жилой комплекс премиум-класса с панорамными видами на исторический центр Санкт-Петербурга.',
            image: 'materials/4.jpg', // Заменили video на image
            pricePerSqm: 260000   // Премиум-сегмент, ~260 000 ₽/м²
        }
    };

    // --- МЕНЮ (Бургер) ---
    var burger = document.getElementById('burger');
    var mobileNav = document.getElementById('mobileNav');

    if (burger && mobileNav) {
        burger.addEventListener('click', function() {
            var isOpen = burger.classList.toggle('active');
            mobileNav.classList.toggle('hidden');
            burger.setAttribute('aria-expanded', String(isOpen));
        });

        var mobileLinks = mobileNav.querySelectorAll('a');
        for (var i = 0; i < mobileLinks.length; i++) {
            mobileLinks[i].addEventListener('click', function() {
                burger.classList.remove('active');
                mobileNav.classList.add('hidden');
                burger.setAttribute('aria-expanded', 'false');
            });
        }

        document.addEventListener('click', function(e) {
            if (!burger.contains(e.target) && !mobileNav.contains(e.target)) {
                burger.classList.remove('active');
                mobileNav.classList.add('hidden');
                burger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Блок ленивой загрузки видео полностью удален, так как теперь мы используем картинки

    // --- МОДАЛЬНОЕ ОКНО ---
    var modal = document.getElementById('projectModal');
    var modalTitle = document.getElementById('modalTitle');
    var modalDesc = document.getElementById('modalDescription');
    var modalImage = document.getElementById('modalImage'); // Заменили modalVideo на modalImage
    var modalContactBtn = document.getElementById('modalContactBtn');
    var closeBtn = modal ? modal.querySelector('.close-button') : null;
    var modalBackdrop = modal ? modal.querySelector('.modal-backdrop') : null;

    var currentProjectKey = null;

    function openModal(projectKey) {
        var project = projects[projectKey];
        if (!project || !modal) return;

        currentProjectKey = projectKey;
        modalTitle.textContent = project.title;
        modalDesc.textContent = project.description;
        
        // Устанавливаем картинку вместо видео
        modalImage.src = project.image;
        modalImage.alt = project.title;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Таймаут для запуска видео удален

        var calcArea = document.getElementById('calcArea');
        var areaValue = document.getElementById('areaValue');
        var calcRooms = document.getElementById('calcRooms');
        var calcFloor = document.getElementById('calcFloor');

        calcArea.value = 35;
        areaValue.textContent = '35';
        calcRooms.value = '1';
        calcFloor.value = '1-5';
        updateCalculator(project.pricePerSqm);

        if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
        if (!modal) return;
        
        var lastKey = currentProjectKey;
        
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Очищаем src картинки при закрытии
        modalImage.src = '';
        currentProjectKey = null;

        if (lastKey) {
            var trigger = document.querySelector('[data-project="' + lastKey + '"]');
            if (trigger) trigger.focus();
        }
    }

    var projectButtons = document.querySelectorAll('[data-project]');
    for (var p = 0; p < projectButtons.length; p++) {
        projectButtons[p].addEventListener('click', function() {
            openModal(this.getAttribute('data-project'));
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

    if (modalContactBtn) {
        modalContactBtn.addEventListener('click', function() {
            closeModal();
            setTimeout(function() {
                var contacts = document.getElementById('contacts');
                if (contacts) {
                    contacts.scrollIntoView({ behavior: 'smooth' });
                    var panels = contacts.querySelectorAll('.contact-panel');
                    var formPanel = panels[panels.length - 1];
                    if (formPanel) {
                        formPanel.style.boxShadow = '0 0 0 3px rgba(32, 178, 170, 0.3)';
                        setTimeout(function() {
                            formPanel.style.boxShadow = '';
                        }, 2000);
                    }
                }
            }, 350);
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // --- КАЛЬКУЛЯТОР СТОИМОСТИ ---
    var calcArea = document.getElementById('calcArea');
    var calcRooms = document.getElementById('calcRooms');
    var calcFloor = document.getElementById('calcFloor');
    var areaValueEl = document.getElementById('areaValue');
    var totalPriceEl = document.getElementById('totalPrice');
    var downPaymentEl = document.getElementById('downPayment');
    var monthlyPaymentEl = document.getElementById('monthlyPayment');

    var currentPricePerSqm = 100000;

    function formatPrice(num) {
        return Math.round(num).toLocaleString('ru-RU') + ' ₽';
    }

    function updateCalculator(pricePerSqm) {
        if (!pricePerSqm) pricePerSqm = currentPricePerSqm;
        currentPricePerSqm = pricePerSqm;

        var area = parseInt(calcArea.value, 10) || 35;
        var rooms = parseInt(calcRooms.value, 10) || 1;
        var floor = calcFloor.value;

        var total = area * pricePerSqm;

        if (rooms === 2) total *= 1.12;
        else if (rooms === 3) total *= 1.22;

        var floorMultipliers = {
            '1-5': 1.0,
            '6-10': 1.05,
            '11-20': 1.10,
            '21+': 1.16
        };
        total *= (floorMultipliers[floor] || 1.0);

        total = Math.round(total);

        var downPayment = Math.round(total * 0.2);
        var loanAmount = total - downPayment;
        var monthlyRate = 0.12 / 12;
        var months = 240;
        var monthly = Math.round(
            loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
            (Math.pow(1 + monthlyRate, months) - 1)
        );

        totalPriceEl.textContent = formatPrice(total);
        downPaymentEl.textContent = formatPrice(downPayment);
        monthlyPaymentEl.textContent = formatPrice(monthly);
    }

    if (calcArea) {
        calcArea.addEventListener('input', function() {
            areaValueEl.textContent = calcArea.value;
            updateCalculator();
        });
    }
    if (calcRooms) calcRooms.addEventListener('change', updateCalculator);
    if (calcFloor) calcFloor.addEventListener('change', updateCalculator);

    // --- ФОРМА ОБРАТНОЙ СВЯЗИ ---
    var form = document.getElementById('contactForm');
    var submitBtn = document.getElementById('submitBtn');
    var formSuccess = document.getElementById('formSuccess');

    var nameInput = document.getElementById('name');
    var phoneInput = document.getElementById('phone');
    var messageInput = document.getElementById('message');

    var nameError = document.getElementById('nameError');
    var phoneError = document.getElementById('phoneError');
    var messageError = document.getElementById('messageError');

    function showError(input, errorEl) {
        input.classList.add('error');
        errorEl.classList.add('show');
    }

    function clearError(input, errorEl) {
        input.classList.remove('error');
        errorEl.classList.remove('show');
    }

    if (nameInput) nameInput.addEventListener('input', function() { clearError(nameInput, nameError); });
    if (phoneInput) phoneInput.addEventListener('input', function() { clearError(phoneInput, phoneError); });
    if (messageInput) messageInput.addEventListener('input', function() { clearError(messageInput, messageError); });

    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            var digits = e.target.value.replace(/\D/g, '');
            if (digits.length > 0 && (digits[0] === '8' || digits[0] === '7')) {
                digits = digits.substring(1);
            }
            digits = digits.substring(0, 10);

            var formatted = '+7';
            if (digits.length > 0) formatted += ' (' + digits.substring(0, 3);
            if (digits.length >= 3) formatted += ') ' + digits.substring(3, 6);
            if (digits.length >= 6) formatted += '-' + digits.substring(6, 8);
            if (digits.length >= 8) formatted += '-' + digits.substring(8, 10);

            e.target.value = formatted;
        });
    }

    function validatePhone(phone) {
        var digits = phone.replace(/\D/g, '');
        return digits.length >= 11;
    }

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            var isValid = true;

            if (nameInput.value.trim().length < 2) {
                showError(nameInput, nameError);
                isValid = false;
            } else {
                clearError(nameInput, nameError);
            }

            if (!validatePhone(phoneInput.value)) {
                showError(phoneInput, phoneError);
                isValid = false;
            } else {
                clearError(phoneInput, phoneError);
            }

            if (messageInput.value.trim().length < 3) {
                showError(messageInput, messageError);
                isValid = false;
            } else {
                clearError(messageInput, messageError);
            }

            if (!isValid) {
                var firstError = form.querySelector('.form-control.error');
                if (firstError) firstError.focus();
                return;
            }

            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            setTimeout(function() {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                form.reset();
                formSuccess.classList.remove('hidden');

                setTimeout(function() {
                    formSuccess.classList.add('hidden');
                }, 5000);
            }, 1500);
        });
    }

    // --- КНОПКА НАВЕРХ ---
    var scrollBtn = document.getElementById('scrollToTop');

    if (scrollBtn) {
        var scrollTicking = false;

        window.addEventListener('scroll', function() {
            if (!scrollTicking) {
                window.requestAnimationFrame(function() {
                    if (window.scrollY > 500) {
                        scrollBtn.classList.add('visible');
                    } else {
                        scrollBtn.classList.remove('visible');
                    }
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        }, { passive: true });

        scrollBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- АНИМАЦИЯ ПОЯВЛЕНИЯ ЭЛЕМЕНТОВ ---
    var revealSelectors = '.project-card, .news-card, .stat-card, .contact-panel, .about-image-wrap';
    var revealElements = document.querySelectorAll(revealSelectors);

    if ('IntersectionObserver' in window && revealElements.length) {
        var revealObserver = new IntersectionObserver(function(entries) {
            for (var r = 0; r < entries.length; r++) {
                if (entries[r].isIntersecting) {
                    var delay = entries[r].target.dataset.revealDelay || 0;
                    (function(el, d) {
                        setTimeout(function() {
                            el.style.opacity = '1';
                            el.style.transform = 'translateY(0)';
                        }, d);
                    })(entries[r].target, delay);
                    revealObserver.unobserve(entries[r].target);
                }
            }
        }, {
            threshold: 0.08,
            rootMargin: '0px 0px -30px 0px'
        });

        var groups = {};
        for (var g = 0; g < revealElements.length; g++) {
            var el = revealElements[g];
            var section = el.closest('section');
            var key = section ? (section.id || section.className) : 'default';
            if (!groups[key]) groups[key] = [];
            groups[key].push(el);
        }

        var groupKeys = Object.keys(groups);
        for (var k = 0; k < groupKeys.length; k++) {
            var group = groups[groupKeys[k]];
            for (var gi = 0; gi < group.length; gi++) {
                group[gi].style.opacity = '0';
                group[gi].style.transform = 'translateY(28px)';
                group[gi].style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                group[gi].style.willChange = 'opacity, transform';
                group[gi].dataset.revealDelay = gi * 80;
                revealObserver.observe(group[gi]);
            }
        }
    }

    // --- ЛЕНТА НОВОСТЕЙ ---
    var newsScroll = document.getElementById('newsScroll');
    if (newsScroll) {
        newsScroll.innerHTML += newsScroll.innerHTML;
    }

    // ====== ЯНДЕКС КАРТА ======
    var mapEl = document.getElementById('map');
    if (mapEl) {
        if (typeof ymaps !== 'undefined') {
            ymaps.ready(initYandexMap);
        } else {
            var yandexScript = document.createElement('script');
            yandexScript.src = 'https://api-maps.yandex.ru/2.1/?apikey=ВАШ_API_КЛЮЧ&lang=ru_RU';
            yandexScript.onload = function() {
                ymaps.ready(initYandexMap);
            };
            yandexScript.onerror = function() {
                mapEl.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#9ca3af;font-family:Inter,sans-serif;"><i class="fas fa-map-marked-alt" style="font-size:2.5rem;margin-bottom:1rem;color:#d1d5db;"></i><p style="font-size:0.9rem;">Карта временно недоступна</p></div>';
            };
            document.body.appendChild(yandexScript);
        }
    }

    function initYandexMap() {
        var map = new ymaps.Map('map', {
            center: [59.935, 30.290],
            zoom: 12,
            controls: ['zoomControl'],
            behaviors: ['drag', 'dblClickZoom', 'multiTouch']
        });

        var customIconLayout = ymaps.templateLayoutFactory.createClass(
            '<div style="width:34px;height:34px;background:#20B2AA;border-radius:50% 50% 50% 4px;transform:rotate(-45deg);border:3px solid white;box-shadow:0 3px 12px rgba(32,178,170,0.4);display:flex;align-items:center;justify-content:center;">' +
            '<i class="fas fa-home" style="transform:rotate(45deg);color:white;font-size:11px;"></i>' +
            '</div>'
        );

        var markersData = [
            {
                coords: [59.934, 30.315],
                title: 'ЖК Невский',
                desc: '1-комн. от 3 500 000 ₽<br>2-комн. от 4 800 000 ₽',
                status: 'Строится'
            },
            {
                coords: [59.952, 30.248],
                title: 'ЖК Атлантида',
                desc: '1-комн. от 3 200 000 ₽<br>2-комн. от 5 200 000 ₽',
                status: 'Сдача в 2025'
            },
            {
                coords: [59.922, 30.282],
                title: 'ЖК Василеостровский',
                desc: '1-комн. от 4 000 000 ₽<br>2-комн. от 6 000 000 ₽',
                status: 'Премиум'
            }
        ];

        var placemarks = [];
        for (var m = 0; m < markersData.length; m++) {
            var md = markersData[m];
            var placemark = new ymaps.Placemark(md.coords, {
                balloonContent: 
                    '<div style="font-family:Inter,-apple-system,sans-serif;min-width:180px;">' +
                    '<h3 style="margin:0 0 6px;font-size:14px;font-weight:700;color:#1f2937;">' + md.title + '</h3>' +
                    '<span style="display:inline-block;font-size:11px;font-weight:600;color:#20B2AA;background:rgba(32,178,170,0.1);padding:2px 8px;border-radius:4px;margin-bottom:8px;">' + md.status + '</span>' +
                    '<p style="margin:0;font-size:12.5px;color:#4b5563;line-height:1.5;">' + md.desc + '</p>' +
                    '</div>'
            }, {
                iconLayout: customIconLayout,
                iconOffset: [-17, -34],
                iconShape: {
                    type: 'Rectangle',
                    coordinates: [[-17, -34], [17, 0]]
                }
            });
            map.geoObjects.add(placemark);
            placemarks.push(placemark);
        }

        if (placemarks.length) {
            var bounds = ymaps.util.bounds.fromPoints(
                placemarks.map(function(p) { return p.geometry.getCoordinates(); })
            );
            map.setBounds(bounds, { checkZoomRange: true, zoomMargin: 30 });
        }
    }
    // ====== КОНЕЦ КАРТЫ ======

    // --- ШАПКА ПРОЗРАЧНАЯ ПРИ СКРОЛЛЕ ---
    var header = document.querySelector('header');

    if (header) {
        var headerTicking = false;

        window.addEventListener('scroll', function() {
            if (!headerTicking) {
                window.requestAnimationFrame(function() {
                    if (window.scrollY > 10) {
                        header.style.boxShadow = '0 4px 24px rgba(0,0,0,0.07)';
                        header.style.backdropFilter = 'blur(12px)';
                        header.style.webkitBackdropFilter = 'blur(12px)';
                    } else {
                        header.style.boxShadow = '';
                        header.style.backdropFilter = '';
                        header.style.webkitBackdropFilter = '';
                    }
                    headerTicking = false;
                });
                headerTicking = true;
            }
        }, { passive: true });
    }

    // --- ПЛАВНАЯ ПРОКРУТКА ДЛЯ ЯКОРЕЙ ---
    var anchors = document.querySelectorAll('a[href^="#"]');
    for (var ai = 0; ai < anchors.length; ai++) {
        anchors[ai].addEventListener('click', function(e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;

            var target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

});