document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  const cardPositions = [
    { top: "30%", left: "55%" },
    { top: "20%", left: "25%" },
    { top: "50%", left: "10%" },
    { top: "60%", left: "40%" },
    { top: "30%", left: "30%" },
    { top: "60%", left: "60%" },
    { top: "20%", left: "50%" },
    { top: "60%", left: "10%" },
    { top: "20%", left: "40%" },
    { top: "45%", left: "55%" },
  ];

  const cardPositionsMobile = [
    { top: "10%", left: "10%" },
    { top: "30%", left: "30%" },
    { top: "50%", left: "15%" },
    { top: "70%", left: "40%" },
    { top: "20%", left: "20%" },
    { top: "60%", left: "50%" },
    { top: "15%", left: "45%" },
    { top: "65%", left: "10%" },
    { top: "25%", left: "40%" },
    { top: "45%", left: "55%" },
  ];

  function init() {
    // Clear old triggers, tweens, and DOM
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    gsap.killTweensOf("*");
    document.querySelector(".images").innerHTML = "";

    const titlesContainer = document.querySelector(".titles");
    const moveDistance = window.innerWidth * 3;
    const isMobile = window.innerWidth <= 768;
    const imagesContainer = document.querySelector(".images");

    // Create cards
    for (let i = 0; i < 10; i++) {
      const card = document.createElement("div");
      const index = (i % 7) + 1;
      card.className = `card card-${i + 1}`;

      const img = document.createElement("img");
      img.src = `images/img${index}.webp`;
      img.alt = `Image ${i + 1}`;
      card.appendChild(img);

      const position = isMobile
        ? cardPositionsMobile[i % cardPositionsMobile.length]
        : cardPositions[i % cardPositions.length];
      card.style.top = position.top;
      card.style.left = position.left;
      imagesContainer.appendChild(card);
    }

    const cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
      gsap.set(card, {
        z: -50000,
        scale: 0,
      });
    });

    const cardSetters = Array.from(cards).map((card) => ({
      setScaleX: gsap.quickSetter(card, "scaleX", ""),
      setScaleY: gsap.quickSetter(card, "scaleY", ""),
    }));

    const setX = gsap.quickSetter(titlesContainer, "x", "px");

    const scrollEndDistance = isMobile
      ? window.innerHeight * 3
      : window.innerHeight * 5;

    ScrollTrigger.create({
      trigger: ".sticky",
      start: "top top",
      end: `+=${scrollEndDistance}px`,
      pin: true,
      scrub: 1,
      onUpdate: (self) => {
        const xPosition = -moveDistance * self.progress;
        setX(xPosition);

        const velocity = self.getVelocity();
        const normalizedVelocity = velocity / Math.abs(velocity) || 0;
        const maxOffset = isMobile ? 15 : 30;
        const directionOffset = isMobile ? 800 : 500;
        const currentSpeed = Math.min(
          Math.abs(velocity / directionOffset),
          maxOffset
        );
        const isAtEdge = self.progress <= 0 || self.progress >= 1;

        // Update titles with quickSetters and minimal tween usage
        document.querySelectorAll(".title").forEach((title) => {
          const title1 = title.querySelector(".title-1");
          const title2 = title.querySelector(".title-2");
          const title3 = title.querySelector(".title-3");

          if (isAtEdge) {
            gsap.to([title1, title2], {
              xPercent: -50,
              x: 0,
              duration: 0.5,
              ease: "power2.out",
              overwrite: true,
            });
          } else {
            const baseOffset = normalizedVelocity * currentSpeed;

            gsap.to(title1, {
              xPercent: -50,
              x: `${baseOffset * 4}px`,
              duration: 0.2,
              ease: "power1.out",
              overwrite: "auto",
            });

            gsap.to(title2, {
              xPercent: -50,
              x: `${baseOffset * 2}px`,
              duration: 0.2,
              ease: "power1.out",
              overwrite: "auto",
            });
          }

          gsap.set(title3, {
            xPercent: -50,
            x: 0,
          });
        });

        cards.forEach((card, index) => {
          const staggerOffset = index * 0.075;
          const scaledProgress = (self.progress - staggerOffset) * 3;
          const individualProgress = Math.max(0, Math.min(1, scaledProgress));
          const targetZ = isMobile
            ? 2000
            : index === cards.length - 1
            ? 1500
            : 2000;
          const newZ = -50000 + (targetZ + 50000) * individualProgress;
          const scaleProgress = Math.min(1, individualProgress * 10);
          const scale = Math.max(0, Math.min(1, scaleProgress));

          gsap.set(card, { z: newZ }); // Animate Z with GSAP set
          cardSetters[index].setScaleX(scale); // Optimize scaleX with quickSetter
          cardSetters[index].setScaleY(scale);
        });
      },
    });
  }

  init();

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      init();
    }, 100);
  });
});
