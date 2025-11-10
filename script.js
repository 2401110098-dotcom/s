// --- 페이지 로드 후 실행될 스크립트 ---
document.addEventListener('DOMContentLoaded', () => {

    // (추가) 새로고침 시 최상단으로 이동
    history.scrollRestoration = 'manual'; // 브라우저의 자동 스크롤 복원 기능 비활성화
    window.scrollTo(0, 0);

    // (수정) 로더 및 사운드 활성화 로직
    const loader = document.getElementById('loader-wrapper');
    const content = document.getElementById('content');
    const startPrompt = document.getElementById('start-prompt');
    let soundEnabled = false; // 사운드 활성화 상태 추적

    // (추가) Web Audio API 설정
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let oscillator = null; // 톤(소리)을 생성하는 노드
    let gainNode = null;   // 볼륨을 조절하는 노드

    // (추가) 사운드 재생 헬퍼 함수
    function playSound(soundId, volume = 0.5) {
        const sound = document.getElementById(soundId);
        if (sound) {
            sound.load(); // (추가) 사운드를 재생하기 전에 명시적으로 로드합니다.
            sound.currentTime = 0; // 재생 위치를 처음으로
            sound.volume = volume;
            sound.play().catch(e => console.log(`Audio play failed for ${soundId}: ${e}`));
        }
    }

    // (추가) 메인 콘텐츠 애니메이션 및 사운드를 시작하는 함수
    function startMainContentAnimations() {
        // (수정) JS로 애니메이션을 제어하기 위해 body에 클래스 추가
        document.body.classList.add('animations-started');

        // (수정) 인트로 텍스트가 바로 보이므로, 드리블 사운드도 바로 재생
        if (introSound) {
            playSound('intro-dribble-sound', 0.6);
        }

        // (수정) 인트로 애니메이션이 끝나는 시점(3.75s delay + 2s duration = 5.75s)에 맞춰 사운드 정지
        setTimeout(() => {
            const sound = document.getElementById('intro-dribble-sound');
            if (sound) sound.pause();
        }, 5750);

        // (수정) 인트로 애니메이션이 끝난 후 헤더, 홈 콘텐츠, 타이핑, 커서 애니메이션 순차 실행
        const header = document.getElementById('main-header');
        const homeContent = document.querySelector('.home-content-inner');

        // (수정) 6초: 헤더와 홈 콘텐츠 등장 (인트로가 끝난 직후)
        setTimeout(() => {
            if (header) header.style.animation = 'fadeInHeader 1s ease-out forwards';
            if (homeContent) homeContent.style.animation = 'fadeInHomeContent 1s ease-out forwards';
            if (customCursor) { // 커서 표시
                customCursor.style.transition = 'opacity 0.5s ease-out';
                customCursor.style.opacity = '1';
            }
            // (수정) 6.2초: 타이핑 시작 (홈 콘텐츠 등장 후 0.2초 뒤)
            if (typingElement) {
                typeWriter(typingElement, typingElement.dataset.text, 60);
            }
        }, 6000);
    }

    // 로딩 및 사운드 재생을 시작하는 함수
    function startLoadingSequence() {
        const loaderDribbleSound = document.getElementById('loader-dribble-video');
        if (loaderDribbleSound) {
            // 기존 핸들러가 있다면 제거 (중복 방지)
            loaderDribbleSound.removeEventListener('ended', window.dribblePlayHandler);
            let playCount = 0;
            const maxPlays = 4;

            const playHandler = () => {
                playCount++;
                if (playCount < maxPlays) {
                    playSound('loader-dribble-video', 0.5);
                } else {
                    // 4번 재생 후 로더 사라지는 애니메이션 실행
                    loaderDribbleSound.removeEventListener('ended', window.dribblePlayHandler);
                    if (loader) {
                        loader.classList.add('is-loaded');
                        playSound('loader-dribble-video', 0.6);
                        setTimeout(() => playSound('loader-dribble-video', 0.5), 720);

                        // 애니메이션(1.2s) 후 로더 제거 및 콘텐츠 표시
                        setTimeout(() => {
                            loader.style.display = 'none';
                            if (content) {
                                content.style.visibility = 'visible';
                                content.style.opacity = '1';
                            }
                            document.body.style.overflow = 'auto';

                            // (추가) 로더가 사라진 후 메인 콘텐츠 애니메이션 시작
                            startMainContentAnimations();
                        }, 1200);
                    }
                }
            };

            // 핸들러를 전역에서 접근 가능하도록 저장
            window.dribblePlayHandler = playHandler;
            loaderDribbleSound.addEventListener('ended', window.dribblePlayHandler);
            playSound('loader-dribble-video', 0.5); // 첫 재생 시작
        }
    }

    // (삭제) 페이지 로드 시 자동 시작 로직 제거

    // 화면을 한 번 클릭하면 사운드를 활성화하고 로딩 시퀀스를 다시 시작
    function startExperience() {
        if (soundEnabled) return;
        soundEnabled = true;

        // 클릭 유도 문구 숨기기
        if (startPrompt) {
            startPrompt.style.display = 'none';
        }
        if (loader) {
            loader.style.cursor = 'default';
        }

        // 사운드와 함께 로딩 시퀀스 재시작
        startLoadingSequence();
        
        // (추가) Web Audio API 컨텍스트 활성화 (브라우저 정책)
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        // 이벤트 리스너 제거
        document.removeEventListener('click', startExperience);
    }
    document.addEventListener('click', startExperience);

    // (수정) 인트로 텍스트 애니메이션용 사운드 로직
    const introSound = document.getElementById('intro-dribble-sound');

    // (삭제) 기존 setTimeout 로직들은 startMainContentAnimations 함수로 이동

    // --- (추가) 범용 스크롤 트리거 애니메이션 ---
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            // (수정) 사운드가 활성화된 후에만 스크롤 애니메이션이 동작하도록
            if (soundEnabled && entry.isIntersecting) {
                // (수정) 모든 reveal-on-scroll 요소에 is-visible 클래스 추가
                entry.target.classList.add('is-visible');
                // 한 번 실행된 후 관찰 중지
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 }); // 요소가 15% 보일 때 실행

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // --- (추가) 타이핑 애니메이션 로직 ---
    function typeWriter(element, text, speed = 60) {
        let i = 0;
        element.innerHTML = ""; // 시작 전 내용 비우기
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }

    const typingElement = document.getElementById('typing-philosophy');
    if (typingElement) {
        typingElement.dataset.text = typingElement.textContent; // 원본 텍스트를 data 속성에 저장
        typingElement.innerHTML = ""; // JS 로드 시 텍스트 숨김 (깜빡임 방지)
        // (삭제) setTimeout 로직은 startMainContentAnimations 함수로 이동
    }

    // --- (추가) Web Audio API 사운드 제어 함수 ---
    // 소리 시작 함수 (낮은 음에서 시작)
    function startSound() {
        if (oscillator) oscillator.stop(); // 기존 소리 중지

        oscillator = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();

        oscillator.type = 'sine'; // 부드러운 사인파 (sine, square, sawtooth, triangle)
        oscillator.frequency.setValueAtTime(200, audioCtx.currentTime); // 200Hz (낮은 음)에서 시작
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime); // 볼륨 (너무 크지 않게 0.15로 설정)

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
    }

    // 소리 중지 함수 (부드럽게 끄기)
    function stopSound() {
        if (gainNode && oscillator) {
            // 0.2초에 걸쳐 볼륨을 0으로 부드럽게 줄임
            gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.2);
            // 0.2초 후에 오실레이터 완전 중지
            oscillator.stop(audioCtx.currentTime + 0.2);
            oscillator = null;
            gainNode = null;
        }
    }

    // 값을 주파수로 매핑하는 헬퍼 함수 (0~100 값을 200Hz~1000Hz로 변환)
    function mapValueToFrequency(value, maxValue, minFreq, maxFreq) {
        const ratio = value / maxValue;
        return minFreq + (maxFreq - minFreq) * ratio;
    }
    
    // (삭제) 타이핑용 IntersectionObserver 코드 삭제됨

    // --- (기존) 능력치 그래프 애니메이션 ---
    // (추가) 스탯 애니메이션을 실행하는 재사용 가능한 함수
    let isAnimating = false; // (추가) 애니메이션 중복 실행 방지 플래그

    function animateStats() {
        const statsSection = document.querySelector('#stats-section');
        // (수정) 애니메이션이 이미 실행 중이면 중복 호출 방지
        if (!statsSection || isAnimating) return;

        isAnimating = true; // 애니메이션 시작

        const skillWrappers = statsSection.querySelectorAll('.skill-bar-wrapper');

        // 1. 애니메이션 리셋: 바 높이와 숫자 초기화
        skillWrappers.forEach(wrapper => {
            const valueEl = wrapper.querySelector('.skill-value');
            const barEl = wrapper.querySelector('.bar');
            barEl.style.transition = 'none'; // 리셋 시에는 애니메이션 효과 제거
            barEl.style.height = '0%';
            valueEl.textContent = '0';
        });

        // 2. 애니메이션 재시작 (약간의 딜레이 후)
        setTimeout(() => {
            // (수정) 스탯 차트 애니메이션 시작 시 'stat_up.mp3' 사운드 재생
            playSound('stat-sound', 0.7);

            skillWrappers.forEach(wrapper => {
                const valueEl = wrapper.querySelector('.skill-value');
                const barEl = wrapper.querySelector('.bar');
                const skillValue = barEl.getAttribute('data-skill');

                barEl.style.transition = 'height 3.7s cubic-bezier(.23,1,.32,1), background-position 3.7s ease-out'; // 트랜지션 복원
                barEl.style.height = skillValue + '%'; // 막대 그래프 애니메이션
                barEl.style.backgroundPosition = '0 0'; // (추가) 쉬머 애니메이션 시작
                countUp(valueEl, skillValue, 1500); // (수정) 숫자는 빠르게 1.5초로 변경
            });
            setTimeout(() => { isAnimating = false; }, 3800); // 애니메이션 종료 후 플래그 리셋 (3.7s + 0.1s)
        }, 100); // 리셋이 반영될 시간을 줌
    }

    // (수정) 숫자 카운팅 애니메이션 함수에서 Web Audio API 관련 로직 제거
    const countUp = (el, end, duration = 2000) => {
        let start = 0;
        const target = parseInt(end, 10);
        if (isNaN(target)) return; // 숫자가 아닌 경우 중단
        const startTime = Date.now();

        const frame = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const current = Math.floor(progress * (target - start) + start);
            
            el.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(frame);
            } else {
                el.textContent = target;
            }
        };
        requestAnimationFrame(frame);    };

    const statsSection = document.querySelector('#stats-section');
    if (statsSection) {
        // (삭제) 중복 정의된 countUp 함수 제거

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                // (수정) 섹션이 보이고, 애니메이션이 아직 실행되지 않았을 때만 실행
                if (soundEnabled && entry.isIntersecting) {
                    animateStats();
                    // (수정) 한 번 실행 후에는 더 이상 관찰하지 않음
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 }); // (수정) 스탯 섹션이 10%만 보여도 실행되도록 변경
        observer.observe(statsSection);
    }

    // --- (수정) Works 섹션: Jumbotron 슬라이더 로직 ---
    const jumbotronScreen = document.getElementById('jumbotron-screen');
    const projectDataContainer = document.getElementById('project-data');
    const projectItems = projectDataContainer.querySelectorAll('.project-item');
    const jumbotronFooter = document.querySelector('.jumbotron-footer');

    // (추가) 필름 스트립을 담을 컨테이너 생성
    const filmStrip = document.createElement('div');
    filmStrip.className = 'film-strip';
    jumbotronScreen.appendChild(filmStrip);

    // 1. 프로젝트 데이터로부터 슬라이드 생성하는 함수
    const createSlides = (container) => {
    projectItems.forEach((item, index) => {
        const slide = document.createElement('div');
        slide.className = 'project-slide';
        slide.style.backgroundImage = `url(${item.dataset.img})`;

        const content = document.createElement('div');
        content.className = 'slide-content';

        const category = document.createElement('p');
        category.className = 'project-category';
        category.textContent = item.dataset.category;

        const title = document.createElement('h3');
        title.textContent = item.dataset.title;

        const viewButton = document.createElement('a');
        viewButton.href = '#';
        viewButton.className = 'view-button';
        viewButton.textContent = 'VIEW CASE';
        // 각 버튼에 모달을 열기 위한 데이터 속성 복사
        Object.keys(item.dataset).forEach(key => {
            viewButton.dataset[key] = item.dataset[key];
        });

        content.appendChild(category);
        content.appendChild(title);
        content.appendChild(viewButton);
        slide.appendChild(content);
            container.appendChild(slide);
    });
    };

    // 2. 슬라이드 생성 및 무한 루프를 위해 복제
    if (projectItems.length > 0) {
        createSlides(filmStrip); // 원본 슬라이드 생성
        createSlides(filmStrip); // 복제본 슬라이드 생성
    }

    // (삭제) 기존 슬라이더 로직 (updateJumbotron, 컨트롤러 이벤트 리스너 등) 제거

    // --- (기존) 프로젝트 상세 정보 모달 로직 ---
    // (수정) viewButtons를 동적으로 생성된 버튼에 대해 이벤트 위임으로 처리
    const modalOverlay = document.getElementById('project-modal');
    const modalCloseBtn = document.querySelector('.modal-close');

    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalCategory = document.getElementById('modal-category');
    const modalDescription = document.getElementById('modal-description');
    const modalRole = document.getElementById('modal-role');
    const modalTools = document.getElementById('modal-tools');

    // 이벤트 위임: #works-section 내부에서 .view-button 클릭 감지
    const worksSection = document.getElementById('works-section');
    worksSection.addEventListener('click', function(event) {
        const button = event.target.closest('.view-button');
        if (!button) return;

        event.preventDefault();

        const img = button.dataset.img;
        const title = button.dataset.title;
        const category = button.dataset.category;
        const description = button.dataset.description;
        const role = button.dataset.role;
        const tools = button.dataset.tools;

        modalImg.src = img;
        modalTitle.textContent = title;
        modalCategory.textContent = category;
        modalDescription.innerHTML = description;
        modalRole.textContent = role;
        modalTools.textContent = tools;
        
        playSound('open-modal-sound', 0.4);
        modalOverlay.classList.add('is-visible');
        document.body.style.overflow = 'hidden';
    });

    function closeModal() {
        modalOverlay.classList.remove('is-visible');
        playSound('click-sound', 0.3); // (추가) 모달 닫기 사운드
        document.body.style.overflow = 'auto';
    }

    modalCloseBtn.addEventListener('click', closeModal);

    modalOverlay.addEventListener('click', function(event) {
        if (event.target === modalOverlay) {
            closeModal();
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modalOverlay.classList.contains('is-visible')) {
            closeModal();
        }
    });

    // --- (추가) 부드러운 스크롤링 ---
    const navLinks = document.querySelectorAll('#main-header nav a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // 기본 앵커 동작 방지

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            // (수정) 모든 메뉴 클릭 시 동일한 클릭 사운드 재생
            playSound('click-sound', 0.3);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });

                // (추가) STATS 메뉴 클릭 시 애니메이션 재실행
                if (targetId === '#stats-section') {
                    // (수정) 스크롤이 끝난 후 애니메이션을 실행하도록 단순화
                    // IntersectionObserver가 해제되었을 수 있으므로 직접 호출
                    setTimeout(animateStats, 500); // 스크롤 이동 시간을 고려하여 0.5초 후 실행
                }
            }
        });
    });

    // --- (추가) 스크롤 스파이 (현재 섹션 메뉴에 하이라이트) ---
    const sections = document.querySelectorAll('section[id], main#content');
    const navLinksObserver = document.querySelectorAll('#main-header nav a');

    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px', // 화면 중앙을 기준으로 감지
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetId = entry.target.id;
                navLinksObserver.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${targetId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => sectionObserver.observe(section));
    
    // --- (수정) 맨 위로 가기 버튼 로직 (3D 골대 버전) ---
    const backToTopHoop = document.getElementById('back-to-top-hoop');
    if(backToTopHoop) {
        window.addEventListener('scroll', () => {
            // 뷰포트 높이의 50% 이상 스크롤되면 버튼 표시
            if (window.scrollY > window.innerHeight * 0.5) {
                backToTopHoop.classList.add('is-visible');
            } else {
                backToTopHoop.classList.remove('is-visible');
            }
        });

        backToTopHoop.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 이미 애니메이션 중이면 중복 실행 방지
            if (backToTopHoop.classList.contains('is-swishing')) return;

            // (수정) 그물 흔들림(Swish) 애니메이션 실행
            backToTopHoop.classList.add('is-swishing');
            playSound('swish-sound', 0.7);

            // 애니메이션(0.5s)이 끝난 후 스크롤 실행
            setTimeout(() => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                // 스크롤 시작 후, 애니메이션 클래스 제거 (다음 클릭을 위해)
                setTimeout(() => backToTopHoop.classList.remove('is-swishing'), 500);
            }, 150); // 애니메이션 시작 후 스크롤까지의 딜레이
        });
    }

    // --- (수정) Contact 섹션: "The Winning Pass" 드래그 앤 드롭 로직 ---
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
        const ball = document.getElementById('draggable-ball');
        const dropZones = contactSection.querySelectorAll('.drop-zone');
        const contactP = contactSection.querySelector('p');
        const originalPText = contactP.textContent; // 원래 텍스트 저장

        // 이메일 복사 로직을 별도 함수로 분리
        function copyEmailToClipboard(email) {
            navigator.clipboard.writeText(email).then(() => {
                contactP.textContent = 'EMAIL COPIED! NICE PASS!';
                setTimeout(() => {
                    contactP.textContent = originalPText;
                }, 2000);
            });
        }

        // --- 드래그 이벤트 (공) ---
        ball.addEventListener('dragstart', (e) => {
            document.body.classList.add('is-dragging');
            // (선택) 드래그 시작 시 가벼운 클릭 사운드
            // playSound('click-sound', 0.1); 
        });

        ball.addEventListener('dragend', () => {
            document.body.classList.remove('is-dragging');
        });

        // --- 드롭 존 이벤트 ---
        dropZones.forEach(zone => {
            zone.addEventListener('dragenter', (e) => {
                e.preventDefault();
                zone.classList.add('is-hovered');
            });

            zone.addEventListener('dragover', (e) => {
                e.preventDefault(); // 드롭을 허용하기 위해 필수
            });

            zone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                zone.classList.remove('is-hovered');
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('is-hovered');
                document.body.classList.remove('is-dragging');

                // "패스 성공!" 애니메이션 및 사운드
                zone.classList.add('is-successful');
                playSound('swish-sound', 0.7); // 🏀 골대 통과 사운드!!
                setTimeout(() => zone.classList.remove('is-successful'), 500);

                // ID에 따라 다른 액션 수행
                const actionId = zone.id;
                
                switch (actionId) {
                    case 'email-btn':
                        const email = zone.dataset.email;
                        copyEmailToClipboard(email);
                        break;
                    case 'linkedin-btn':
                    case 'github-btn':
                        // target="_blank" 속성이 이미 있으므로, 클릭을 시뮬레이션합니다.
                        // window.open(zone.href, '_blank'); // 이것도 가능
                        zone.click(); // HTML에 이미 target="_blank"가 있으므로 클릭 이벤트 강제 실행
                        break;
                }
            });
        });
    }

    // --- (수정) 커스텀 마우스 커서 로직: 농구공 이미지 커서 ---
    const customCursor = document.querySelector('.custom-cursor');    if (customCursor) {

        window.addEventListener('mousemove', function (e) {
            const posX = e.clientX;
            const posY = e.clientY;
            customCursor.style.left = `${posX}px`;
            customCursor.style.top = `${posY}px`;
        });
    }

    // 호버 효과를 적용할 요소들
    const hoverableElements = document.querySelectorAll(
        'a, button, .dynamic-profile' // (수정) jumbotron-controller 제거
    );
    hoverableElements.forEach((el) => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('cursor-hovered');

            // (수정) 컨트롤러 호버 시 클릭 사운드 재생
            if (el.classList.contains('modal-close')) {
                playSound('click-sound', 0.2);
            }
        });
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('cursor-hovered');
        });
    });

    // --- (추가) 아이디어 2: Contact 섹션 패럴랙스 효과 ---
    if (contactSection) {
        contactSection.addEventListener('mousemove', (e) => {
            const { clientX, clientY, currentTarget } = e;
            const { clientWidth, clientHeight } = currentTarget;

            const xPos = (clientX / clientWidth - 0.5) * 30; // 움직임 강도 (px)
            const yPos = (clientY / clientHeight - 0.5) * 20; // 움직임 강도 (px)

            // 가상 요소에 직접 접근할 수 없으므로, 부모 요소의 스타일을 통해 제어
            contactSection.style.setProperty('--bg-transform', `scale(1.1) translate(${xPos}px, ${yPos}px)`);
        });
    }

    // --- (추가) 아이디어 2: 커서 드리블 효과 ---
    document.addEventListener('click', function(e) {
        // 클릭된 요소가 링크, 버튼 등이 아닐 때만 드리블 효과 적용
        if (e.target.closest('a, button')) return;

        if (customCursor) {
            // 이미 애니메이션 중이면 중복 실행 방지
            if (customCursor.classList.contains('is-dribbling')) {
                customCursor.classList.remove('is-dribbling');
                // reflow 강제
                void customCursor.offsetWidth; 
            }
            customCursor.classList.add('is-dribbling');
            playSound('loader-dribble-video', 0.3); // 드리블 사운드 재활용

            // 애니메이션이 끝나면 클래스 제거
            setTimeout(() => {
                if (customCursor) { // customCursor가 여전히 존재하는지 확인
                    customCursor.classList.remove('is-dribbling');
                }
            }, 300);
        }
    });


});