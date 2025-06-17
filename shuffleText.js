function shuffleString(str) {
  const arr = str.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}

function enableHoverShuffleByClass(className, interval = 200) {
  const elements = document.querySelectorAll(`.${className}`);

  elements.forEach(element => {
    const originalText = element.textContent;
    let shuffleInterval = null;

    element.addEventListener("mouseenter", () => {
      shuffleInterval = setInterval(() => {
        element.textContent = shuffleString(originalText);
      }, interval);
    });

    element.addEventListener("mouseleave", () => {
      clearInterval(shuffleInterval);
      element.textContent = originalText;
    });
  });
}
