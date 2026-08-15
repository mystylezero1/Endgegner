export class AnimationEngine {
  constructor(canvasId) {
    this.canvasId = canvasId;
  }

  triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#F4E8C1', '#FFFFFF']
      });
    }
  }
}