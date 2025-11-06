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

    // (추가) 사운드 재생 헬퍼 함수
    function playSound(soundId, volume = 0.5) {
        const sound = document.getElementById(soundId);
        if (sound) {
            sound.currentTime = 0; // 재생 위치를 처음으로
            sound.volume = volume;
            sound.play().catch(e => console.log(`Audio play failed for ${soundId}: ${e}`));
        }
    }

    // (추가) 메인 콘텐츠 애니메이션 및 사운드를 시작하는 함수
    function startMainContentAnimations() {
        // (수정) JS로 애니메이션을 제어하기 위해 body에 클래스 추가
        document.body.classList.add('animations-started');

        // 인트로 텍스트 애니메이션 시작(0.8s)에 맞춰 사운드 재생
        setTimeout(() => {
            if (introSound) {
                playSound('intro-dribble-sound', 0.6);
            }
        }, 800);

        // 인트로 텍스트 애니메이션이 끝나는 시점(4s delay + 7s duration = 11s)에 맞춰 사운드 정지
        setTimeout(() => {
            const sound = document.getElementById('intro-dribble-sound');
            if (sound) sound.pause();
        }, 11000);

        // (수정) 인트로 애니메이션이 끝난 후 헤더, 홈 콘텐츠, 타이핑, 커서 애니메이션 순차 실행
        const header = document.getElementById('main-header');
        const homeContent = document.querySelector('.home-content-inner');

        // 11.5초: 헤더와 홈 콘텐츠 등장
        setTimeout(() => {
            if (header) header.style.animation = 'fadeInHeader 1s ease-out forwards';
            if (homeContent) homeContent.style.animation = 'fadeInHomeContent 1s ease-out forwards';
            if (customCursor) { // 커서 표시
                customCursor.style.transition = 'opacity 0.5s ease-out';
                customCursor.style.opacity = '1';
            }
            // 11.7초: 타이핑 시작 (홈 콘텐츠 등장 후 0.2초 뒤)
            if (typingElement) {
                typeWriter(typingElement, typingElement.dataset.text, 60);
            }
        }, 11500);
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
    
    // (삭제) 타이핑용 IntersectionObserver 코드 삭제됨

    // --- (기존) 능력치 그래프 애니메이션 ---
    // (추가) 스탯 애니메이션을 실행하는 재사용 가능한 함수
    function animateStats() {
        const statsSection = document.querySelector('#stats-section');
        if (!statsSection) return;

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
            skillWrappers.forEach(wrapper => {
                const valueEl = wrapper.querySelector('.skill-value');
                const barEl = wrapper.querySelector('.bar');
                const skillValue = barEl.getAttribute('data-skill');

                barEl.style.transition = 'height 3.7s cubic-bezier(.23,1,.32,1), background-position 3.7s ease-out'; // 트랜지션 복원
                barEl.style.height = skillValue + '%'; // 막대 그래프 애니메이션
                barEl.style.backgroundPosition = '0 0'; // (추가) 쉬머 애니메이션 시작
                countUp(valueEl, skillValue, 1500); // (수정) 숫자는 빠르게 1.5초로 변경
            });
        }, 100); // 리셋이 반영될 시간을 줌
    }

    // (추가) 숫자 카운팅 애니메이션 함수
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
        
        let statsAnimated = false; // (추가) 애니메이션 실행 상태를 추적하는 변수

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!statsAnimated) { // (수정) 애니메이션이 실행되지 않았을 때만 실행
                        animateStats();
                        statsAnimated = true;
                    }
                } else {
                    // (추가) 화면 밖으로 나가면 애니메이션 상태 초기화
                    statsAnimated = false;
                }
            });
        }, { threshold: 0.1 }); // (수정) 스탯 섹션이 10%만 보여도 실행되도록 변경
        observer.observe(statsSection);
    }

    // --- (수정) Works 섹션 프로젝트 순차 등장 애니메이션 ---
    const plays = document.querySelectorAll('.play');
    if (plays.length > 0) {
        const worksSectionForPlays = document.getElementById('works-section');

        const playbookObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 각 'play' 요소에 순차적으로 딜레이를 주어 is-visible 클래스 추가
                    plays.forEach((play, index) => {
                        play.style.transitionDelay = `${index * 0.2}s`; // 0.2초 간격으로 딜레이 설정
                        play.classList.add('is-visible');
                    });
                    playbookObserver.unobserve(worksSectionForPlays); // 한 번 실행 후 관찰 중지
                }
            });
        }, { threshold: 0.3 }); // Works 섹션이 30% 보일 때 실행
        playbookObserver.observe(worksSectionForPlays);
    }

    // --- (기존) 프로젝트 상세 정보 모달 로직 ---
    const viewButtons = document.querySelectorAll('.view-button');
    const modalOverlay = document.getElementById('project-modal');
    const modalCloseBtn = document.querySelector('.modal-close');

    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalCategory = document.getElementById('modal-category');
    const modalDescription = document.getElementById('modal-description');
    const modalRole = document.getElementById('modal-role');
    const modalTools = document.getElementById('modal-tools');

    viewButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();

            const img = this.dataset.img;
            const title = this.dataset.title;
            const category = this.dataset.category;
            const description = this.dataset.description;
            const role = this.dataset.role;
            const tools = this.dataset.tools;

            modalImg.src = img;
            modalTitle.textContent = title;
            modalCategory.textContent = category;
            modalDescription.innerHTML = description;
            modalRole.textContent = role;
            modalTools.textContent = tools;
            
            playSound('open-modal-sound', 0.4); // (추가) 모달 열기 사운드
            modalOverlay.classList.add('is-visible');
            document.body.style.overflow = 'hidden';
        });
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

            playSound('click-sound', 0.3); // (추가) 메뉴 클릭 사운드

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });

                // (추가) STATS 메뉴 클릭 시 애니메이션 재실행
                if (targetId === '#stats-section') {
                    animateStats();
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

    // --- (추가) 맨 위로 가기 버튼 로직 ---
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
            
            // (수정) 그물 흔들림(Swish) 애니메이션 실행
            backToTopHoop.classList.add('is-swishing');
            playSound('swish-sound', 0.7); // (추가) Swish 사운드 재생

            // 애니메이션(0.4s)이 끝난 후 스크롤 실행
            setTimeout(() => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                // 스크롤 시작 후, 애니메이션 클래스 제거 (다음 클릭을 위해)
                setTimeout(() => backToTopHoop.classList.remove('is-swishing'), 500);
            }, 150); // (수정) 애니메이션 시작 후 스크롤까지의 딜레이 미세 조정
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
        'a, button, .project-thumbnail, .dynamic-profile'
    );
    hoverableElements.forEach((el) => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('cursor-hovered');
        });
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('cursor-hovered');
        });
    });

    // (삭제) Contact 섹션 패럴랙스 효과 제거

    // --- (추가) 이메일 복사 기능 ---
    const emailBtn = document.getElementById('email-btn');
    if (emailBtn) {
        emailBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const email = emailBtn.dataset.email;
            navigator.clipboard.writeText(email).then(() => {
                // 임시 알림 메시지 생성
                const alertBox = document.createElement('div');
                alertBox.textContent = '이메일 주소가 복사되었습니다!';
                alertBox.style.cssText = 'position: fixed; bottom: 90px; right: 30px; background-color: var(--frontend-color); color: #111; padding: 12px 20px; border-radius: 8px; z-index: 10002; opacity: 0; transition: opacity 0.3s; font-family: "Inter", sans-serif;';
                document.body.appendChild(alertBox);
                
                setTimeout(() => { alertBox.style.opacity = '1'; }, 10); // Fade in
                setTimeout(() => { alertBox.style.opacity = '0'; }, 2000); // Fade out
                setTimeout(() => { document.body.removeChild(alertBox); }, 2300); // Remove from DOM
            });
        });
    }
});