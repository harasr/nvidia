export class InputManager {
  isPressed: boolean = false;
  justPressed: boolean = false;
  justReleased: boolean = false;

  private rawPressed: boolean = false;
  private prevPressed: boolean = false;

  private attachedElement: HTMLElement | Window | null = null;

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      // Prevent browser scroll on space/arrow
      e.preventDefault();
      this.rawPressed = true;
    }
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      e.preventDefault();
      this.rawPressed = false;
    }
  };

  private handleMouseDown = (e: MouseEvent): void => {
    if (e.button === 0) {
      this.rawPressed = true;
    }
  };

  private handleMouseUp = (e: MouseEvent): void => {
    if (e.button === 0) {
      this.rawPressed = false;
    }
  };

  private handleTouchStart = (e: TouchEvent): void => {
    if (e.touches.length > 0) {
      this.rawPressed = true;
    }
  };

  private handleTouchEnd = (_e: TouchEvent): void => {
    this.rawPressed = false;
  };

  attach(element: HTMLElement | Window = window): void {
    this.detach();
    this.attachedElement = element;

    window.addEventListener('keydown', this.handleKeyDown, { passive: false });
    window.addEventListener('keyup', this.handleKeyUp, { passive: false });

    element.addEventListener('mousedown', this.handleMouseDown as EventListener);
    window.addEventListener('mouseup', this.handleMouseUp as EventListener);

    element.addEventListener('touchstart', this.handleTouchStart as EventListener, { passive: true });
    window.addEventListener('touchend', this.handleTouchEnd as EventListener);
    window.addEventListener('touchcancel', this.handleTouchEnd as EventListener);
  }

  detach(): void {
    if (!this.attachedElement) return;

    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);

    this.attachedElement.removeEventListener('mousedown', this.handleMouseDown as EventListener);
    window.removeEventListener('mouseup', this.handleMouseUp as EventListener);

    this.attachedElement.removeEventListener('touchstart', this.handleTouchStart as EventListener);
    window.removeEventListener('touchend', this.handleTouchEnd as EventListener);
    window.removeEventListener('touchcancel', this.handleTouchEnd as EventListener);

    this.attachedElement = null;
    this.rawPressed = false;
    this.isPressed = false;
    this.justPressed = false;
    this.justReleased = false;
  }

  /**
   * Called once per frame in GameLoop before physics update
   */
  update(): void {
    this.isPressed = this.rawPressed;
    this.justPressed = !this.prevPressed && this.rawPressed;
    this.justReleased = this.prevPressed && !this.rawPressed;
    this.prevPressed = this.rawPressed;
  }

  reset(): void {
    this.rawPressed = false;
    this.isPressed = false;
    this.justPressed = false;
    this.justReleased = false;
    this.prevPressed = false;
  }
}
